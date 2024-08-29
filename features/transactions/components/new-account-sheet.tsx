import { z } from "zod"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountForm } from "@/features/accounts/components/account-form"
import { insertAccountSchema } from "@/db/schema"
import { useNewAccount } from "@/features/accounts/hooks/use-new-account"
import { useCreateAccount } from "@/features/accounts/api/use-create-account"

// Define the schema for the form using Zod
const formSchema = insertAccountSchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

export const NewAccountSheet = () => {
  const {isOpen, onClose} = useNewAccount() 

  const mutation = useCreateAccount()

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>
            New Account
          </SheetTitle>
          <SheetDescription>
            Create a new account to track your transaction
          </SheetDescription>
        </SheetHeader>
        <AccountForm 
          defaultValues={{name: ""}}
          onSubmit={onSubmit} 
          disabled={mutation.isPending} 
        />
      </SheetContent>
    </Sheet>
  )
}