import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { FormProvider } from "@/contexts/FormContext"
import { ClearFormOnRefresh } from "@/components/clear-form-on-refresh"
import { Toaster } from "sonner"
import { Toaster as OldToaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Diagnostics AI Dashboard",
  description: "Medical image diagnosis dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster theme="system"/>
        <OldToaster/>
        <FormProvider>
          <ClearFormOnRefresh />
          <Navbar />
          <main className="max-w-5xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </main>
          <Toaster />
        </FormProvider>
      </body>
    </html>
  )
}

