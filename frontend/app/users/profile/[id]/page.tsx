'use client';

import { useAuthStore } from '@/features/auth/auth.store';
import { useDashboardData } from '@/features/dashboard/dashboard.hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, User, Mail, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage({ params }: { params: { id: string } }) {
    const user = useAuthStore((state) => state.user);
    const userId = user?.sub || user?._id || '';

    // We can use useDashboardData to fetch the profile since it's already there
    // Or we could implement a specific hook if we needed more granular control
    const { userProfile, isLoading } = useDashboardData(userId);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-bold">User Not Found</h2>
                <Link href="/dashboard">
                    <Button>Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-muted/20">
            <div className="container mx-auto py-10 max-w-4xl">
                <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                </Link>

                <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    {/* User Identity Card */}
                    <Card>
                        <CardHeader className="items-center text-center">
                            <CardTitle className="text-2xl">{userProfile.username}</CardTitle>
                            <CardDescription className="capitalize">{userProfile.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{userProfile.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span className="capitalize">Account Status: {userProfile.accountStatus || 'Active'}</span>
                            </div>
                            {/* Placeholder for joined date if available, or just mocking it */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Member since 2024</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                    </Card>

                    {/* Account Details / Edit Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                                <CardDescription>
                                    View your account information. Contact an administrator to update restricted fields.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" value={userProfile.username} disabled />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={userProfile.email} disabled />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value={userProfile.role} disabled className="capitalize" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    Delete Account
                                </Button>
                                <Button disabled>
                                    Save Changes (Coming Soon)
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Security Section Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your password and authentication settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline">Change Password</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
