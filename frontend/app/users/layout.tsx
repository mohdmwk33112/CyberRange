'use client';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
