"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/patient-records", label: "Patient Records" },
    { href: "/", label: "Dashboard" },
    { href: "/summary-report", label: "Summary Report" },
    { href: "/share-results", label: "Share Results" },
  ]

  return (
    <nav className="bg-white mt-4">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger>
                <div className="cursor-pointer">
                  <Image src="/diagnostics.png" alt="Logo" width={40} height={40} className="object-contain" priority />
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to sign out?</AlertDialogDescription>
                  <AlertDialogCancel className="absolute right-2 top-2 h-6 w-6 rounded-md p-0">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => console.log("Sign out clicked")}>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium",
                  pathname === item.href
                    ? "border-b-2 border-primary text-gray-900"
                    : "text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="sm:hidden">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 text-base font-medium",
                        pathname === item.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

