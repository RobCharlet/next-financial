import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { insertCategorySchema } from "@/db/schema"
import { useConfirm } from "@/hooks/use-confirm"
import { useGetCategory } from "@/features/categories/api/use-get-category"
import { useEditCategory } from "@/features/categories/api/use-edit-category"
import { useDeleteCategory } from "@/features/categories/api/use-delete-category"
import { useOpenCategory } from "@/features/categories/hooks/use-open-category"
import { CategoryForm } from "@/features/categories/components/category-form"


// Define the schema for the form using Zod
const formSchema = insertCategorySchema.pick({
  name: true,
})

// Type for the form values based on the schema
type FormValues = z.input<typeof formSchema>

export const EditCategorySheet = () => {
  const {isOpen, onClose, id} = useOpenCategory() 

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete the category."
  )

  const categoryQuery = useGetCategory(id)
  const editMutation = useEditCategory(id)
  const deleteMutation = useDeleteCategory(id)

  const isPending = categoryQuery.isPending || deleteMutation.isPending
  const isLoading = categoryQuery.isLoading
  
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

  const defaultValues = categoryQuery.data ? {
    name: categoryQuery.data.name
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
              Edit category
            </SheetTitle>
            <SheetDescription>
              Edit an existing category
            </SheetDescription>
          </SheetHeader> 
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <CategoryForm
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