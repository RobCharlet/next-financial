import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.plaid["exchange-public-token"]["$post"], 200>
type requestType = InferRequestType<typeof client.api.plaid["exchange-public-token"]["$post"]>["json"]

// Custom hook for creating an category
export const useExchangePublicToken = () => {
  const queryClient = useQueryClient()
  
  const mutation = useMutation<
    ResponseType,
    Error,
    requestType
  >({
    // Function that performs the mutation (API request)
    mutationFn: async (json) => {
      // Make a POST request to the API with the provided JSON data
      const response = await client.api.plaid["exchange-public-token"].$post({json})

      if (!response.ok) {
        throw Error("Failed to exchange public token")
      }

      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Public token exchanged")
      // TODO: Reinvalidate the following
      // connected bank
      // summary
      // transactions
      // account
      // categories
    },
    onError: () => {
      toast.error("Failed to exchange public token")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}