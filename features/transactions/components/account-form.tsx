import { z } from "zod"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { insertAccountSchema } from "@/db/schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Define the schema for the form using Zod
// Zod is a schema validation library
const formSchema = insertAccountSchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

// Define the props for the AccountForm component
type Props = {
  id?: string,
  defaultValues?: FormValues,
  onSubmit: (values: FormValues) => void,
  onDelete?: () => void,
  disabled?: boolean
}

// Define the AccountForm component
export const AccountForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled
}: Props) => {
  // Initialize the form using React Hook Form with Zod schema validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })
  
  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  const handleDelete = () => {
    onDelete?.()
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4 pt-4">
          <FormField 
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={disabled}
                    placeholder="e.g. Cash, Bank, Credit Card"
                    {...field}
                    />
                </FormControl>
              </FormItem>
            )}
      />
        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create account"}
        </Button>

        {!!id && (<Button 
          type="button" 
          disabled={disabled}
          onClick={handleDelete}
          className="w-full"
          variant="outline"
        >
          <Trash className="size-4" />
          Delete account
        </Button>)
        }
      </form>
    </Form>
  )
}