import { useGetSubscription } from "../api/use-get-subscription"
import { useSubscriptionModal } from "./use-subscription-modal"

export const usePaywall = () => {
  const subscriptionModal = useSubscriptionModal()
  const {
    data: subscription,
    isLoading: isLoadingSubscription
  } = useGetSubscription()

  // Not checking "active" status cause we need to provide for a month
  // and not cancel immediately
  const shouldBlock = !subscription ||subscription.status === "expired"

  return {
    isLoading: isLoadingSubscription,
    shouldBlock,
    triggerPaywall: () => {
      subscriptionModal.onOpen()
    }
  }
}