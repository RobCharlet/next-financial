import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import accounts from './accounts'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

// Routes must be chained to be generated by the RPC type.
// https://hono.dev/docs/guides/rpc#using-rpc-with-larger-applications
const routes = app
  .route("/accounts", accounts)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)

export type AppType = typeof routes