'use client';

import { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '@/components/ui';
import FileUploader from '@/components/admin/FileUploader';
import FileList from '@/components/admin/FileList';
import { FolderOpen, HardDrive, Shield } from 'lucide-react';

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

            {/* Stats - Simple Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Total Files</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-2xl font-semibold text-[var(--text)]">{stats.totalFiles}</p>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Storage Used</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-2xl font-semibold text-[var(--text)]">{formatBytes(stats.totalSize)}</p>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Access Grants</p>
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <p className="text-2xl font-semibold text-[var(--text)]">{stats.totalAccess}</p>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Upload Section */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Upload Files</h2>
                <FileUploader onUploadComplete={handleUploadComplete} />
            </Card>

            {/* Files List */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Your Files</h2>
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
