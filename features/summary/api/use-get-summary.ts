import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetSummary = () => {
  const params = useSearchParams()
  const from = params.get("from")||""
  const to = params.get("to")||""
  const accountId = params.get("accountId")||""

  const query = useQuery({
    queryKey: ["summary", {from, to, accountId}],
    queryFn: async () => {
      // Thanks to @/lib/hono.ts, the client knows the available routes
      // And their data types.
      const response = await client.api.summary.$get({
        query: {
          from,
          to,
          accountId
        }
      });

      // We have to handle errors manulally unlike Axios.
      if (!response.ok) {
        throw new Error("Failed to fetch summary")
      }

      const { data } = await response.json()
      
      // Convert directly to normal units
      return {
        ...data, 
        incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
        expensesAmount: convertAmountFromMiliunits(data.expensesChange),
        remainingAmount: convertAmountFromMiliunits(data.remainingAmount),
        categories: data.categories.map((category) => ({
          ...category,
          value: convertAmountFromMiliunits(category.value)
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMiliunits(day.income),
          expenses: convertAmountFromMiliunits(day.expenses)
        }))

      }
    }
  })

  return query
}