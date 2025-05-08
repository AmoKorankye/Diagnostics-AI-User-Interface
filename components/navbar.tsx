"use client"

import { useState } from "react"
import Link from "next/link"
import { redirect, RedirectType, usePathname } from "next/navigation"
import { Loader2, LogOut, Menu, X } from "lucide-react"
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
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function Navbar() {
  const pathname = usePathname()
  const {data: session ,isPending} = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navItems = [
    { href: "/patient-records", label: "Patient Records" },
    { href: "/", label: "Dashboard" },
    { href: "/summary-report", label: "Summary Report" },
    // { href: "/share-results", label: "Share Results" },
  ]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setIsLoading(true)
    const { data } = await authClient.signOut({
      fetchOptions:{
        onError: () => {}

      }
    })
    if(data?.success){
      toast.success("Goodbye")
      redirect("/login", RedirectType.replace)
    }
  }

  const getUserInitials = () => {
    if (!session ) return "U"
    return session.user.name.charAt(0).toUpperCase()
  }

  return (
    <nav className="bg-white mt-4">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/diagnostics.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain cursor-pointer"
                priority
              />
            </Link>
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
          <div className="flex items-center">
            {!isLoading ? (
              <>
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.user.image??""}
                            alt={session.user.email??""}
                          />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsSignOutDialogOpen(true)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="default" size="sm">
                    <Link href="/login">Sign in</Link>
                  </Button>
                )}
              </>
            ): isPending || isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <div className="sm:hidden ml-2">
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
      </div>

      <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to sign out?</AlertDialogDescription>
            <AlertDialogCancel className="absolute right-2 top-2 h-6 w-6 rounded-md p-0" disabled={isSigningOut}>
              <X className="h-4 w-4" />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-2 sm:mt-0" disabled={isSigningOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                "Sign Out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}

