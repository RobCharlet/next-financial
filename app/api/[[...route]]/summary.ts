import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { differenceInDays, parse, subDays } from "date-fns";
import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";


const app = new Hono()
  .get(
    "/",
    // Middleware for authentication using Clerk
    clerkMiddleware(),
    // Validation of query parameters using zod
    zValidator("query", 
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional()
      })
    ),
    async (c) => {
      const auth = getAuth(c)
      const {from, to, accountId} = c.req.valid("query")

      if (!auth?.userId) {
        return c.json({error: "unauthorized"}, 401)
      }

      // Default date range: last 30 days if not provided in query
      const defaultTo = new Date()
      const defaultFrom = subDays(defaultTo, 30)

      const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo

      // Calculate the length of the current period and the previous period
      const periodLength = differenceInDays(endDate, startDate) + 1
      const lastPeriodStart = subDays(startDate, periodLength)
      const lastPeriodEnd = subDays(endDate, periodLength)

      // Function to fetch financial data (income, expenses, remaining) for a given period
      async function fetchFinancialData(
        userId: string,
        startDate: Date,
        endDate: Date,
      ) {
        return await db
          .select({
            // Calculate the total income (sum of positive amounts)
            income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
            // Calculate the total expenses (sum of negative amounts)
            expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
            // Calculate the remaining balance (sum of all amounts)
            remaining: sum(transactions.amount).mapWith(Number)
          })
          .from(transactions)
          // Join on accountId
          .innerJoin( 
            accounts,
            eq(
              transactions.accountId,
              accounts.id
            )
          )
          .where(
            and(
              accountId ? eq(transactions.accountId, accountId) : undefined,
              eq(accounts.userId, userId),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate),
            )
          )
      }

      // Fetch financial data for the current period
      const [currentPeriod] = await fetchFinancialData(
        auth.userId,
        startDate,
        endDate
      )

      // Fetch financial data for the previous period
      const [lastPeriod] = await fetchFinancialData(
        auth.userId,
        lastPeriodStart,
        lastPeriodEnd
      )

      // Calculate percentage changes between the two periods
      const incomeChange = calculatePercentageChange(
        currentPeriod.income,
        lastPeriod.income
      )

      const expensesChange = calculatePercentageChange(
        currentPeriod.expenses,
        lastPeriod.expenses
      )

      const remainingChange = calculatePercentageChange(
        currentPeriod.remaining,
        lastPeriod.remaining
      )

      // Query to get spending by category
      const category = await db
        .select({
          name: categories.name,
          // Get the total value of transactions in the category
          value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number)
        })
        .from(transactions)
        // Join on accountId
        .innerJoin(
          accounts,
          eq(
            transactions.accountId, 
            accounts.id
          )
        )
        // Join on categoryId
        .innerJoin(
          categories,
          eq(
            transactions.categoryId, 
            categories.id
          )
        )
        .where(
          and(
            // Filter by accountId if provided
            accountId ? eq(transactions.accountId, accountId) : undefined,
            // Filter by user ID
            eq(accounts.userId, auth.userId),
            // Only include expenses (negative amounts)
            lt(transactions.amount, 0),
            // Start date filter
            gte(transactions.date, startDate),
            // End date filter
            lte(transactions.date, endDate),
          )
        )
        .groupBy(categories.name)
        .orderBy(desc(
          // Order by the total spent in descending order
          sql`SUM(ABS(${transactions.amount}))`
        ))
      
      // Process categories into top categories and "Other"
      // Top 3 categories by spending
      const topCategories = category.slice(0, 3)
      // Remaining categories
      const otherCategories = category.slice(3)
      // Sum of "Other" categories
      const otherSum = otherCategories
        .reduce((sum, current) => sum + current.value, 0)
      
      // If there are more than 3 categories, add "Other" 
      // as a summary of the remaining categories
      const finalCategories = topCategories
      if (otherCategories.length > 0) {
        finalCategories.push({
          name: "Other",
          value: otherSum
        })
      }

      // Query to get daily income and expenses over the date range
      const activeDays = await db
        .select({
          date: transactions.date,
          // Sum of income (positive amounts)
          income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 
            THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
          // Sum of expenses (negative amounts)
          expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 
          THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number)
        })
        .from(transactions)
        // Join on accountId
        .innerJoin(
          accounts,
          eq(
            transactions.accountId, 
            accounts.id
          )
        )
        // Join on categoryId
        .innerJoin(
          categories,
          eq(
            transactions.categoryId, 
            categories.id
          )
        )
        .where(
          and(
            accountId ? 
              eq(transactions.accountId, accountId) : undefined,
              eq(accounts.userId, auth.userId),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate),
          )
        )
        .groupBy(transactions.date)
        .orderBy(transactions.date)
      
      // Fill in missing days with zero income/expenses
      // Needed for the graph process
      const days = fillMissingDays(
        activeDays,
        startDate,
        endDate
      )

      return c.json({
        data: {
          remainingAmount: currentPeriod.remaining,
          remainingChange,
          incomeAmount: currentPeriod.income,
          incomeChange,
          expensesAmount: currentPeriod.expenses,
          expensesChange,
          categories: finalCategories,
          days
        }
      })
    }
  )

export default app