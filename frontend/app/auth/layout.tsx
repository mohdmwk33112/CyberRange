import { ModeToggle } from "@/components/ui/mode-toggle"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="px-4 lg:px-6 h-16 flex items-center justify-between absolute w-full top-0 z-10">
                <Link className="flex items-center gap-2" href="/">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl tracking-tight">CyberRange</span>
                </Link>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                </div>
            </header>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg border border-border/40 shadow-lg backdrop-blur-sm">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-foreground">CyberRange</h2>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
