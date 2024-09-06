
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Script from 'next/script';
import Head from "next/head";


export const metadata = {
  title: "Replygen widget",
  description: "Replygen widget.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
       
      
        <body>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
