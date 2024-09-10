import { useState } from "react"
import { 
  AreaChartIcon, 
  BarChart, 
  FileSearch, 
  LineChartIcon, 
  Loader2 
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AreaVariant } from "@/components/area-variant"
import { BarVariant } from "@/components/bar-variant"
import { LineVariant } from "@/components/line-variant"
import { Skeleton } from "@/components/ui/skeleton"
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall"

type Props = {
  data?: {
    date: string,
    income: number,
    expenses: number,
  }[]
}

export const Chart = ({ data = [] }: Props) => {
  const [chartType, setChartType] = useState("area")
  const {
    shouldBlock,
    triggerPaywall
  } = usePaywall()
  const onTypeChange = (type: string)=> {
    // Paywall: only Area is free
    if (type !== "area" && shouldBlock) {
      triggerPaywall()
      return
    }
    setChartType(type)
  }

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl line-clamp-1">
            Transactions
          </CardTitle>
          <CardDescription className="line-clamp-1">
          </CardDescription>
        </div>
        <Select
            defaultValue={chartType}
            onValueChange={onTypeChange}
          >
            <SelectTrigger className="lg:w-auto h-9 rounded-md px-3">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">
                <div className="flex items-center">
                  <AreaChartIcon className="size-4 mr-2 shrink-0" />
                  <p className="line-clamp-1">
                    Area chart
                  </p>
                </div> 
              </SelectItem>
              <SelectItem value="line">
                <div className="flex items-center">
                  <LineChartIcon className="size-4 mr-2 shrink-0" />
                  <p className="line-clamp-1">
                    Line chart
                  </p>
                </div> 
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center">
                  <BarChart className="size-4 mr-2 shrink-0" />
                  <p className="line-clamp-1">
                    Bar chart
                  </p>
                </div> 
              </SelectItem>
            </SelectContent>
          </Select>
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
          <>
            {chartType === "line" && <LineVariant data={data} />}
            {chartType === "bar" && <BarVariant data={data} />}
            {chartType === "area" && <AreaVariant data={data} />}
          </>
          
        )}
      </CardContent>
    </Card>
  )
} 

export const ChartLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 lg:w-[120px] w-full" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  )
}