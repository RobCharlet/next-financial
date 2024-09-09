import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";


export const useGetSubscription = () => {
  const query = useQuery({

    queryKey: ["subscription"],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.subscriptions.current.$get();

      // We have to handle errors manually unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch subscription")
      }

      const { data } = await response.json()

      return data
    }
  })

  return query
}