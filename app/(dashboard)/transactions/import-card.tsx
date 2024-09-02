import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useState } from "react"
import { ImportTable } from "./import-table"
import { columns } from "./columns"
import { convertAmountToMiliunits } from "@/lib/utils"
import { format, parse } from "date-fns"

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
  
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>({})

  // react-papaparse first data result line is the csv columns titles
  // e.g. ['Type', 'Product', 'Started Date', 'Completed Date']
  const headers = data[0]
  // e.g. ['CARD_PAYMENT', 'Current', '2024-01-08 20:18:58', '2024-01-09 11:58:22']
  const body = data.slice(1)

  // Called when a select modify a select header column
  const onTableHeadSelectChange = (
    // Index of the modified column
    columnIndex: number,
    // Option vallue selected
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      // Copy existing selectedValue
      const newSelectedColumns = {...prev}

      // Parse newSelectedColumns to check if a value has already been selected
      // Set it to null (a value cannot be selected multiple time)
      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null
        }
      }  

      if (value === "skip") {
        value = null
      }

      newSelectedColumns[`column_${columnIndex}`] = value
      return newSelectedColumns
      // Ex: {column_1: null, column_5: 'amount', column_2: 'date', column_4: 'payee'}
    })
  }

  // Get selected values number
  const progress = Object.values(selectedColumns).filter(Boolean).length
  
  const handleContinue = () => {
    // Extracts the column index from the selectedColumns (e.g. column_0)
    const getColumnIndex = (column:string) => {
      return column.split("_")[1]
    }

    // Sets unselected columns header and data to null
    const mappedData = {
      // Checks if user select a column, if not => null
      // e.g. [null, null, 'date', null, 'payee', 'amount', null]
      header: headers.map((_header, index) => {
        const columnIndex = getColumnIndex(`column_${index}`)
        return selectedColumns[`column_${columnIndex}`] || null
      }),
      // Checks if the column must be included, if not => null
      // e.g. [null, null, '2024-01-08 20:18:58', null, 'Shop', '-13.27', null]
      body: body.map((row) => {
        const transformedRow = row.map((cell, index) => {
          return selectedColumns[`column_${index}`] ? cell : null
        })

        // TODO: redundant with filter((row) => row.length > 0)
        return transformedRow.every((item) => item === null)
          ? []
          : transformedRow
      })
      // Remove all empty lines
      // e.g. [null, null, null, null, null, null]
      // TODO: a little bit redundant with .every((item) => item === null)
      .filter((row) => row.length > 0)
      // Can be replaced with
      //.filter((row) => row.some((cell) => cell !== null))
      // to remove transformedRow.every...
    }
    
    // Converts each array line in object with selected columns
    // e.g. {date: '2024-04-10 17:20:25', payee: 'Groceries', amount: '-14.53'}
    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc:any, cell, index) => {
        const header = mappedData.header[index]

        // If the column is selected => set header: value
        if (header !== null) {
          acc[header] = cell
        }

        return acc
      }, {})
    })

    // Format data to be submitted
    // e.g. {date: '2024-01-08', payee: 'Shop', amount: -13270}
    const formattedData = arrayOfData.map((item) => ({
      ...item,
      amount: convertAmountToMiliunits(parseFloat(item.amount)),
      date: format(parse(item.date, dateFormat, new Date()), outputFormat)
    }))

    console.log({formattedData})
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between"> 
          <CardTitle className="text-xl line-clamp-1">
            Import transaction
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button 
              size="sm" 
              onClick={onCancel}
              className="w-full lg:w-auto"
              >
              Cancel 
            </Button>
            <Button
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
              className="w-full lg:w-auto"
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable 
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}