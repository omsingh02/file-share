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
        <div className="min-h-screen bg-[var(--background)]">
            {/* Admin Header */}
            <header className="glass sticky top-0 z-40 border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]" />
                            <h1 className="text-xl font-bold gradient-text">File Share</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-[var(--foreground-secondary)]">{user.email}</span>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-smooth"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
