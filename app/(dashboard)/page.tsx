"use client"

import { useNewAccount } from "@/features/accounts/hooks/use-new-account"
import { Button } from "@/components/ui/button"

export default function Home() {
  const {onOpen} = useNewAccount() // Can be used anywhere in the project thx to Zustand

  return (
    <div>
      <Button onClick={onOpen}>
        Add an account
      </Button>
    </div>
  );
}
