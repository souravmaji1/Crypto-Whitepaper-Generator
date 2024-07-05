"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Bricolage_Grotesque } from 'next/font/google'
import { Space_Mono } from 'next/font/google'
import { Menu, X } from 'lucide-react';
import { useState } from "react"
import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


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

const reviews = [
  {
    quote: "I was able to find the perfect dress for my event without ever leaving my home. The virtual dressing room is a game-changer!",
    name: "Jane Doe",
    title: "CEO, Acme Inc"
  },
  {
    quote: "The customer service was exceptional. They went above and beyond to ensure I had the right fit and style for my occasion.",
    name: "John Smith",
    title: "Marketing Director, Tech Co"
  },
  {
    quote: "The quality of the clothing exceeded my expectations. I'll definitely be a returning customer!",
    name: "Emily Brown",
    title: "Fashion Blogger"
  }
];



export default function Component() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};

const [isDialogOpen, setIsDialogOpen] = useState(false)
const [email, setEmail] = useState('')
const [redeemCode, setRedeemCode] = useState('')
const [message, setMessage] = useState('')

const handleAppsumoClick = () => {
  setIsDialogOpen(true)
}



const handleSubmit = async () => {
  console.log('Submitting with email:', email, 'and code:', redeemCode);
  setMessage('')
  console.log('Form submitted')

  try {
    console.log('Searching for user with email:', email)
    // Find the user ID based on the email
    const { data: userData, error: userError } = await supabase
      .from('dressmeup')
      .select('id')
      .eq('email', email)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      if (userError.code === 'PGRST116') {
        setMessage('Email not found. Please sign up first.')
      } else {
        setMessage(`Error fetching user: ${userError.message}`)
      }
      return
    }

    if (userData) {
      console.log('User found:', userData)
      // User found, now insert the redeem code for this user
      const { data: insertData, error: insertError } = await supabase
        .from('dressmeup')
        .update({ redeemcode: redeemCode })
        .eq('id', userData.id)
        .select();

      if (insertError) {
        console.error('Error inserting redeem code:', insertError)
        setMessage(`Error inserting redeem code: ${insertError.message}`)
        return
      }

      console.log('Redeem code inserted:', insertData)
      setMessage('Redeem code successfully applied! wait for 24 hour')
    } else {
      console.log('No user found with this email')
      setMessage('No user found with this email. Please sign up first.')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    setMessage(`An unexpected error occurred: ${error.message}`)
  }
}

  return (
    <div className="flex flex-col min-h-[100dvh]">
     <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
      <img src="/logoone.png" alt="Logo" className="h-8 w-auto mr-2" />
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
      <Link href="/dress">
            <Button variant="outline" className={`w-full ${fontBody.className}`}>Sign in</Button>
            </Link>
            <Link href="/dress">
            <Button className={`w-full ${fontBody.className}`} style={{background:"#d5b990"}}>Sign Up</Button>
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
            <Link href="/dress">
            <Button variant="outline" className={`w-full ${fontBody.className}`}>Sign in</Button>
            </Link>
            <Link href="/dress">
            <Button className={`w-full ${fontBody.className}`} style={{background:"#d5b990"}}>Sign Up</Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
    <main className="flex-1 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h1 className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl ${fontBold.className}`}>Interview with Acme Inc</h1>
            <p className={`text-muted-foreground md:text-xl ${fontBody.className}`}>
              We're excited to learn more about you! Please fill out the form below to share your responses.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary" />
              <span className={`${fontBody.className}`}>100+ users have used this</span>
            </div>
            <form className="bg-card rounded-lg shadow-sm p-6 md:p-8 space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="Software Engineer" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" rows={3} placeholder="List your skills here..." />
              </div>
              
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className={`text-xs text-muted-foreground ${fontBodyBold.className}  `}>&copy; 2024 DressMeUp. All rights reserved.</p>
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
