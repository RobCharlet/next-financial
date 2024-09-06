"use client"

import { useState } from "react"

import { useCreateLinkToken } from "@/features/plaid/api/use-create-link-token"
import { Button } from "@/components/ui/button"
import { useMount } from "react-use"

export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null)

  //https://plaid.com/docs/quickstart/#how-it-works
  const createLinkToken = useCreateLinkToken()

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: ({ data }) => {
        setToken(data)
      }
    })
  })

  return (
    <Button 
      size="sm" 
      variant="ghost"
      // Disabled until getting a Plaid token
      disabled={!token}
      >
      Connect
    </Button>
  )
}