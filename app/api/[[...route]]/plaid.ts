import { z } from "zod"
import { Hono } from "hono"
import { and, eq, isNotNull } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { zValidator } from "@hono/zod-validator"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { 
  Configuration, 
  CountryCode, 
  PlaidApi, 
  PlaidEnvironments, 
  Products
} from "plaid"

import { db } from "@/db/drizzle"
import { 
  accounts, 
  categories, 
  connectedBanks, 
  transactions
} from "@/db/schema"
import { convertAmountToMiliunits } from "@/lib/utils"

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_TOKEN,
      "PLAID-SECRET": process.env.PLAID_SECRET_TOKEN,
    },
  },
})

const client = new PlaidApi(configuration)

const app = new Hono()
  .get(
    "/connected-bank",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const [connectedBank] = await db
      .select()
      .from(connectedBanks)
      .where(
        eq(connectedBanks.userId, auth?.userId)
      )

      return c.json({data: connectedBank || null}) 
    },
  )
  .delete(
    "/connected-bank",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const [connectedBank] = await db
      .delete(connectedBanks)
      .where(
        eq(connectedBanks.userId, auth?.userId)
      )
      .returning({
        id: connectedBanks.id
      })

      if (!connectedBank) {
        return c.json({error: "Not found"}, 404)
      }

      await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.userId, auth.userId),
          isNotNull(accounts.plaidId)
        )
      )

      await db
      .delete(categories)
      .where(
        and(
          eq(categories.userId, auth.userId),
          isNotNull(categories.plaidId)
        )
      )

      return c.json({data: connectedBank || null}) 
    },
  )
  .post(
    "/create-link-token",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const token = await client.linkTokenCreate({
        user: {
          client_user_id: auth.userId,
        },
        client_name: "Finance Tutorial",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en",
      })

      return c.json({ data: token.data.link_token }, 200)
    },
  )
  .post(
    "/exchange-public-token",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        publicToken: z.string(),
      }),
    ),
    async (c) => {
      const auth = getAuth(c)
      const { publicToken } = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      // Exchange the public token for an access token using Plaid's API
      const exchange = await client.itemPublicTokenExchange({
        public_token: publicToken,
      })

      // Insert the new connected bank into the database
      // TODO: Check if bank already exists
      const [connectedBank] = await db
      .insert(connectedBanks)
      .values({
        id: createId(),
        userId: auth.userId, // Associate the bank with the authenticated user
        accessToken: exchange.data.access_token, // Store the access token returned by Plaid
      })
      .returning()

      // Fetch the user's transactions from Plaid using the access token
      const plaidTransactions = await client.transactionsSync({
        access_token: connectedBank.accessToken,
      })

      // Fetch the user's accounts from Plaid using the access token
      const plaidAccounts = await client.accountsGet({
        access_token: connectedBank.accessToken,
      })

      // Fetch Plaid's transaction categories 
      // (this endpoint doesn't require an access token)
      const plaidCategories = await client.categoriesGet({})

      // Insert the fetched accounts into the database
      const newAccounts = await db
        .insert(accounts)
        .values(
          plaidAccounts.data.accounts.map((account) => ({
            id: createId(),
            name: account.name, // Account name from Plaid
            plaidId: account.account_id, // The Plaid account ID
            userId: auth.userId, // Associate the account with the authenticated user
          })),
        )
        .returning()
      
      // Insert the fetched categories into the database
      const newCategories = await db
        .insert(categories)
        .values(
          plaidCategories.data.categories.map((category) => ({
            id: createId(),
            name: category.hierarchy.join(", "), // Create a string from the category hierarchy
            plaidId: category.category_id, // The Plaid category ID
            userId: auth.userId, // Associate the category with the authenticated user
          })),
        )
        .returning()
      
      // Prepare transactions to be inserted into the database
      const newTransactionsValues = plaidTransactions.data.added
        .reduce((acc, transaction) => {
          const account = newAccounts
            // Find the matching account in the newAccounts array
            .find((account) => account.plaidId === transaction.account_id)
          const category = newCategories
          // Find the matching category in the newCategories array
            .find((category) => category.plaidId === transaction.category_id)
          // Convert the transaction amount to miliunits for precision
          const amountInMiliunits = convertAmountToMiliunits(
            transaction.amount,
          )

          // If the account exists, prepare the transaction for insertion
          if (account) {
            acc.push({
              id: createId(),
              amount: amountInMiliunits, // Store the transaction amount
              payee: transaction.merchant_name || transaction.name, // Store the payee or transaction name
              notes: transaction.name, // Store the transaction name as notes
              date: new Date(transaction.date), // Store the transaction date
              accountId: account.id, // Associate the transaction with the account
              categoryId: category?.id, // Optionally associate the transaction with a category,
            })
          }
          
          return acc
        }, [] as typeof transactions.$inferInsert[]) // Initialize the array of transaction inserts

      // Insert the transactions into the database if there are any
      if (newTransactionsValues.length > 0) {
        await db
          .insert(transactions)
          .values(newTransactionsValues)
      }

      return c.json({ ok: true }, 200)
    },
  )

export default app
