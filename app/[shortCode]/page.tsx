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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">Secure File Access</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Enter your credentials to access this file</p>
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
                        <div className="p-3 rounded bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-900">
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
                    <p className="text-xs text-[var(--text-muted)]">
                        This file is protected. Contact the file owner if you need access.
                    </p>
                </div>
            </Card>
        </div>
    );
}
