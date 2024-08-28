import { z } from "zod"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CategoryForm } from "@/features/categories/components/category-form"
import { insertCategorySchema } from "@/db/schema"
import { useNewCategory } from "@/features/categories/hooks/use-new-category"
import { useCreateCategory } from "@/features/categories/api/use-create-category"

// Define the schema for the form using Zod
const formSchema = insertCategorySchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

export const NewCategorySheet = () => {
  const {isOpen, onClose} = useNewCategory() 

  const mutation = useCreateCategory()

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
            New Category
          </SheetTitle>
          <SheetDescription>
            Create a new category to organize your transaction
          </SheetDescription>
        </SheetHeader>
        <CategoryForm
          defaultValues={{name: ""}}
          onSubmit={onSubmit} 
          disabled={mutation.isPending} 
        />
      </SheetContent>
    </Sheet>
  )
}