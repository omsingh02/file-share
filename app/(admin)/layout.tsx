import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FileText, LogOut } from 'lucide-react';

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
        <div className="min-h-screen bg-[var(--surface)]">
            {/* Simple, Clean Header */}
            <header className="bg-white dark:bg-[var(--surface)] border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-[var(--text)]">File Share</h1>
                                <p className="text-xs text-[var(--text-secondary)]">Admin</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
                                {user.email}
                            </span>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
