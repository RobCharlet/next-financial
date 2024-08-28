import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$delete"]>

// Custom hook for editing an category
export const useDeleteCategory = (id?: string) => {
  // Get the query client instance to manage query cache
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    // Function that performs the mutation (API request)
    mutationFn: async () => {
      // Make a POST request to the API with the provided JSON data
      const response = await client.api.categories[":id"]["$delete"]({
        param: {id}
      })

      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Category deleted")
      // Invalidate 'category' query
      queryClient.invalidateQueries({ queryKey: ["category", {id}]})
      // Invalidate the 'categories' query to refetch and update the data
      // on success. Data will be automatically updated on category page.
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      toast.error("Failed to delete category")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}