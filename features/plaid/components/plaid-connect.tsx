"use client"

import { useState } from "react"
import { useMount } from "react-use"
import { usePlaidLink } from "react-plaid-link"

import { useCreateLinkToken } from "@/features/plaid/api/use-create-link-token"
import { useExchangePublicToken } from "@/features/plaid/api/use-exchange-public-token"
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall"

import { Button } from "@/components/ui/button"


export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null)

  //https://plaid.com/docs/quickstart/#how-it-works
  const createLinkToken = useCreateLinkToken()
  const exchangePublicToken = useExchangePublicToken()
  const {
    shouldBlock,
    isLoading: isLoadingPaywall,
    triggerPaywall
  } = usePaywall()

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
    if (shouldBlock) {
      triggerPaywall()
      return
    } 

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
      disabled={isDisabled || isLoadingPaywall}
      >
      Connect
    </Button>
  )
}