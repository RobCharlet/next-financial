"use client"

import { useState } from "react"
// qs is used to parse and stringify query strings for URL manipulation.
import qs from "query-string"

// Utility functions from date-fns for formatting dates and calculating ranges.
import { format, subDays } from "date-fns"

// Import types and icons for date range selection and UI components.
import { DateRange } from "react-day-picker"
import { ChevronDown } from "lucide-react"

// Next.js navigation hooks for handling routing and URL parameters.
import { 
  usePathname, 
  useRouter, 
  useSearchParams 
} from "next/navigation"

// Helper function to format the date range into a readable string.
import { formatDateRange } from "@/lib/utils"

import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger, 
  PopoverClose 
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export const DateFilter = () => {
  const router = useRouter() // To programmatically navigate and update URLs.
  const pathname = usePathname() // Retrieves the current path of the page.
  const params = useSearchParams() // Fetches query parameters from the current URL.

  // Extract `accountId`, `from`, and `to` parameters from the URL.
  const accountId = params.get("accountId")
  const from = params.get("from")
  const to = params.get("to")

  // Set default date range: 30 days before today as the start date.
  const defaultTo = new Date()
  const defaultFrom = subDays(defaultTo, 30)

  // Initialize the date range based on query parameters or default range.
  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  }

  // Keep track of the selected date range. 
  // Initially, it's set to the query parameter values.
  const [date, setDate] = useState<DateRange | undefined>(paramState)

  // Function to update the URL based on the selected date range.
  const pushToUrl = (daterange: DateRange | undefined) => {
    const query = {
      from: format(daterange?.from || defaultFrom, "yyyy-MM-dd"), // Format `from` date.
      to: format(daterange?.to || defaultTo, "yyyy-MM-dd"), // Format `to` date.
      accountId, // Keep the accountId if it's present in the URL.
    }

    // Construct a new URL with the updated query parameters.
    const url = qs.stringifyUrl({
      url: pathname,
      query, // Pass in the query object.
    }, {
      skipEmptyString: true, // Skip adding empty strings in the query.
      skipNull: true, // Skip adding null values in the query.
    })

    router.push(url) // Navigate to the new URL with the updated parameters.
  }

  // Reset the date selection to undefined and update the URL accordingly.
  const onReset = () => {
    setDate(undefined) // Clear the date selection.
    pushToUrl(undefined) // Update the URL without any date range.
  }

  return (
    // The Popover component displays the calendar in a pop-up when triggered.
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false} // Button is enabled by default.
          size="sm"
          variant="outline"
          className="lg:w-auto w-full h-9 rounded-md px-3 font-normal 
            bg-white/10 hover:bg-white/20 hover:text-white border-none
            focus:ring-offset-0 focus:ring-transparent outline-none text-white
            focus:bg-white/30 transition" 
        >
          {/* Display the current date range in the button. */}
          <span>{formatDateRange(paramState)}</span>
          {/* Chevron icon to indicate dropdown. */}
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      {/* PopoverContent displays the calendar for selecting date range. */}
      <PopoverContent className="lg:w-auto" align="start">
        <Calendar
          disabled={false} // Calendar is enabled.
          initialFocus // Autofocus on the calendar when opened.
          mode="range" // Allows the user to select a range of dates.
          defaultMonth={date?.from} // Default month is set to the "from" date.
          selected={date} // Currently selected date range.
          onSelect={setDate} // Update state when a new date range is selected.
          numberOfMonths={2} // Show two months at once.
        />

        {/* Action buttons for resetting or applying the selected date range. */}
        <div className="p-4 w-full flex items-center gap-x-2">
          {/* Reset button to clear the selected date range. */}
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!date?.from || !date?.to} // Disable if no date range is selected.
              className="w-full"
              variant="outline"
            >
              Reset
            </Button>
          </PopoverClose>

          {/* Apply button to submit the selected date range. */}
          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to} // Disable if no date range is selected.
              className="w-full"
              variant="outline"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}