"use client"

import { useExchangePublicToken } from "@/features/plaid/api/use-exchange-public-token"

import { Button } from "@/components/ui/button"
import { useDeleteConnectedBank } from "@/features/plaid/api/use-delete-connected-bank"
import { useConfirm } from "@/hooks/use-confirm"


export const PlaidDisconnect = () => {
  const deleteConnectedBank = useDeleteConnectedBank()
  const [Dialog, confirm] = useConfirm(
    "Are you sure?",
    "This will disconnect your bank account, and remove all associated data"
  )

  const onClick = async () => {
    const ok = await confirm()

    if (ok) {
      deleteConnectedBank.mutate()
    }
  }

  return (
    <>
      <Dialog />
      <Button 
        size="sm" 
        variant="ghost"
        onClick={onClick}
        // Disabled until getting a Plaid token
        disabled={deleteConnectedBank.isPending}
        >
        Disconnect
      </Button>
    </>
  )
}