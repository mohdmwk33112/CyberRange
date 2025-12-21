'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLogin } from '@/features/auth/auth.hooks';
import { loginSchema, LoginCredentials } from '@/features/auth/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginPage() {
    const { mutate: login, isPending } = useLogin();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginCredentials) => {
        login(data);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="johndoe" {...register('username')} />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
