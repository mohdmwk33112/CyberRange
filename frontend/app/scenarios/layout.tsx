'use client';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export default function ScenariosLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
