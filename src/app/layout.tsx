import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nodebase",
  description: "A nodebase is the platform to automate your node operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunitoSans.variable} `}>
        <TRPCReactProvider>
          <NuqsAdapter>
            <Toaster richColors position="top-right" />
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              {children}
            </ThemeProvider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
