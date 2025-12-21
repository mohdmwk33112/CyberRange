'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSignup } from '@/features/auth/auth.hooks';
import { signupSchema, SignupCredentials } from '@/features/auth/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function SignupPage() {
    const { mutate: signup, isPending } = useSignup();
    const { register, handleSubmit, formState: { errors } } = useForm<SignupCredentials>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = (data: SignupCredentials) => {
        signup(data);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create a new account to get started.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="johndoe" {...register('username')} />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Creating account...' : 'Sign Up'}
                    </Button>
                    <div className="text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
