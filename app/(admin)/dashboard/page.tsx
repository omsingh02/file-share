'use client';

import { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '@/components/ui';
import FileUploader from '@/components/admin/FileUploader';
import FileList from '@/components/admin/FileList';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        totalAccess: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchStats();
    }, [refreshKey]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/files/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadComplete = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-[var(--foreground)]">Dashboard</h1>
                <p className="text-lg text-[var(--foreground-secondary)]">
                    Manage your shared files and access control
                </p>
            </div>

            {/* Stats Grid - Improved spacing and design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Files */}
                <Card className="p-6 hover:shadow-lg transition-smooth border border-[var(--border)]">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Total Files
                            </p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-4xl font-bold text-[var(--foreground)] mb-1">
                                    {stats.totalFiles}
                                </p>
                            )}
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Files uploaded
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-3xl shadow-lg">
                            📁
                        </div>
                    </div>
                </Card>

                {/* Total Storage */}
                <Card className="p-6 hover:shadow-lg transition-smooth border border-[var(--border)]">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Total Storage
                            </p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-4xl font-bold text-[var(--foreground)] mb-1">
                                    {formatBytes(stats.totalSize)}
                                </p>
                            )}
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Space used
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] flex items-center justify-center text-3xl shadow-lg">
                            💾
                        </div>
                    </div>
                </Card>

                {/* Total Access Grants */}
                <Card className="p-6 hover:shadow-lg transition-smooth border border-[var(--border)]">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Access Grants
                            </p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-4xl font-bold text-[var(--foreground)] mb-1">
                                    {stats.totalAccess}
                                </p>
                            )}
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Active permissions
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--success)] to-[var(--accent)] flex items-center justify-center text-3xl shadow-lg">
                            🔐
                        </div>
                    </div>
                </Card>
            </div>

            {/* File Upload Section */}
            <Card className="p-8 border border-[var(--border)]">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                        Upload Files
                    </h2>
                    <p className="text-[var(--foreground-secondary)]">
                        Drag and drop files or click to browse
                    </p>
                </div>
                <FileUploader onUploadComplete={handleUploadComplete} />
            </Card>

            {/* File List Section */}
            <Card className="p-8 border border-[var(--border)]">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                        Your Files
                    </h2>
                    <p className="text-[var(--foreground-secondary)]">
                        Manage and share your uploaded files
                    </p>
                </div>
                <FileList key={refreshKey} />
            </Card>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
