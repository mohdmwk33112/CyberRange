'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, User } from './admin.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, User as UserIcon, KeyRound } from 'lucide-react';
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

    const handleResetPassword = (userId: string) => {
        const password = window.prompt("Enter new password for the user:");
        if (password && password.length >= 6) {
            resetMutation.mutate({ userId, password });
        } else if (password) {
            alert("Password must be at least 6 characters long.");
        }
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteMutation.mutate(userId);
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
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResetPassword(user._id)}
                                            className="text-primary hover:text-primary/90"
                                            title="Reset Password"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(user._id)}
                                            className="text-destructive hover:text-destructive/90"
                                            disabled={user.role === 'admin'} // Prevent deleting admins for now
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
