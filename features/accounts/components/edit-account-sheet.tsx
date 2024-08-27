import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountForm } from "./account-form"
import { insertAccountSchema } from "@/db/schema"
import { useGetAccount } from "@/features/accounts/api/use-get-account"
import { useEditAccount } from "@/features/accounts/api/use-edit-account"
import { useDeleteAccount } from "@/features/accounts//api/use-delete-account"
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account"
import { useConfirm } from "@/hooks/use-confirm"


// Define the schema for the form using Zod
const formSchema = insertAccountSchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

export const EditAccountSheet = () => {
  const {isOpen, onClose, id} = useOpenAccount() 

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sur?",
    "You are about to delete the transaction"
  )

  const accountQuery = useGetAccount(id)
  const editMutation = useEditAccount(id)
  const deleteMutation = useDeleteAccount(id)

  const isPending = accountQuery.isPending || deleteMutation.isPending
  const isLoading = accountQuery.isLoading
  
  const onSubmit = (values: FormValues) => {  
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const onDelete = async () => {
    const ok =  await confirm()

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  } 

  const defaultValues = accountQuery.data ? {
    name: accountQuery.data.name
  } : {
    name: ""
  }

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>
              Edit account
            </SheetTitle>
            <SheetDescription>
              Edit an existing account
            </SheetDescription>
          </SheetHeader> 
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <AccountForm
              id={id}
              defaultValues={defaultValues}
              onSubmit={onSubmit} 
              disabled={isPending}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}