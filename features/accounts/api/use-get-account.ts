import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";


export const useGetAccount = (id?:string) => {
  const query = useQuery({
    // Request will only be fetch if we have an id
    enabled:!!id,
    queryKey: ["account", {id}],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.accounts[":id"].$get({
        param: { id },
      });

      // We have to handle errors manulally unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }

      const { data } = await response.json()

      return data
    }
  })

  return query
}