'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, LoadingSpinner } from '@/components/ui';
import { FileMetadata } from '@/lib/types';
import { formatFileSize, getFileTypeInfo } from '@/lib/utils/fileTypes';
import AccessManager from './AccessManager';

export default function FileList() {
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
    const [showAccessManager, setShowAccessManager] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/files');
            if (response.ok) {
                const data = await response.json();
                setFiles(data.files || []);
            }
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setFiles(files.filter(f => f.id !== fileId));
            }
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const copyShortLink = (shortCode: string) => {
        const url = `${window.location.origin}/${shortCode}`;
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
    };

    const handleManageAccess = (file: FileMetadata) => {
        setSelectedFile(file);
        setShowAccessManager(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg text-[var(--foreground-secondary)]">No files uploaded yet</p>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">Upload your first file to get started</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {files.map((file) => {
                    const typeInfo = getFileTypeInfo(file.mimeType);

                    return (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-smooth"
                        >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="text-3xl">{typeInfo.icon}</div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-[var(--foreground)] truncate">
                                        {file.originalFilename}
                                    </h3>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <span className="text-sm text-[var(--foreground-secondary)]">
                                            {formatFileSize(file.fileSize)}
                                        </span>
                                        <Badge variant="default">{typeInfo.category}</Badge>
                                        <span className="text-xs text-[var(--foreground-muted)]">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyShortLink(file.shortCode)}
                                    title="Copy short link"
                                >
                                    🔗 Copy Link
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleManageAccess(file)}
                                    title="Manage access"
                                >
                                    🔐 Access
                                </Button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(file.id)}
                                    title="Delete file"
                                >
                                    🗑️
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedFile && (
                <AccessManager
                    file={selectedFile}
                    isOpen={showAccessManager}
                    onClose={() => {
                        setShowAccessManager(false);
                        setSelectedFile(null);
                    }}
                />
            )}
        </>
    );
}
