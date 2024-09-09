"use client"

import { useState } from "react"
import { useMount } from "react-use"
import { usePlaidLink } from "react-plaid-link"

import { useCreateLinkToken } from "@/features/plaid/api/use-create-link-token"
import { useExchangePublicToken } from "@/features/plaid/api/use-exchange-public-token"

import { Button } from "@/components/ui/button"


export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null)

  //https://plaid.com/docs/quickstart/#how-it-works
  const createLinkToken = useCreateLinkToken()
  const exchangePublicToken = useExchangePublicToken()

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: ({ data }) => {
        setToken(data)
      }
    })
  })

  // Get Plaid public token with link token.
  // publicToken will be available after completing 
  const plaid = usePlaidLink({
    token: token,
    onSuccess: (publicToken) => {
      exchangePublicToken.mutate({
        publicToken
      })
    },
    env: "sandbox"
  })

  // Open Plaid connection modal 
  const onClick = () => {
    plaid.open()
  }

  const isDisabled = 
    !plaid.ready ||
    exchangePublicToken.isPending

  return (
    <Button 
      size="sm" 
      variant="ghost"
      onClick={onClick}
      // Disabled until getting a Plaid token
      disabled={isDisabled}
      >
      Connect
    </Button>
  )
}