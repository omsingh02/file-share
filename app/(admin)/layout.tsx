'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
            }}>
                <div style={{ color: '#9ca3af' }}>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
            {/* Professional Header */}
            <header style={{
                backgroundColor: '#111111',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0.875rem 2rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        {/* Logo & Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                            }}>
                                <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    margin: 0,
                                    letterSpacing: '-0.025em',
                                }}>File Share</h1>
                                <p style={{
                                    fontSize: '0.6875rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    margin: 0,
                                    fontWeight: 500,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>Admin Panel</p>
                            </div>
                        </div>

                        {/* User Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                paddingRight: '1.25rem',
                                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#3b82f6',
                                    }}>
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.8125rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 500,
                                }}>
                                    {user.email}
                                </span>
                            </div>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        backgroundColor: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    }}
                                >
                                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Sign Out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2.5rem 2rem',
            }}>
                {children}
            </main>
        </div>
    );
}
