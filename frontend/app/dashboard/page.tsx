'use client';

import { useDashboardData } from '@/features/dashboard/dashboard.hooks';
import { useAuthStore } from '@/features/auth/auth.store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, BookOpen, User, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user) as any;
    const userId = user?._id || user?.sub || '';
    const { userProfile, scenarios, simulations, progress, isLoading, error } = useDashboardData(userId);

    const completedScenarios = progress.filter(p => p.status === 'completed');
    const completionRate = scenarios.length > 0 ? Math.round((completedScenarios.length / scenarios.length) * 100) : 0;

    const recommendedScenarios = scenarios
        .filter(s => !progress.find(p => p.scenarioId === s._id && p.status === 'completed'))
        .slice(0, 3);

    const recentActivity = [...simulations, ...progress]
        .sort((a: any, b: any) => new Date(b.startedAt || b.timestamp).getTime() - new Date(a.startedAt || a.timestamp).getTime())
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Only show full error if critical data (profile or scenarios) failed to load
    const isCriticalError = !userProfile && !scenarios.length && error;
    if (isCriticalError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md border-border/40">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
                        <CardDescription>
                            Unable to load critical dashboard data. Please check your connection.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.reload()} className="w-full">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}

            <main className="container mx-auto p-6 space-y-6">
                {/* Welcome Section */}
                <section className="w-full py-8 md:py-12">
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl md:text-3xl">
                                        Welcome back, <span className="text-primary">{userProfile?.username || user?.username || 'User'}</span>!
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Role: {userProfile?.role || user?.role || 'Student'} • Status: {userProfile?.accountStatus || 'Active'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </section>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Scenarios Card */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Available Scenarios</CardTitle>
                                </div>
                                <span className="text-3xl font-bold text-primary">
                                    {scenarios?.length || 0}
                                </span>
                            </div>
                            <CardDescription>
                                Attack scenarios ready for training
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {scenarios && scenarios.length > 0 ? (
                                <div className="space-y-2">
                                    {scenarios.slice(0, 3).map((scenario: any) => (
                                        <Link
                                            key={scenario._id}
                                            href={`/scenarios/${scenario._id}`}
                                            className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all group"
                                        >
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">{scenario.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {scenario.difficulty} • {scenario.estimatedTime || 15}min
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                                        </Link>
                                    ))}
                                    <Link href="/scenarios">
                                        <Button variant="outline" className="w-full mt-2">
                                            View All Scenarios
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        No scenarios available yet
                                    </p>
                                    <Link href="/scenarios">
                                        <Button>Browse Scenarios</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Simulations Card */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Activity className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Active Simulations</CardTitle>
                                </div>
                                <span className="text-3xl font-bold text-primary">
                                    {simulations?.length || 0}
                                </span>
                            </div>
                            <CardDescription>
                                Your ongoing training sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {simulations && simulations.length > 0 ? (
                                <div className="space-y-2">
                                    {simulations.map((simulation) => (
                                        <div
                                            key={simulation._id}
                                            className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-background/50"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{simulation.scenarioName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Started: {new Date(simulation.startedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${simulation.status === 'Running'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : simulation.status === 'Starting'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : simulation.status === 'Completed'
                                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                            >
                                                {simulation.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        No active simulations
                                    </p>
                                    <Link href="/scenarios">
                                        <Button>Start a Scenario</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Card */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Your Progress</CardTitle>
                            </div>
                            <CardDescription>
                                Track your skill development
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Completion Rate</span>
                                        <span className="font-medium">{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {completedScenarios.length} of {scenarios.length} scenarios completed
                                </div>
                                <Link href="/progress">
                                    <Button variant="outline" className="w-full">
                                        View Detailed Progress
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Activity */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest actions and events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.map((activity: any, index) => (
                                        <div key={activity._id || index} className="flex items-start gap-3 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                                            <div className="p-1.5 bg-primary/10 rounded-full mt-1">
                                                {activity.status === 'Running' || activity.status === 'Starting' ? (
                                                    <Activity className="h-4 w-4 text-primary" />
                                                ) : activity.status === 'completed' ? (
                                                    <Shield className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {activity.scenarioName || scenarios.find(s => s._id === activity.scenarioId)?.title || 'Unknown Scenario'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.status === 'Running' ? 'Simulation in progress' :
                                                        activity.status === 'completed' ? 'Scenario completed' :
                                                            activity.status === 'started' ? 'Scenario started' : activity.status}
                                                    • {new Date(activity.startedAt || activity.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recommended Scenarios */}
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Recommended for You</CardTitle>
                            <CardDescription>Continue your learning journey</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recommendedScenarios.length > 0 ? (
                                <div className="space-y-3">
                                    {recommendedScenarios.map((scenario) => (
                                        <Link
                                            key={scenario._id}
                                            href={`/scenarios/${scenario._id}`}
                                            className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all group"
                                        >
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">{scenario.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {scenario.difficulty} • {scenario.category}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">You've completed all available scenarios! Well done.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <section className="w-full">
                    <Card className="border-border/40 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Navigate to key areas of the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Link href="/scenarios">
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                        <BookOpen className="h-6 w-6" />
                                        <span>Browse Scenarios</span>
                                    </Button>
                                </Link>
                                <Link href={`/users/profile/${userId}`}>
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                        <User className="h-6 w-6" />
                                        <span>View Profile</span>
                                    </Button>
                                </Link>
                                <Link href="/progress">
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                        <TrendingUp className="h-6 w-6" />
                                        <span>View Progress</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
}
