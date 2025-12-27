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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[var(--text)]">Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Manage your files and access control
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-[var(--text-secondary)] mb-2">Total Files</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-semibold text-[var(--text)]">{stats.totalFiles}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-[var(--text-secondary)] mb-2">Storage Used</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-semibold text-[var(--text)]">{formatBytes(stats.totalSize)}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-[var(--text-secondary)] mb-2">Access Grants</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-3xl font-semibold text-[var(--text)]">{stats.totalAccess}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Upload Section */}
            <Card className="p-6">
                <h2 className="text-base font-semibold text-[var(--text)] mb-4">Upload Files</h2>
                <FileUploader onUploadComplete={handleUploadComplete} />
            </Card>

            {/* Files List */}
            <Card className="p-6">
                <h2 className="text-base font-semibold text-[var(--text)] mb-4">Your Files</h2>
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
