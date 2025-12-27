'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Upload } from 'lucide-react';

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

            // Clear progress after a delay
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
          border-2 border-dashed rounded-xl p-8 text-center transition-smooth
          ${isDragging
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    }
        `}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                    </div>

                    <div>
                        <p className="text-lg font-medium text-[var(--foreground)] mb-1">
                            Drop files here or click to browse
                        </p>
                        <p className="text-sm text-[var(--foreground-secondary)]">
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
                                <span className="text-[var(--foreground)] truncate">{filename}</span>
                                <span className="text-[var(--foreground-secondary)]">{progress}%</span>
                            </div>
                            <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
