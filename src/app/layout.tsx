import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"; // Fixed import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Netcall Services - Sales Capacity Assessment",
  description: "Complete our sales capacity assessment to help us understand your sales approach and capabilities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider attribute="class" defaultTheme="light">
          {children}
          <Toaster position="top-center" richColors /> {/* Added recommended props */}
        </NextThemesProvider>
      </body>
    </html>
  );
}