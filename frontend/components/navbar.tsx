'use client';

import Link from "next/link";
import { useAuthStore } from "@/features/auth/auth.store";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Shield, CircleUser } from "lucide-react";
import { useRouter } from "next/navigation"; // Correct import for App Router

export function Navbar() {
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    return (
        <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <Link className="flex items-center justify-center gap-2 group" href={user ? "/dashboard" : "/"}>
                <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    CyberRange
                </span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                {user ? (
                    <>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
                            Dashboard
                        </Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/scenarios">
                            Scenarios
                        </Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/progress">
                            Progress
                        </Link>
                        <ModeToggle />
                        <Link href={`/users/profile/${user._id || user.id || user.sub}`} title="My Profile">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/auth/login">
                            Login
                        </Link>
                        <Link href="/auth/signup">
                            <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
                        </Link>
                        <ModeToggle />
                    </>
                )}
            </nav>
        </header >
    );
}
