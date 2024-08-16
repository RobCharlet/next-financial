"use client"

import { useMountedState } from "react-use"
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet"

export const SheetProvider = () => {
  const isMounted = useMountedState()
  // Equivalent to :
  // const [isMounted, setIsMounted] = useState(false)
  // useEffect(() => {
  //   setIsMounted(true)
  // }, [])

  // Prevent Hydration errors
  if (!isMounted) return false

  return (
    <>
      <NewAccountSheet />
    </>
  )
}