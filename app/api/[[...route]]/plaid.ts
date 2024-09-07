import { z } from "zod"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { db } from "@/db/drizzle"
import { 
  Configuration, 
  CountryCode, 
  PlaidApi, 
  PlaidEnvironments,
  Products
} from "plaid"
import { connectedBanks } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

const configuration = new Configuration({
  // Axios configuration
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_TOKEN,
      "PLAID-SECRET": process.env.PLAID_SECRET_TOKEN,
    }
  }
})

const client = new PlaidApi(configuration)

const app = new Hono()
  .post(
    // https://plaid.com/docs/quickstart/#how-it-works

    "/create-link-token",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      // https://plaid.com/docs/api/link/#linktokencreate
      // Call /link/token/create to create a link_token and 
      // pass the temporary token to your app's client.
      // linkTokenCreate use Axios (incompatible with edge runtime)
      const token = await client.linkTokenCreate({
        user: {
          client_user_id: auth.userId
        },
        client_name: "Finance tutorial",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en" 
      })

      return c.json({ data: token.data.link_token }, 200)
    },
  )
  .post(
    // https://plaid.com/docs/quickstart/#how-it-works
    "/exchange-public-token",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        publicToken: z.string()
      })
    ),
    async (c) => {
      const auth = getAuth(c)
      const { publicToken } = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      
      const exchange = await client.itemPublicTokenExchange({
        public_token: publicToken
      })

      const [connected] = await db
        .insert(connectedBanks)
        .values({
          id: createId(),
          userId: auth.userId,
          accessToken: publicToken
        })
        .returning()

      return c.json({ data: exchange.data.access_token }, 200)
    },
  )

  export default app