'use client';

import { useScenarios } from '@/features/scenarios/scenarios.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Shield, BookOpen, Clock, Zap, ChevronRight } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useAuthStore } from '@/features/auth/auth.store';

export default function ScenariosPage() {
    const { data: scenarios, isLoading, error } = useScenarios();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Loading scenarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            Error Loading Scenarios
                        </CardTitle>
                        <CardDescription>
                            We couldn't retrieve the training modules. Please check your connection and try again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                            Retry Connection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
                <Link className="flex items-center gap-2 group" href="/dashboard">
                    <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                    <span className="font-bold text-xl tracking-tight">CyberRange</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                    <Link className="text-sm font-medium hover:text-primary transition-colors py-2" href="/dashboard">
                        Dashboard
                    </Link>
                    <Link className="text-sm font-medium text-primary py-2 border-b-2 border-primary" href="/scenarios">
                        Scenarios
                    </Link>
                    <ModeToggle />
                    <Button variant="ghost" size="sm" onClick={() => {
                        useAuthStore.getState().clearAuth();
                        window.location.href = '/';
                    }} className="text-muted-foreground hover:text-foreground">
                        Logout
                    </Button>
                </nav>
            </header>

            <main className="container mx-auto p-6 md:p-8 space-y-10">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Training Scenarios</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Master cybersecurity skills through hands-on practical exercises. From network security to advanced exploitation techniques, each scenario is designed to build your expertise step by step.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {scenarios?.map((scenario: any) => (
                        <Card key={scenario._id} className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 transition-all duration-300 flex flex-col shadow-lg hover:shadow-primary/5">
                            <CardHeader className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={(scenario.difficulty === 'hard' ? 'destructive' : scenario.difficulty === 'medium' ? 'default' : 'secondary') as any} className="uppercase tracking-wider px-2 py-0.5 text-[10px] font-bold">
                                        {scenario.difficulty}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        <span>{scenario.estimatedTime || 15} min</span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors leading-tight">
                                    {scenario.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px] text-sm leading-relaxed">
                                    {scenario.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow pt-0 pb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border/20 pt-4">
                                        <Zap className="w-4 h-4 text-primary/70" />
                                        <span className="font-medium">{scenario.attackType}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <BookOpen className="w-4 h-4 text-primary/70" />
                                        <span>{scenario.steps?.length || 0} Learning Steps</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 border-t border-border/10 pt-4">
                                <Link href={`/scenarios/${scenario._id}`} className="w-full">
                                    <Button className="w-full group/btn" variant="outline">
                                        <span>Start Training</span>
                                        <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {(!scenarios || scenarios.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl border-2 border-dashed border-border/40 bg-card/20">
                        <div className="p-4 bg-muted/50 rounded-full">
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">No scenarios available yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Check back soon for new training modules or contact your administrator.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
