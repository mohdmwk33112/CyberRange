'use client';

import { useAuthStore } from '@/features/auth/auth.store';
import { useDashboardData } from '@/features/dashboard/dashboard.hooks';
import { useScenarios } from '@/features/scenarios/scenarios.hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, Trophy, Target, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
    const user = useAuthStore((state) => state.user);
    const userId = user?.sub || user?._id || '';

    // Fetch all necessary data
    const { progress, isLoading: isProgressLoading } = useDashboardData(userId);
    const { data: scenarios, isLoading: isScenariosLoading } = useScenarios();

    // Loading state
    if (isProgressLoading || isScenariosLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Processing data for stats
    const totalScenarios = scenarios?.length || 0;
    const completedScenarios = progress?.filter(p => p.status === 'completed') || [];
    const completedCount = completedScenarios.length;
    const completionRate = totalScenarios > 0 ? Math.round((completedCount / totalScenarios) * 100) : 0;

    // Calculate total score
    const totalScore = completedScenarios.reduce((acc, curr) => acc + (curr.score || 0), 0);

    // Group scenarios by status for visualization if needed, or just list them
    const recentActivity = [...(progress || [])].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/20">
            <div className="container mx-auto py-8 md:py-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
                        <p className="text-muted-foreground">
                            Detailed overview of your training achievements and scenario history.
                        </p>
                    </div>
                    {/* Optional: Add export or share buttons here */}
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalScore}</div>
                            <p className="text-xs text-muted-foreground">Points accumulated</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <Target className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completionRate}%</div>
                            <ProgressBar value={completionRate} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Scenarios Completed</CardTitle>
                            <Target className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedCount} / {totalScenarios}</div>
                            <p className="text-xs text-muted-foreground">Labs finished</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                            <Clock className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {recentActivity.length > 0
                                    ? new Date(recentActivity[0].timestamp).toLocaleDateString()
                                    : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">Most recent attempt</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scenario History</CardTitle>
                        <CardDescription>A complete log of all your training scenario attempts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Scenario ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentActivity.map((item) => (
                                        <TableRow key={item._id || item.scenarioId + item.timestamp}>
                                            <TableCell className="font-medium">{item.scenarioId}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    item.status === 'completed' ? 'default' :
                                                        item.status === 'failed' ? 'destructive' : 'secondary'
                                                }>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{item.difficulty}</TableCell>
                                            <TableCell>{item.score}</TableCell>
                                            <TableCell className="text-right">
                                                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No progress records found</p>
                                <p className="text-muted-foreground mb-4">Start a scenario to see your progress tracked here.</p>
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
