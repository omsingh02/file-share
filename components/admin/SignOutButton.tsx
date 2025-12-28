'use client';

export default function SignOutButton() {
    return (
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
    );
}
