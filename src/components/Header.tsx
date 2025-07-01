"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Rocket, Upload } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">FlowZone</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/create">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                New Problem
              </Button>
            </Link>
            <ThemeToggle />
            <Avatar>
              <AvatarImage src="/code/G9DbjnwIgay7UeW9Sti3/profile.jpg" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>🧑‍💻</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </div>
    </header>
  );
}
