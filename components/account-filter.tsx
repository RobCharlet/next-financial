"use client"

// Importing `query-string` library for working with query strings in URLs.
// https://github.com/sindresorhus/query-string#readme
import qs from "query-string"

import { 
  usePathname, 
  useRouter, 
  useSearchParams 
} from "next/navigation"

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"
import { useGetSummary } from "@/features/summary/api/use-get-summary"

export const AccountFilter = () => {
  // Initialize router for programmatically navigating between pages.
  const router = useRouter()

  // Get the current pathname of the page (useful for appending query parameters).
  const pathname = usePathname()

  // Get URL search parameters to retrieve `accountId`, `from`, and `to` dates.
  const params = useSearchParams()
  const accountId = params.get("accountId") || "all" // Default to "all" accounts if none is selected.
  const from = params.get("from") // Date range filter: "from".
  const to = params.get("to") // Date range filter: "to".

  // Using custom hook to track its loading state.
  const { isLoading: isLoadingSummary } = useGetSummary() 

  // Using custom hook to fetch available accounts and track loading state.
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts()

  // Function to handle changes when the user selects a new account.
  const onChange = (newValue: string) => {
    const query = {
      accountId: newValue,
      from,
      to,
    }

    // If the user selects "all", we want to clear the accountId parameter.
    if (newValue === "all") {
      query.accountId = "" // Remove `accountId` from the URL.
    }

    // Build a new URL with the updated query parameters, using `qs.stringifyUrl`.
    const url = qs.stringifyUrl({
      url: pathname, // Current page's pathname.
      query, // The query object.
    }, {
      skipNull: true, // Do not include null values in the query.
      skipEmptyString: true, // Do not include empty strings in the query.
    })

    // Navigate to the new URL, which updates the filters.
    router.push(url)
  }

  return (
    <Select
      value={accountId} // The currently selected account.
      onValueChange={onChange} // Function to call when the selection changes.
      // Disable the dropdown if accounts or summary data are still loading.
      disabled={isLoadingAccounts || isLoadingSummary} 
    >
      <SelectTrigger
        className="lg:w-auto w-full h-9 rounded-md px-3 font-normal 
        bg-white/10 hover:bg-white/20 hover:text-white border-none
        focus:ring-offset-0 focus:ring-transparent outline-none text-white
        focus:bg-white/30 transition" 
      >
        <SelectValue placeholder="Select account" />
      </SelectTrigger>

      <SelectContent>
        {/* Default option to show all accounts. */}
        <SelectItem value="all">
          All accounts
        </SelectItem>

        {/* Dynamically render each available account as a selectable item. */}
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}