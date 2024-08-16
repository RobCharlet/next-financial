import { z } from "zod"
import { useNewAccount } from "@/features/accounts/hooks/use-new-account"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountForm } from "./account-form"
import { insertAccountSchema } from "@/db/schema"

// Define the schema for the form using Zod
const formSchema = insertAccountSchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

export const NewAccountSheet = () => {
  const {isOpen, onClose} = useNewAccount() 

  const onSubmit = (values: FormValues) => {
    console.log({values})
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
          disabled={false} 
        />
      </SheetContent>
    </Sheet>
  )
}