import { twMerge } from "tailwind-merge"
import { type ClassValue, clsx } from "clsx"
import { eachDayOfInterval, isSameDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000)
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * This function calculates the percentage change between two numerical values,
 * typically used in financial or performance metrics to measure growth or decline
 * over a period of time. It is often used in reports or dashboards to indicate
 * the relative increase or decrease in key metrics such as revenue, expenses, 
 * or any other measurable quantities.
 *
 * Special cases handled:
 * - If the `previous` value is 0 and matches the `current` value, the percentage change is 0%.
 * - If the `previous` value is 0 but differs from the `current` value, the change is considered 100% 
 *   (since anything compared to 0 is technically an infinite percentage change).
 *
 * This function is crucial for accurate analysis and visualization of trends, 
 * especially when comparing data points over time.
 */
export function calculatePercentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return previous === current ? 0 : 100
  }

  return ((current - previous) / previous) * 100
}

/**
 * This function is useful for preparing data for visualizations, such as line or bar charts,
 * where it's important to have a consistent time series with no missing dates. 
 * It ensures that every day within the specified date range is represented in the output,
 * even if no transactions occurred on some of those days.
 * Missing days are filled in with `income` and `expenses` set to `0`, 
 * which is crucial for accurate graph rendering, as it prevents gaps in the data.
 */
export function fillMissingDays(
  activeDays: {
    date: Date,
    income: number,
    expenses: number,
  }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) {
    return []
  }

  // Generate an array of all days within the given date interval
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  // Map over each day in the interval and check if it has a corresponding transaction
  const transactionsByDay = allDays.map((day) => {
    // Find a matching transaction for the current day in the activeDays array
    const found = activeDays.find((d) => isSameDay(d.date, day))
    
    if (found) {
      // If a transaction is found, use it as-is
      return found   
    } else {
      // If no transaction is found, create a new object with income and expenses set to 0
      return {
        date: day,
        income: 0,
        expenses: 0
      }
    }
  })

  // Return the array of days with all missing days filled in
  return transactionsByDay
}