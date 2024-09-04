import { format } from "date-fns"
import { 
  CartesianGrid, 
  ResponsiveContainer, 
  XAxis, 
  Tooltip,
  LineChart,
  Line
} from "recharts"
import { CustomTooltip } from "@/components/custom-tooltip"

type Props = {
  data: {
    date: string,
    income: number,
    expenses: number,
  }[]
}

export const LineVariant = ({data} : Props) => {
  return (
    //https://recharts.org/en-US/examples/SimpleBarChart
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip content={
          //https://recharts.org/en-US/examples/CustomContentOfTooltip
          <CustomTooltip />
        } />
        <Line 
          dot={false}
          dataKey="income"
          stroke="#3d82f6"
          className="drop-shadow-sm"
        />
        <Line 
          dot={false}
          dataKey="expenses"
          stroke="#f43f5e"
          className="drop-shadow-sm"
        />
        
      </LineChart>
    </ResponsiveContainer>
  )
}