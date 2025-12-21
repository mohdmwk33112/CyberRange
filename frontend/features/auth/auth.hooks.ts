import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, LoginCredentials, SignupCredentials } from './auth.api';
import { useAuthStore } from './auth.store';
import { useToast } from '@/hooks/use-toast';

export const useLogin = () => {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast } = useToast();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (data, credentials) => {
            // Decode JWT to get user data
            const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
            const user = {
                sub: tokenPayload.sub,
                username: tokenPayload.username,
                email: credentials.username, // Use login username as email fallback
                role: tokenPayload.role,
            };
            setAuth(data.access_token, user);
            toast({ title: 'Welcome back!', description: 'Logged in successfully.' });
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast({
                title: 'Login failed',
                description: error.response?.data?.message || 'Invalid credentials',
                variant: 'destructive'
            });
        },
    });
};

export const useSignup = () => {
    const router = useRouter();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (credentials: SignupCredentials) => authApi.signup(credentials),
        onSuccess: () => {
            toast({ title: 'Account created', description: 'Please login with your credentials.' });
            router.push('/auth/login');
        },
        onError: (error: any) => {
            toast({
                title: 'Signup failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive'
            });
        },
    });
};
