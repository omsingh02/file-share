'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Input, Button, LoadingSpinner } from '@/components/ui';
import FilePreview from '@/components/public/FilePreview';

export default function ShortCodePage() {
    const params = useParams();
    const shortCode = params.shortCode as string;

    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fileData, setFileData] = useState<any>(null);

    // Check if already verified in session
    useEffect(() => {
        const sessionKey = `file_access_${shortCode}`;
        const sessionData = sessionStorage.getItem(sessionKey);

        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                setFileData(data);
                setIsVerified(true);
            } catch (e) {
                sessionStorage.removeItem(sessionKey);
            }
        }
    }, [shortCode]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shortCode,
                    userIdentifier,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            // Save to session
            const sessionKey = `file_access_${shortCode}`;
            sessionStorage.setItem(sessionKey, JSON.stringify(data));

            setFileData(data);
            setIsVerified(true);
        } catch (err: any) {
            setError(err.message || 'Failed to verify access');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isVerified && fileData) {
        return <FilePreview fileData={fileData} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--accent)] opacity-20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--primary)] opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <Card glass className="w-full max-w-md animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Secure File Access</h1>
                    <p className="text-[var(--foreground-secondary)]">Enter your credentials to access this file</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <Input
                        label="Email or Username"
                        value={userIdentifier}
                        onChange={(e) => setUserIdentifier(e.target.value)}
                        placeholder="your@email.com"
                        required
                        autoComplete="username"
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />

                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isVerifying}
                    >
                        Access File
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--foreground-muted)]">
                        This file is protected. Contact the file owner if you need access.
                    </p>
                </div>
            </Card>
        </div>
    );
}
