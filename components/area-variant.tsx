import { format } from "date-fns"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  XAxis, 
  Tooltip 
} from "recharts"
import { CustomTooltip } from "@/components/custom-tooltip"

type Props = {
  data: {
    date: string,
    income: number,
    expenses: number,
  }[]
}

export const AreaVariant = ({data} : Props) => {
  return (
    //https://recharts.org/en-US/examples/AreaChartFillByValue
    // ResponsiveContainer ensures the chart adjusts its size based on the container width and height.
    // Here, the chart is set to take 100% width and a fixed height of 350px.
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        {/* CartesianGrid adds a grid background to the chart with dashed lines */}
        <CartesianGrid strokeDasharray="3 3" />
        {/* Defining gradients for the fill colors of income and expenses areas */}
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#3d82f6" stopOpacity={0.8} />
            <stop offset="98%" stopColor="#3d82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#f43f5e" stopOpacity={0.8} />
            <stop offset="98%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* XAxis defines the horizontal axis of the chart. 
            - `dataKey` tells the axis to use the `date` field from the data. 
            - `tickFormatter` formats the dates on the X-axis using `date-fns` to show "dd MMM" format.
            - The axis line and tick lines are hidden for a cleaner look, and font size is set to 12px. */}
        <XAxis 
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        {/* Tooltip is added to display detailed information when hovering over the chart. 
            - The content is customized using the CustomTooltip component. */}
        <Tooltip content={
          //https://recharts.org/en-US/examples/CustomContentOfTooltip
          <CustomTooltip />
        } />
        {/* Area chart for income data. 
            - `type="monotone"` ensures a smooth curve.
            - `dataKey` specifies which field in the data to visualize.
            - `stroke` and `fill` apply the colors and gradients defined above. 
            - `className="drop-shadow-sm"` adds a small shadow to the area. */}
        <Area 
          type="monotone"
          dataKey="income"
          stackId="income"
          strokeWidth={2}
          stroke="#3d82f6"
          fill="url(#income)"
          className="drop-shadow-sm"
        />
        <Area 
          type="monotone"
          dataKey="expenses"
          stackId="expenses"
          strokeWidth={2}
          stroke="#f43f5e"
          fill="url(#expenses)"
          className="drop-shadow-sm"
        />
      </AreaChart>
    </ResponsiveContainer>
  )

}