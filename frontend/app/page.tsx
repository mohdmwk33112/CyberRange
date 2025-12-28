
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Shield, Lock, Terminal, Activity, ArrowRight, Zap, Target, BarChart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-image.png"
              alt="Cybersecurity Simulation"
              fill
              className="object-cover opacity-10 dark:opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Next-Gen Cyber Training Platform
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Master Security in a <span className="text-primary block sm:inline">Living Environment</span>
              </h1>

              <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl leading-relaxed">
                Deploy realistic attack scenarios, defend against AI-driven threats, and track your skills in real-time. The ultimate platform for aspiring cybersecurity professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20">
                    Start Training <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-lg backdrop-blur-sm bg-background/50 hover:bg-accent/50">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full py-20 bg-muted/30 relative border-y border-border/40">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
          <div className="container relative px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Mission Critical Features</h2>
              <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-lg">
                Everything you need to go from beginner to elite defender.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Terminal,
                  title: "Realistic Scenarios",
                  desc: "Hands-on labs simulating real-world attacks like SQLi, XSS, and Ransomware.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  icon: Lock,
                  title: "Secure Sandbox",
                  desc: "Isolated Docker containers for each session. Break things without consequences.",
                  color: "text-green-500",
                  bg: "bg-green-500/10"
                },
                {
                  icon: BarChart,
                  title: "Skill Analytics",
                  desc: "Detailed breakdown of your strengths and weaknesses across different domains.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10"
                },
                {
                  icon: Zap,
                  title: "Instant Deployment",
                  desc: "Spin up complex infrastructure in seconds with Kubernetes orchestration.",
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10"
                },
                {
                  icon: Target,
                  title: "Objective Tracking",
                  desc: "Clear mission objectives and automated scoring for every action you take.",
                  color: "text-red-500",
                  bg: "bg-red-500/10"
                },
                {
                  icon: Activity,
                  title: "Live Monitoring",
                  desc: "Real-time visibility into network traffic and system health during simulations.",
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10"
                }
              ].map((feature, i) => (
                <div key={i} className="group flex flex-col items-center space-y-4 text-center p-6 bg-card rounded-2xl border border-border/50 shadow-sm transition-all hover:scale-105 hover:shadow-md hover:border-primary/20">
                  <div className={`p-4 rounded-full ${feature.bg} ${feature.color} ring-1 ring-inset ring-current/20`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="w-full py-20 lg:py-32 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Command Center for <span className="text-primary">Cyber Operations</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our professional-grade dashboard gives you total control over your learning journey. Track active simulations, view progress across different kill-chain phases, and get AI-driven recommendations for your next challenge.
                </p>
                <div className="space-y-4">
                  {[
                    "Real-time cluster health monitoring",
                    "Integrated IDS/IPS alerts",
                    "Attack path visualization"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-primary/20 p-1 rounded-full text-primary">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard">
                  <Button className="mt-4" size="lg">Explore Dashboard</Button>
                </Link>
              </div>
              <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
                <div className="relative rounded-lg overflow-hidden border border-border shadow-2xl bg-card transform transition-transform duration-500 group-hover:rotate-y-2 group-hover:scale-[1.02]">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    width={800}
                    height={600}
                    className="object-cover w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="w-full py-20 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="/terminal-bg.png"
              alt="Terminal Background"
              fill
              className="object-cover"
            />
          </div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-block rounded-lg bg-green-500/20 px-3 py-1 text-sm font-mono text-green-400 border border-green-500/30">
                $ system_check --depth=full
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-mono">
                Built on Real Tech Stack
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl font-mono">
                No simulations. No fake terminals. You work with actual Docker containers, Kubernetes clusters, and industry-standard tools like Metasploit, Nmap, and Wireshark.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 w-full max-w-4xl opacity-80">
                {['Kubernetes', 'Docker', 'React', 'NestJS', 'Python', 'Go', 'Linux', 'MongoDB'].map((tech) => (
                  <div key={tech} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 font-mono text-sm hover:bg-white/10 transition-colors">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">© 2025 CyberRange. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="#">
            Contact Support
          </Link>
        </nav>
      </footer>
    </div>
  )
}
