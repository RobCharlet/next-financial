import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useSearchParams } from "next/navigation";
import { convertAmountFromMiliunits } from "@/lib/utils";


export const useGetTransactions = () => {
  const params = useSearchParams()
  const from = params.get("from")||""
  const to = params.get("to")||""
  const accountId = params.get("accountId")||""

  const query = useQuery({
    queryKey: ["transactions", {from, to, accountId}],  
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.transactions.$get({
        query: {
          from,
          to,
          accountId
        }
      });

      // We have to handle errors manulally unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }

      const { data } = await response.json()
      
      // Convert directly to normal units
      return data.map((transaction) =>({
          ...transaction,
          amount: convertAmountFromMiliunits(transaction.amount)
        })
      )
    }
  })

  return query
}