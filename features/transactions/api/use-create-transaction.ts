import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.transactions.$post>
// Define the request payload type for the API endpoint
type RequestType = InferRequestType<typeof client.api.transactions.$post>["json"] 

// Custom hook for creating an transaction
export const useCreateTransaction = () => {
  // Get the query client instance to manage query cache
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    // Function that performs the mutation (API request)
    mutationFn: async (json) => {
      // Make a POST request to the API with the provided JSON data
      const response = await client.api.transactions.$post({json})
      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Transaction created")
      // Invalidate the 'transactions' query to refetch and update the data
      // on success. Data will be automatically updated on transaction page.
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["summary"] })
    },
    onError: () => {
      toast.error("Failed to create transaction")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}