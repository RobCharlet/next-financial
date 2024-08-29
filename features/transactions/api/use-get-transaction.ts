import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";


export const useGetTransaction = (id?:string) => {
  const query = useQuery({
    // Request will only be fetch if we have an id
    enabled:!!id,
    queryKey: ["transaction", {id}],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.transactions[":id"].$get({
        param: { id },
      });

      // We have to handle errors manulally unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const { data } = await response.json()

      return data
    }
  })

  return query
}