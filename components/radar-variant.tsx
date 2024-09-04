import { 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

type Props = {
  data: {
    name: string,
    value: number,
  }[]
}

export const RadarVariant = ({data} : Props) => {
  return (
    //https://recharts.org/en-US/examples/SimpleRadarChart
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart
        cx="50%"  // Centers the radar chart horizontally.
        cy="50%"  // Centers the radar chart vertically.
        data={data}  // The data to be visualized in the radar chart.
        outerRadius="60%"  // Sets the outer radius of the radar chart to 60% of the container's size.
      >
        {/* The `PolarGrid` component adds a grid to the radar chart, 
        which helps in visualizing the data points. */}
        <PolarGrid />
        {/* The `PolarAngleAxis` component defines the labels around 
        the radar chart, using the `name` property from the data. */}
        <PolarAngleAxis style={{ fontSize: "12px" }} dataKey="name" />
        {/* The `PolarRadiusAxis` component adds axis lines radiating 
        from the center of the radar chart, providing scale. */}
        <PolarRadiusAxis style={{ fontSize: "12px" }} />
        {/* The `Radar` component renders the radar area using the `value` property from the data. */}
        <Radar 
          dataKey="value"  // Specifies which property of the data object determines the radar area's size.
          stroke="#3b82f6"  // Sets the color of the radar area's outline.
          fill="#3b82f6"  // Sets the fill color of the radar area.
          fillOpacity={0.6}  // Sets the opacity of the radar area's fill color.
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}