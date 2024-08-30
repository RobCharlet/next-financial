"use client"

import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"

import { columns } from "./columns"
//https://ui.shadcn.com/docs/components/data-table
import { DataTable } from "@/components/data-table"
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"

const TransactionsPage = () => {  
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

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between"> 
          <CardTitle className="text-xl line-clamp-1">
            Transactions history
          </CardTitle>
          <Button size="sm" onClick={newTransaction.onOpen}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={transactions} 
            filterKey="date" 
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