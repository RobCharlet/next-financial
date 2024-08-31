"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"

import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//https://ui.shadcn.com/docs/components/data-table
import { DataTable } from "@/components/data-table"
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
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
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
  const [importsResults, setImportResults] = useState(INITAL_IMPORT_RESULTS)

  const onUpload = (results: typeof INITAL_IMPORT_RESULTS) => {
    console.log({results})
    setImportResults(results)
    setVariant(VARIANTS.IMPORT)
  }

  const onCancelImport = () => {
    setImportResults(INITAL_IMPORT_RESULTS)
    setVariant(VARIANTS.LIST)
  }

  const newTransaction = useNewTransaction()
  const deleteTransaction = useBulkDeleteTransactions()
  const transactionsQuery = useGetTransactions()
  const transactions = transactionsQuery.data || []

  const isDisabled = 
    transactionsQuery.isLoading ||
    deleteTransaction.isPending

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
        <ImportCard 
          data= {importsResults.data}
          onSubmit={() => {}}
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
          <div className="flex items-center gap-x-2">
            <Button size="sm" onClick={newTransaction.onOpen}>
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
              deleteTransaction.mutate({ ids })
            }}
            disabled={isDisabled} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsPage