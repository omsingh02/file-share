import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Middleware ensures user is authenticated
    // We can safely get user data here for display purposes
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback for user email (defensive programming)
    const userEmail = user?.email || 'User';
    const userInitial = userEmail.charAt(0).toUpperCase();

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
                                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
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
                                        {userInitial}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.8125rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 500,
                                }}>
                                    {userEmail}
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
