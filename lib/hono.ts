// RPC client
// This file sets up a typed RPC client using Hono's client utilities. 
// The `client` instance allows for making secure, type-safe HTTP requests to the API, 
// with TypeScript automatically inferring the correct types based on the API routes.
// This ensures that the client calls match the server-side API, reducing the risk of errors.
import { AppType } from "@/app/api/[[...route]]/route";
import { hc } from "hono/client";

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!);