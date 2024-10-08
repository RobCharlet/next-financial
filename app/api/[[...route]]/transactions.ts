import { z } from "zod"
import { Hono } from "hono"
import { eq, inArray, and, gte, lte, desc, sql } from "drizzle-orm"
import { parse, subDays } from "date-fns"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { createId } from "@paralleldrive/cuid2"

import { transactions, insertTransactionSchema, categories, accounts } from "@/db/schema"

// Routes must be chained to be generated by the RPC type.
// https://hono.dev/docs/guides/rpc#using-rpc-with-larger-applications
const app = new Hono()
  .get(
    "/",
    zValidator("query", z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional()
    })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)
      const { from, to, accountId } = c.req.valid("query")

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      // If we don't have any filter, we'll' only display the last 30 days
      const defaultTo = new Date()
      //https://date-fns.org/v3.6.0/docs/subDays
      const defaultFrom = subDays(defaultTo, 30)

      //https://date-fns.org/v3.6.0/docs/parse
      const startDate = from 
      ? parse(from, "yyyy-MM-dd", new Date()) 
      : defaultFrom

      const endDate = to 
      ? parse(to, "yyyy-MM-dd", new Date()) 
      : defaultTo

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId
        })
        .from(transactions)
        // Get only transactions with accounts (mandatory)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        // Get transactions even without categories (can be null)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            // We only want to load transactions with the accountId if we have one if not skip
            accountId ? eq(transactions.accountId, accountId): undefined,
            // thanks to .innerJoin(accounts...)
            eq(accounts.userId, auth.userId),
            // Greater than or equal
            gte(transactions.date, startDate),
            // Lesser than or equal
            lte(transactions.date, endDate),
          )
        )
        .orderBy(desc(transactions.date))

      return c.json({data})
    })
  .get(
    "/:id",
    zValidator("param", z.object({
      id: z.string().optional(),
    })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")

      if (!id) {
        return c.json({error: "Missing id"}, 400)
      }

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const [data] = await db
      // .select automaticaly returns data.
      .select({
        id: transactions.id,
        date: transactions.date,
        categoryId: transactions.categoryId,
        payee: transactions.payee,
        amount: transactions.amount,
        notes: transactions.notes,
        accountId: transactions.accountId
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(transactions.id, id),
          eq(accounts.userId, auth.userId),
        )
      )

      if (!data) {
        return c.json({error: "Not found"}, 404)
      }

      return c.json({data})
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    // Get the schema created with createInsertSchema.
    // Get all fields except id.
    zValidator("json", insertTransactionSchema.omit({
      id: true
    })),
    async (c) => {
      const auth = getAuth(c)
      const values = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const [data] = await db.insert(transactions).values({
        id: createId(),
        ...values
      })
      // insert() don't return anything by default, so we need to
      // chain returning() to fill data.
      .returning()

      return c.json({ data })
    })
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator(
      "json",
      // An array of transactions 
      z.array(
        insertTransactionSchema.omit({
          id: true
        })
      )
    ),
    async(c) => {
      const auth = getAuth(c)
      const values = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({error: "unauthorized"}, 401)
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value
          }))
        )
        .returning()

      return c.json({data})
    }
  )
  .post(
    "/bulk-delete", 
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string())
      })
    ),
    async (c) => {
      const auth = getAuth(c)
      // Id values we want to delete
      const values = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }
      
      // Chained query
      // This query give us the list of transaction ids which
      // have an account, where the id is in the checkbox selected values
      // and where the account userId correspond to the auth user id
      //https://orm.drizzle.team/docs/delete#with-delete-clause
      const transactionsToDelete = db.$with("transaction_to_delete").as(
        db.select({id: transactions.id}).from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(
          inArray(transactions.id, values.ids),
          eq(accounts.userId, auth.userId)
        ))
      )

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
        )
        .returning({
          id: transactions.id
        })
      
        return c.json({data})
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    // Validate the id param
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    // Validate values
    zValidator(
      "json", 
      insertTransactionSchema.omit({
      id: true
    })),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")
      const values = c.req.valid("json")

      if (!id) {
        return c.json({error: "Missing id"}, 400)
      }

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const transactionsToUpdate = db.$with("transactions_to_update").as(
        db.select({id: transactions.id})
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            // Param id
            eq(transactions.id, id),
            eq(accounts.userId, auth.userId)
          )
        )
      )

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(transactions.id, sql`(select id from ${transactionsToUpdate})`)
        )
        // set does not automatically return results
        .returning()

      if (!data) {
        return c.json({error: "Not found"}, 404)
      }

      return c.json({ data })
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    // Validate the id param
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")

      if (!id) {
        return c.json({error: "Missing id"}, 400)
      }

      if (!auth?.userId) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const transactionsToDelete = db.$with("transaction_to_delete").as(
        db.select({id: transactions.id}).from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            // Param id
            eq(transactions.id, id),
            eq(accounts.userId, auth.userId)
          )
        )
      )

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
        )
        // set does not automatically return results
        .returning({
          id: transactions.id
        })

      if (!data) {
        return c.json({error: "Not found"}, 404)
      }

      return c.json({ data })
    }
  )


export default app