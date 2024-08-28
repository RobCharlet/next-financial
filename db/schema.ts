import { z } from "zod"
import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull()
})

//https://orm.drizzle.team/docs/rqb#one-to-many
export const accountsRelations = relations(accounts, ({ many }) => ({
  // An account could have many transactions
  transactions: many(transactions)
}))

// https://orm.drizzle.team/docs/zod
// insertAccountSchema is a Zod schema generated from the categories table definition.
// It is used to validate incoming data before inserting it into the categories table,
// ensuring that the data conforms to the expected structure and includes all required fields.
// This helps prevent errors and maintain data integrity in the application.
export const insertAccountSchema = createInsertSchema(accounts)

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull()
})

//https://orm.drizzle.team/docs/rqb#one-to-many
export const categoriesRelations = relations(categories, ({ many }) => ({
  // A category could have many transactions
  categories: many(categories)
}))

export const insertCategorySchema = createInsertSchema(categories)

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  // We use integer cause float introduces precision issues in calculation
  // and decimal does not exists in JS (will be parsed as string)
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }). notNull(),
  // References accounts id
  accountId: text("account_id").references(() => accounts.id, {
    // Delete transactions if referenced account is removed
    onDelete: "cascade"
  }).notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null"
  })
})

//https://orm.drizzle.team/docs/rqb#one-to-many
export const transactionsRelations = relations(transactions, ({ one }) => ({
  accounts: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id]
  }),
  categories: one(categories, {
    fields: [transactions.accountId],
    references: [categories.id]
  })
}))

// When validating `input` with `insertTransactionSchema`, 
// the `date` field (can be a string or a timestamp) will be coerced into 
// a Date object if possible.
export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date()
})