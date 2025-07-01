import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "FlowZone",
  description: "Visualize Code. Master Logic. The Gen-Z way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setTheme(theme) {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  window.localStorage.setItem('theme', theme);
                }
                let theme = window.localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                setTheme(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <div className="fixed -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute left-0 top-1/4 h-64 w-64 animate-blob rounded-full bg-primary/20 opacity-50 blur-3xl filter"></div>
          <div className="animation-delay-2000 absolute right-1/4 top-0 h-64 w-64 animate-blob rounded-full bg-secondary/20 opacity-50 blur-3xl filter"></div>
          <div className="animation-delay-4000 absolute bottom-0 right-10 h-64 w-64 animate-blob rounded-full bg-accent/20 opacity-50 blur-3xl filter"></div>
        </div>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
