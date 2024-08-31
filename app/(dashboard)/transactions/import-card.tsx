import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useState } from "react"
import { ImportTable } from "./import-table"

const dateFormat = "yyyy-MM-dd HH:mm:ss"
const outputFormat = "yyyy-MM-dd"

const requiredOptions = [
  "amount",
  "date",
  "payee"
]

interface SelectedColumnsState {
  [key: string]: string | null
}

type Props = {
  data: string[][],
  onCancel: () => void,
  onSubmit: (data: any) => void
}

export const ImportCard = ({
  data,
  onCancel,
  onSubmit
}: Props) => {
  const [selectedColumns, setSeletedColumns] = useState<SelectedColumnsState>({})

  // First react-papaparse data result line is the csv columns titles
  const headers = data[0]
  const body = data.slice(1)

  return (
    <div>
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between"> 
          <CardTitle className="text-xl line-clamp-1">
            Import transaction
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Button size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable 
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  )
}