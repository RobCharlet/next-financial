import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

// Define the response type of the API endpoint
type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$patch"]>
// Define the request payload type for the API endpoin
type RequestType = InferRequestType<typeof client.api.categories[":id"]["$patch"]>["json"] 

// Custom hook for editing an category
export const useEditCategory = (id?: string) => {
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
      const response = await client.api.categories[":id"]["$patch"]({
        param: {id}, 
        json,
      })

      // Return the JSON response from the server
      return await response.json()
    },
    // Callback function for when the mutation is successful
    onSuccess: () => {
      toast.success("Category updated")
      // Invalidate 'category' query
      queryClient.invalidateQueries({ queryKey: ["category", {id}]})
      // Invalidate the 'categories' query to refetch and update the data
      // on success. Data will be automatically updated on category page.
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      // Category data on transaction pages will be automatically updated
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
    onError: () => {
      toast.error("Failed to edit category")
    }
  })

  // Return the mutation object to be used in components
  return mutation
}