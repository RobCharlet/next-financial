import { pgTable, text } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull()
})

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

export const insertCategorySchema = createInsertSchema(categories)