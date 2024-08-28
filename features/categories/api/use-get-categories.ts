import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";


export const useGetCategories = () => {
  const query = useQuery({
    queryKey: ["categories"],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.categories.$get();

      // We have to handle errors manulally unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const { data } = await response.json()
      return data
    }
  })

  return query
}