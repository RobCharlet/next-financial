import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";


export const useGetConnectedBank = () => {
  const query = useQuery({
    // Request will only be fetch if we have an id
    queryKey: ["connected-bank"],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.plaid["connected-bank"].$get();

      // We have to handle errors manually unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch connected bank")
      }

      const { data } = await response.json()

      return data
    }
  })

  return query
}