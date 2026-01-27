'use client';

// =============================================================================
// CLIENT PROVIDERS WRAPPER
// =============================================================================
// This component wraps all client-side providers (Auth, etc.)
// It's separated from the root layout to keep layout.tsx as a server component
// =============================================================================

import { AuthProvider } from '@/context/AuthContext';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
