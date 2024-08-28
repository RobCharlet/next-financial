import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.categories["bulk-delete"]["$post"]>   
// Define the request payload type for the API endpoint
type RequestType = InferRequestType<typeof client.api.categories["bulk-delete"]["$post"]>["json"] 

// Custom hook for creating an category
export const useBulkDeleteCategories = () => {
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
      const response = await client.api.categories["bulk-delete"]["$post"]({ json })
      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Categories deleted")
      // Invalidate the 'categories' query to refetch and update the data
      // on success. Data will be automatically updated on category page.
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      toast.error("Failed to delete categories")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}