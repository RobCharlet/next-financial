import { useQuery } from "@tanstack/react-query"; // Importing useQuery hook from react-query for data fetching.
import { client } from "@/lib/hono"; // Importing a pre-configured client to make API calls.
import { useSearchParams } from "next/navigation"; // Importing a hook to access URL search parameters in a Next.js app.
import { convertAmountFromMiliunits } from "@/lib/utils"; // Importing a utility function to convert amounts from milliunits to regular units.

export const useGetTransactions = () => {
  const params = useSearchParams(); // Hook to retrieve search parameters from the URL.
  
  // Retrieve specific search parameters (from, to, and accountId) from the URL.
  const from = params.get("from") || ""; // If "from" param doesn't exist, set an empty string as default.
  const to = params.get("to") || ""; // If "to" param doesn't exist, set an empty string as default.
  const accountId = params.get("accountId") || ""; // If "accountId" param doesn't exist, set an empty string as default.

  // Using the `useQuery` hook to fetch transactions based on the queryKey (combination of query params).
  const query = useQuery({
    // The `queryKey` uniquely identifies the query and can be used for caching or refetching.
    queryKey: ["transactions", { from, to, accountId }],
    
    // The `queryFn` is the function that will be executed to fetch the data.
    queryFn: async () => {
      // Fetch the transactions from the API using the client (configured with known routes and types from hono.ts).
      const response = await client.api.transactions.$get({
        query: {
          from, // The `from` date parameter for filtering transactions.
          to, // The `to` date parameter for filtering transactions.
          accountId, // The account ID to filter transactions for a specific account.
        }
      });

      // Check if the response is successful. If not, throw an error to be caught by react-query.
      if (!response.ok) {
        throw new Error("Failed to fetch accounts"); // Error handling if the request fails.
      }

      // Parse the response data from JSON format.
      const { data } = await response.json();
      
      // Map over the transactions and convert their amounts from milliunits to regular units using the utility function.
      return data.map((transaction) => ({
        ...transaction, // Spread the original transaction properties.
        amount: convertAmountFromMiliunits(transaction.amount), // Convert the amount field from milliunits.
      }));
    },
  });

  // Return the result of the query, which includes data, loading state, and error information.
  return query;
}