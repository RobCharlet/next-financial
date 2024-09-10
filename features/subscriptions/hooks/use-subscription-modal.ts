// Zustand is a lightweight state management library that simplifies global state handling
// in React applications. It allows you to create and manage global states with minimal 
// boilerplate and easy-to-use APIs. Unlike Redux, Zustand doesn't require actions, reducers,
// or context, making it a simple and efficient choice for managing both small and complex states.
// In this example, Zustand is used to manage the state of the new account modal (open/close).
import { create } from "zustand"

// Define the shape of the state for managing the new account modal/sheet.
type SubscriptionModalState = {
  isOpen: boolean, // Indicates whether the new account modal is open or closed.
  onOpen: () => void, // Function to open the new account modal.
  onClose: () => void // Function to close the new account modal.
}

// Create a Zustand store to manage the state of the new account modal.
// https://github.com/pmndrs/zustand
export const useSubscriptionModal = create<SubscriptionModalState>((set) => ({
  isOpen: false, // Initialize the modal as closed by default.
  onOpen: () => set({isOpen: true}), // Function to open the modal by setting isOpen to true.
  onClose: () => set({isOpen: false}), // Function to close the modal by setting isOpen to false.
}))