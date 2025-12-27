import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[var(--background-secondary)]">
            {/* Admin Header - Improved design */}
            <header className="bg-[var(--background)] sticky top-0 z-50 border-b border-[var(--border)] shadow-sm backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl shadow-lg">
                                📁
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">File Share</h1>
                                <p className="text-xs text-[var(--foreground-muted)]">Admin Panel</p>
                            </div>
                        </div>

                        {/* User Info and Actions */}
                        <div className="flex items-center space-x-6">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {user.email}
                                </p>
                                <p className="text-xs text-[var(--foreground-muted)]">Administrator</p>
                            </div>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-[var(--foreground)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] rounded-xl transition-smooth border border-[var(--border)]"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {children}
            </main>
        </div>
    );
}
