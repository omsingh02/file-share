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
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Dashboard</h1>
                <p className="text-[var(--foreground-secondary)]">Manage your shared files and access control</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card glass>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-1">Total Files</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalFiles}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-2xl">
                            📁
                        </div>
                    </div>
                </Card>

                <Card glass>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-1">Total Storage</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-bold text-[var(--foreground)]">{formatBytes(stats.totalSize)}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-dark)] flex items-center justify-center text-2xl">
                            💾
                        </div>
                    </div>
                </Card>

                <Card glass>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-1">Total Access Grants</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalAccess}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-2xl">
                            🔐
                        </div>
                    </div>
                </Card>
            </div>

            {/* File Upload */}
            <Card glass>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Upload Files</h2>
                <FileUploader onUploadComplete={handleUploadComplete} />
            </Card>

            {/* File List */}
            <Card glass>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Your Files</h2>
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
