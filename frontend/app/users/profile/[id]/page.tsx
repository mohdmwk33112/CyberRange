'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useDashboardData } from '@/features/dashboard/dashboard.hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, User, Mail, Shield, Calendar, Save, X, Trash2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { userApi } from '@/features/user/user.api';
import { useRouter } from 'next/navigation';

export default function UserProfilePage({ params }: { params: { id: string } }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.clearAuth);
    const userId = user?.sub || user?._id || '';
    const { toast } = useToast();
    const router = useRouter();

    const { userProfile, isLoading, refetch } = useDashboardData(userId);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '' });
    const [formErrors, setFormErrors] = useState({ username: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Password State
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Delete State
    const [isDeleting, setIsDeleting] = useState(false);

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

    const startEditing = () => {
        setEditForm({
            username: userProfile.username || '',
            email: userProfile.email || '',
        });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditForm({ username: '', email: '' });
    };

    const handleUpdateProfile = async () => {
        // Validation
        const newErrors = {
            username: !editForm.username.trim() ? 'Username is required' : '',
            email: !editForm.email.trim() ? 'Email is required' : !editForm.email.includes('@') ? 'Invalid email format' : '',
        };

        if (newErrors.username || newErrors.email) {
            setFormErrors(newErrors);
            return;
        }

        setIsSaving(true);
        setFormErrors({ username: '', email: '' });
        try {
            await userApi.updateProfile(userId, editForm);
            toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
            await refetch?.(); // specific optional chaining in case refetch is still undefined
            setIsEditing(false);
        } catch (error: any) {
            console.error('Update failed:', error);
            toast({
                title: 'Update Failed',
                description: error.response?.data?.message || 'Could not update profile.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast({ title: 'Invalid Password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            return;
        }
        setIsChangingPassword(true);
        try {
            await userApi.changePassword(userId, newPassword);
            toast({ title: 'Password Changed', description: 'Please login with your new password.' });
            setIsPasswordOpen(false);
            setNewPassword('');
        } catch (error: any) {
            console.error('Password change failed:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to change password.',
                variant: 'destructive',
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await userApi.deleteAccount(userId);
            toast({ title: 'Account Deleted', description: 'We are sorry to see you go.' });
            logout();
            router.push('/auth/login');
        } catch (error: any) {
            console.error('Delete failed:', error);
            toast({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Could not delete account.',
                variant: 'destructive',
            });
            setIsDeleting(false);
        }
    };

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
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <User className="h-10 w-10 text-primary" />
                            </div>
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
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Member since {new Date(userProfile.createdAt || Date.now()).getFullYear()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Details / Edit Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="space-y-1">
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>Manage your public profile information.</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button variant="outline" size="sm" onClick={startEditing}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={cancelEditing} className="h-8 w-8 p-0">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={isEditing ? editForm.username : userProfile.username}
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                            setEditForm({ ...editForm, username: e.target.value });
                                            if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                                        }}
                                        className={formErrors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {formErrors.username && <p className="text-xs text-destructive">{formErrors.username}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={isEditing ? editForm.email : userProfile.email}
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                            setEditForm({ ...editForm, email: e.target.value });
                                            if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                        }}
                                        className={formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value={userProfile.role} disabled className="capitalize bg-muted" />
                                </div>
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={cancelEditing} disabled={isSaving}>Cancel</Button>
                                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>

                        {/* Security Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security & Danger Zone</CardTitle>
                                <CardDescription>Manage your password and account deletion.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">Password</p>
                                            <p className="text-sm text-muted-foreground">Change your password to keep your account secure.</p>
                                        </div>
                                        <Button
                                            variant={isPasswordOpen ? "secondary" : "outline"}
                                            className="gap-2"
                                            onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                                        >
                                            <Lock className="w-4 h-4" /> {isPasswordOpen ? 'Cancel' : 'Change Password'}
                                        </Button>
                                    </div>

                                    {isPasswordOpen && (
                                        <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password (min. 6 chars)"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button onClick={handleChangePassword} disabled={isChangingPassword || newPassword.length < 6}>
                                                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Update Password
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium text-destructive">Delete Account</p>
                                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                                    </div>
                                    <Button variant="destructive" className="gap-2" onClick={handleDeleteAccount} disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

