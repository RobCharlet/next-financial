import { 
  ResponsiveContainer,
  PieChart,
  Legend,
  Pie,
  Cell,
  Tooltip
} from "recharts"
import { formatPercentage } from "@/lib/utils"
import { CategoryTooltip } from "@/components/category-tooltip"

// Define a color palette for the pie chart slices.
const COLORS = ["#0062ff", "#12C6FF", "#FF647F", "#FF9354"]

type Props = {
  data: {
    name: string,
    value: number,
  }[]
}

export const PieVariant = ({data} : Props) => {
  return (
    //https://recharts.org/en-US/examples/TwoSimplePieChart
    <ResponsiveContainer width="100%" height={350}>
      {/* PieChart is the main component that houses the pie chart. */}
      <PieChart>
        {/* Legend component displays a legend for the chart. */}
        <Legend 
          layout="horizontal"  // Sets the layout of the legend to horizontal.
          verticalAlign="bottom"  // Aligns the legend to the bottom of the chart.
          align="right"  // Aligns the legend items to the right.
          iconType="circle"  // Sets the icon type in the legend to circles.
          // Custom content rendering for the legend, using the payload data provided by Recharts.
          content={({ payload }: any) => {
            return (
              <ul className="flex flex-col space-y-2">
                {payload.map((entry: any, index: number) => (
                  <li 
                    key={`item-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <span 
                      className="size-2 rounded-full" 
                      style={{backgroundColor: entry.color}}
                    />
                    <div className="space-x-1">
                      <span className="text-sm text-muted-foreground">
                        {entry.value}
                      </span>
                      <span className="text-sm">
                        {formatPercentage(entry.payload.percent * 100)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }}
        />
        {/* https://recharts.org/en-US/examples/CustomContentOfTooltip */}
        <Tooltip content={<CategoryTooltip />} />
        <Pie
          data={data}  // The data to be visualized.
          cx="50%"  // Centers the pie chart horizontally.
          cy="50%"  // Centers the pie chart vertically.
          outerRadius={90}  // Outer radius of the pie.
          innerRadius={60}  // Inner radius, creating a donut effect.
          paddingAngle={2}  // Adds padding between the slices.
          fill="#8884d8"  // Default fill color (overridden by individual slice colors).
          dataKey="value"  // Specifies which property of the data object determines the slice size.
          labelLine={false}  // Disables the lines connecting labels to pie slices.
        >
          {data.map((_entry, index) => (
            <Cell 
            // Unique key for each pie slice.  
            key={`cell-${index}`}
              // Assigns a color from the `COLORS` array.
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}