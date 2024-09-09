import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.subscriptions["checkout"]["$post"], 200>

// Custom hook for creating an category
export const useCheckoutSubscription = () => {
  const mutation = useMutation<
    ResponseType,
    Error
  >({
    // Function that performs the mutation (API request)
    mutationFn: async () => {
      // Make a POST request to the API with the provided JSON data
      const response = await client.api.subscriptions["checkout"].$post()

      if (!response.ok) {
        throw Error("Failed to create URL")
      }

      // Return the JSON response from the server
      return await response.json()
    },
    onSuccess: ({data}) => {
      window.location.href = data
    },
    onError: () => {
      toast.error("Failed to create URL")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}