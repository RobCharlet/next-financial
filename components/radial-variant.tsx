import { 
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts"
import { formatCurrency } from "@/lib/utils"

// Define a color palette for the pie chart slices.
const COLORS = ["#0062ff", "#12C6FF", "#FF647F", "#FF9354"]

type Props = {
  data: {
    name: string,
    value: number,
  }[]
}

export const RadialVariant = ({data} : Props) => {
  return (
    //https://recharts.org/en-US/examples/TwoSimplePieChart
    <ResponsiveContainer width="100%" height={350}>
      {/* PieChart is the main component that houses the pie chart. */}
      <RadialBarChart
        cx="50%"
        cy="30%"
        barSize={10}
        outerRadius="90%"
        innerRadius="60%"
        data={data.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length]
        }))}
      >
        <RadialBar 
          label={{
            position: "insideStart",
            fill: "#fff",
            fontSize: "12px"
          }}
          background
          dataKey="value"
        />
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
                        {formatCurrency(entry.payload.value * 100)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}