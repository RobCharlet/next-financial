"use client"

import { Button } from "@/components/ui/button"
import { useCheckoutSubscription } from "../api/use-checkout-subscription"


export const SubscriptionCheckout = () => {
  
  const checkout = useCheckoutSubscription()

  return (
    <Button 
      size="sm" 
      variant="ghost"
      onClick={()=>{checkout.mutate()}}
      // Disabled until getting a Plaid token
      disabled={checkout.isPending}
      >
      Upgrade
    </Button>
  )
}