"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { transactions as transactionSchema } from "@/db/schema"
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions"
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions"
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
import { useSelectAccount } from "@/features/transactions/hooks/use-select-account"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//https://ui.shadcn.com/docs/components/data-table
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadButton } from "./upload-button"
import { columns } from "./columns"
import { ImportCard } from "./import-card"

enum VARIANTS {
  // Default view
  LIST = "LIST",
  // Import view
  IMPORT = "IMPORT"
} 

const INITAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {}
}

const TransactionsPage = () => {  
  // CSV importer
  const [AccountDialog, confirm] =  useSelectAccount()
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
  const [importsResults, setImportResults] = useState(INITAL_IMPORT_RESULTS)

  const onUpload = (results: typeof INITAL_IMPORT_RESULTS) => {
    setImportResults(results)
    setVariant(VARIANTS.IMPORT)
  }

  const onCancelImport = () => {
    setImportResults(INITAL_IMPORT_RESULTS)
    setVariant(VARIANTS.LIST)
  }

  const newTransaction = useNewTransaction()
  const createTransactions = useBulkCreateTransactions()   
  const deleteTransactions = useBulkDeleteTransactions()
  const transactionsQuery = useGetTransactions()
  const transactions = transactionsQuery.data || []

  const isDisabled = 
    transactionsQuery.isLoading ||
    deleteTransactions.isPending

  const onSubmitImport = async (
    // Infer automatically the object type 
    // which can be inserted in the transaction table
    values: typeof transactionSchema.$inferInsert[]
  ) => {
    // Await Acount confirm dialog
    const accountId = await confirm()

    if (!accountId) {
      return toast.error("Please select an account to continue.")
    }

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string
    }))

    createTransactions.mutate(data, {
      onSuccess: () => {
        // We close the view
        onCancelImport()
      }
    })
  }

  if (transactionsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard 
          data= {importsResults.data}
          onSubmit={onSubmitImport}
          onCancel={onCancelImport}
        />
      </>
    )
  } 

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between"> 
          <CardTitle className="text-xl line-clamp-1">
            Transactions history
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button 
              size="sm" 
              onClick={newTransaction.onOpen}
              className="w-full lg:w-auto"
            >
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={transactions} 
            filterKey="payee" 
            onDelete={(rows) => {
              const ids = rows.map((r) => r.original.id)
              deleteTransactions.mutate({ ids })
            }}
            disabled={isDisabled} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsPage