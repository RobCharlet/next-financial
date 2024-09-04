import { FileSearch } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { AreaVariant } from "@/components/area-variant"


type Props = {
  data?: {
    date: string,
    income: number,
    expenses: number,
  }[]
}

export const Chart = ({ data = [] }: Props) => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl line-clamp-1">
            Transactions
          </CardTitle>
          {/* TODO: Add select */}
          <CardDescription className="line-clamp-1">
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No data for this period
            </p>
          </div>
        ): (
          <AreaVariant
            data={data}
          />
        )}
      </CardContent>
    </Card>
  )
} 