'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, User } from './admin.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, User as UserIcon, KeyRound, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

export function UserManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: adminApi.getAllUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'User deleted', description: 'The user has been successfully removed.' });
        },
        onError: (err: any) => {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to delete user',
                variant: 'destructive',
            });
        },
    });

    const resetMutation = useMutation({
        mutationFn: ({ userId, password }: { userId: string, password: string }) =>
            adminApi.resetUserPassword(userId, password),
        onSuccess: () => {
            toast({ title: 'Password reset', description: 'The user password has been successfully updated.' });
        },
        onError: (err: any) => {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to reset password',
                variant: 'destructive',
            });
        },
    });

    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [resetData, setResetData] = React.useState<{ id: string, username: string } | null>(null);
    const [newPassword, setNewPassword] = React.useState('');

    const handleResetPassword = (userId: string, username: string) => {
        setResetData({ id: userId, username });
        setNewPassword('');
    };

    const confirmReset = () => {
        if (newPassword.length >= 8) {
            resetMutation.mutate({ userId: resetData!.id, password: newPassword });
            setResetData(null);
        } else {
            toast({
                title: 'Invalid Password',
                description: 'Password must meet the new security requirements (8-20 chars).',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = (userId: string) => {
        setDeleteId(userId);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
        }
    };

    if (isLoading) return <div className="p-4 text-center">Loading users...</div>;
    if (error) return <div className="p-4 text-red-500">Failed to load users.</div>;

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    User Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30px]"></TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <UserRow
                                    key={user._id}
                                    user={user}
                                    onResetPassword={() => handleResetPassword(user._id, user.username)}
                                    onDelete={() => handleDelete(user._id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Custom Delete Confirmation Modal */}
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <Card className="w-full max-w-md shadow-2xl border-destructive/20 scale-in-center">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <Trash2 className="w-5 h-5" />
                                    Confirm Deletion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this user? This action is permanent and cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={confirmDelete}>Delete User</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Custom Password Reset Modal */}
                {resetData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <Card className="w-full max-w-md shadow-2xl border-primary/20 scale-in-center">
                            <CardHeader className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-4 text-muted-foreground"
                                    onClick={() => setResetData(null)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-primary" />
                                    Reset Password
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">Setting new password for <span className="font-bold text-foreground text-primary">{resetData.username}</span></p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Enter secure password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Must be 8-20 characters with uppercase, lowercase, and numbers.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setResetData(null)}>Cancel</Button>
                                    <Button onClick={confirmReset} disabled={newPassword.length < 8}>Update Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function UserRow({ user, onResetPassword, onDelete }: { user: User, onResetPassword: () => void, onDelete: () => void }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <>
            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetPassword}
                        className="text-primary hover:text-primary/90"
                        title="Reset Password"
                    >
                        <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-destructive hover:text-destructive/90"
                        disabled={user.role === 'admin'} // Prevent deleting admins for now
                        title="Delete User"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={5} className="p-0">
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm animation-in slide-in-from-top-2 fade-in duration-200">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">User ID</span>
                                <p className="font-mono text-xs">{user._id}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">Joined Date</span>
                                <p className="font-mono text-xs">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : user._id && /^[0-9a-fA-F]{24}$/.test(user._id)
                                            ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString()
                                            : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
