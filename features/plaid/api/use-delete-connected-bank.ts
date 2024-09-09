import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.plaid["connected-bank"]["$delete"], 200>

// Custom hook for creating an category
export const useDeleteConnectedBank = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    // Function that performs the mutation (API request)
    mutationFn: async () => {
      // Make a POST request to the API with the provided JSON data
      const response = await client.api.plaid["connected-bank"].$delete()

      if (!response.ok) {
        throw Error("Failed to delete connected bank")
      }

      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Delete connected bank")
      // Reinvalidate the following
      queryClient.invalidateQueries({queryKey: ["connected-bank"]})
      queryClient.invalidateQueries({queryKey: ["summary"]})
      queryClient.invalidateQueries({queryKey: ["transactions"]})
      queryClient.invalidateQueries({queryKey: ["account"]})
      queryClient.invalidateQueries({queryKey: ["categories"]})
    },
    onError: () => {
      toast.error("Failed to delete connected bank")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}