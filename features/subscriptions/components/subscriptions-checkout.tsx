"use client"

import { Button } from "@/components/ui/button"
import { useCheckoutSubscription } from "@/features/subscriptions/api/use-checkout-subscription"
import { useGetSubscription } from "@/features/subscriptions/api/use-get-subscription"


export const SubscriptionCheckout = () => {
  
  const checkout = useCheckoutSubscription()
  const {
    data: subscription, 
    isLoading: isLoadingSubscription 
  } = useGetSubscription()

  return (
    <Button 
      size="sm" 
      variant="ghost"
      onClick={()=>{checkout.mutate()}}
      disabled={checkout.isPending || isLoadingSubscription}
      >
      {subscription ? "Manage" : "Upgrade"}
    </Button>
  )
}