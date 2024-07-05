"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card} from "@/components/ui/card"
import { Bricolage_Grotesque } from 'next/font/google'
import { Space_Mono } from 'next/font/google'
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import Whitepaper from '@/components/whitepaper'

const fontBodyBold = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-body',
})

const fontBold = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-heading',
})

const fontBody = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-body',
})


export default function Component() {
 
  return (
    <div className="flex flex-col min-h-[100dvh]">
     <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
     <StarIcon />
        <span className="sr-only">Acme SaaS Platform</span>
      </Link>
      <nav className="ml-auto hidden lg:flex gap-4">
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Features
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Pricing
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          About
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Contact
        </Link>
      </nav>
      <div className="ml-auto hidden lg:flex gap-4">
      <Link href="/">
            <Button variant="outline" className={`w-full ${fontBody.className}`}>Sign in</Button>
            </Link>
            <Link href="/">
            <Button className={`w-full ${fontBody.className}`} style={{background:"neon",color:'white'}}>Sign Up</Button>
            </Link>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="ml-auto lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <nav className="flex flex-col gap-4">
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Features
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Pricing
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              About
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Contact
            </Link>
            <Link href="/">
            <Button variant="outline" className={`w-full ${fontBody.className}`}>Sign in</Button>
            </Link>
            <Link href="/">
            <Button className={`w-full ${fontBody.className}`} style={{background:"neon",color:'white'}}>Sign Up</Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
    <main className="flex-1">
   <Whitepaper />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className={`text-xs text-muted-foreground ${fontBodyBold.className}  `}>&copy; 2024 CryptoWhitepaperGenerator. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Pricing
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            About
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Contact
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function StarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}



function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
