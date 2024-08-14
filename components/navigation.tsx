"use client" // Needed when using a hook in Next (here usePathname).
// https://nextjs.org/docs/app/building-your-application/rendering
// Here the server does not access to the navigator lifecycle which is used
// by usePathname, so we must specify that this code must be executed on the
// client side.

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react";
import { useMedia } from "react-use";
import { Menu } from "lucide-react";

import { NavButton } from "@/components/nav-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
  {
    href: "/",
    label: 'Overview'
  },
  {
    href: "/transactions",
    label: 'transactions'
  }
  ,
  {
    href: "/accounts",
    label: 'accounts'
  },
  {
    href: "/categories",
    label: 'categories'
  },
  {
    href: "/settings",
    label: 'settings'
  }
]

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMedia("(max-width: 1024px", false)

  const onClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button
            variant="outline"
            size="sm"
            className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
          {
            routes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === pathname ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="w-full justify-start"
              >
                {route.label}
              </Button>
            ) )
          }
          </nav>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-hidden">
      {
        routes.map((route) => (
          <NavButton 
            key={route.href}
            href={route.href}
            label={route.label}
            isActive={pathname === route.href}
          />
        ) )
      }
    </nav>
  )
}
