'use client';

import { useState } from 'react';
import { getFileTypeInfo, formatFileSize } from '@/lib/utils/fileTypes';

interface FilePreviewProps {
    fileData: {
        fileUrl: string;
        file: {
            originalFilename: string;
            mimeType: string;
            fileSize: number;
        };
    };
}

export default function FilePreview({ fileData }: FilePreviewProps) {
    const { fileUrl, file } = fileData;
    const typeInfo = getFileTypeInfo(file.mimeType);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.originalFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert('Failed to download file');
        } finally {
            setIsDownloading(false);
        }
    };

    const renderPreview = () => {
        switch (typeInfo.category) {
            case 'image':
                return (
                    <div style={{ position: 'relative' }}>
                        <img
                            src={fileUrl}
                            alt={file.originalFilename}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '6px',
                                display: 'block',
                            }}
                        />
                    </div>
                );

            case 'video':
                return (
                    <video
                        src={fileUrl}
                        controls
                        preload="metadata"
                        style={{
                            width: '100%',
                            borderRadius: '6px',
                            backgroundColor: '#000',
                        }}
                    >
                        Your browser does not support video playback.
                    </video>
                );

            case 'audio':
                return (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '6px',
                                margin: '0 auto 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: '#e0e0e0',
                                margin: 0,
                            }}>{file.originalFilename}</h3>
                        </div>
                        <audio
                            src={fileUrl}
                            controls
                            preload="metadata"
                            style={{
                                width: '100%',
                                outline: 'none',
                            }}
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                );

            case 'pdf':
                return (
                    <iframe
                        src={fileUrl}
                        title={file.originalFilename}
                        style={{
                            width: '100%',
                            height: '80vh',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#fff',
                        }}
                    />
                );

            case 'document':
            case 'other':
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '6px',
                            margin: '0 auto 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', opacity: 0.7 }}>{typeInfo.icon}</div>
                        </div>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 500,
                            color: '#e0e0e0',
                            marginBottom: '0.5rem',
                        }}>
                            {file.originalFilename}
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '1.5rem',
                        }}>
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1.5rem',
                        }}>
                            Preview not available for this file type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem 1rem',
            backgroundColor: '#1a1a1a',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#e0e0e0',
                            marginBottom: '0.25rem',
                            margin: '0 0 0.25rem 0',
                        }}>
                            {file.originalFilename}
                        </h1>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            margin: 0,
                        }}>
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        style={{
                            padding: '0.625rem 1.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                            opacity: isDownloading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isDownloading) e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            if (!isDownloading) e.currentTarget.style.backgroundColor = '#3b82f6';
                        }}
                    >
                        {isDownloading ? 'Downloading...' : 'Download'}
                    </button>
                </div>

                {/* Preview */}
                <div style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a',
                    overflow: 'hidden',
                }}>
                    {renderPreview()}
                </div>

                {/* Info */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                    }}>
                        This file was shared securely. Do not share your access credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
