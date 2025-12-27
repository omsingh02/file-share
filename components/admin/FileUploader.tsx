'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui';

interface FileUploaderProps {
    onUploadComplete?: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [error, setError] = useState('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    }, []);

    const handleFiles = async (files: File[]) => {
        setError('');
        setIsUploading(true);

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

                const response = await fetch('/api/files/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }

                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            }

            setTimeout(() => {
                setUploadProgress({});
                onUploadComplete?.();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to upload files');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded p-8 text-center
          ${isDragging
                        ? 'border-[var(--primary)] bg-blue-50 dark:bg-blue-950'
                        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    }
        `}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded bg-[var(--primary)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-base font-medium text-[var(--text)] mb-1">
                            Drop files here or click to browse
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Support for any file type
                        </p>
                    </div>

                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />

                    <label htmlFor="file-upload">
                        <Button
                            type="button"
                            variant="primary"
                            isLoading={isUploading}
                            disabled={isUploading}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            Select Files
                        </Button>
                    </label>
                </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text)] truncate">{filename}</span>
                                <span className="text-[var(--text-secondary)]">{progress}%</span>
                            </div>
                            <div className="h-2 bg-[var(--background)] rounded overflow-hidden">
                                <div
                                    className="h-full bg-[var(--primary)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-900">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
