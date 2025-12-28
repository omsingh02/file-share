'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '448px',
                padding: '2rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '6px',
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#e0e0e0',
                        marginBottom: '0.25rem',
                        margin: '0 0 0.25rem 0',
                    }}>Secure File Access</h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#9ca3af',
                        margin: 0,
                    }}>Enter your credentials to access this file</p>
                </div>

                <form onSubmit={handleVerify} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>Email or Username</label>
                        <input
                            value={userIdentifier}
                            onChange={(e) => setUserIdentifier(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="username"
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '4px',
                            backgroundColor: '#7f1d1d',
                            border: '1px solid #ef4444',
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isVerifying}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isVerifying ? 'not-allowed' : 'pointer',
                            opacity: isVerifying ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isVerifying) e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            if (!isVerifying) e.currentTarget.style.backgroundColor = '#3b82f6';
                        }}
                    >
                        {isVerifying ? 'Verifying...' : 'Access File'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                    }}>
                        This file is protected. Contact the file owner if you need access.
                    </p>
                </div>
            </div>
        </div>
    );
}
