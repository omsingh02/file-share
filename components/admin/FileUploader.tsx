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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: isDragging ? '2px dashed #3b82f6' : '2px dashed #3a3a3a',
                    borderRadius: '6px',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#1e3a5f' : 'transparent',
                    transition: 'all 0.2s',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '6px',
                        backgroundColor: '#3a3a3a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg style={{ width: '32px', height: '32px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div>
                        <p style={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#e0e0e0',
                            marginBottom: '0.25rem',
                        }}>
                            Drop files here or click to browse
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                            Support for any file type
                        </p>
                    </div>

                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        disabled={isUploading}
                    />

                    <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                        style={{
                            padding: '0.625rem 1.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            opacity: isUploading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isUploading) e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            if (!isUploading) e.currentTarget.style.backgroundColor = '#3b82f6';
                        }}
                    >
                        {isUploading ? 'Uploading...' : 'Select Files'}
                    </button>
                </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{
                                    color: '#e0e0e0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>{filename}</span>
                                <span style={{ color: '#9ca3af' }}>{progress}%</span>
                            </div>
                            <div style={{
                                height: '0.5rem',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}>
                                <div
                                    style={{
                                        height: '100%',
                                        backgroundColor: '#3b82f6',
                                        width: `${progress}%`,
                                        transition: 'width 0.3s',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '4px',
                    backgroundColor: '#7f1d1d',
                    border: '1px solid #ef4444',
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
                </div>
            )}
        </div>
    );
}
