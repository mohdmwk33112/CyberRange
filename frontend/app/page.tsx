
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Shield, Lock, Terminal, Activity } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">CyberRange</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/auth/login">
            Login
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get Started</Button>
          </Link>
          <ModeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Master Cybersecurity in a <span className="text-primary">Controlled Environment</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Engage in realistic simulation scenarios. Defend against attacks, analyze vulnerabilities, and track your progress.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-11 px-8">Start Training</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="h-11 px-8">Log In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card rounded-lg border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Terminal className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Realistic Scenarios</h2>
                <p className="text-muted-foreground">
                  Experience hands-on labs that simulate real-world cyber attacks and defense mechanisms.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card rounded-lg border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Secure Environment</h2>
                <p className="text-muted-foreground">
                  Practice safely in a sandboxed environment without risking actual infrastructure.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card rounded-lg border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Progress Tracking</h2>
                <p className="text-muted-foreground">
                  Monitor your skill development with detailed analytics and performance scores.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2025 CyberRange. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
