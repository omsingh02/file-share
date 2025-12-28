'use client';

import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
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
    const [textContent, setTextContent] = useState<string>('');
    const [isLoadingText, setIsLoadingText] = useState(false);

    // Check if file is text-based
    const isTextFile = file.mimeType.startsWith('text/') || 
                      file.mimeType === 'application/json' ||
                      file.mimeType === 'application/javascript' ||
                      file.mimeType === 'application/xml';

    // Load text content for text-based files
    useEffect(() => {
        if (isTextFile) {
            setIsLoadingText(true);
            fetch(fileUrl)
                .then(res => res.text())
                .then(text => setTextContent(text))
                .catch(() => setTextContent('Failed to load file content'))
                .finally(() => setIsLoadingText(false));
        }
    }, [fileUrl, isTextFile]);

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
        // Images
        if (typeInfo.category === 'image') {
            return (
                <img
                    src={fileUrl}
                    alt={file.originalFilename}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                    }}
                />
            );
        }

        // Videos
        if (typeInfo.category === 'video') {
            return (
                <video
                    src={fileUrl}
                    controls
                    preload="metadata"
                    style={{
                        width: '100%',
                        backgroundColor: '#000',
                    }}
                >
                    Your browser does not support video playback.
                </video>
            );
        }

        // Audio
        if (typeInfo.category === 'audio') {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
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
                        margin: '0 0 1.5rem 0',
                    }}>{file.originalFilename}</h3>
                    <audio
                        src={fileUrl}
                        controls
                        preload="metadata"
                        style={{ width: '100%', outline: 'none' }}
                    >
                        Your browser does not support audio playback.
                    </audio>
                </div>
            );
        }

        // Text files (markdown, code, txt, json, etc.)
        if (isTextFile) {
            if (isLoadingText) {
                return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <p style={{ color: '#9ca3af' }}>Loading preview...</p>
                    </div>
                );
            }

            return (
                <div style={{ padding: '1.5rem' }}>
                    <pre style={{
                        backgroundColor: '#1a1a1a',
                        color: '#e0e0e0',
                        padding: '1.5rem',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                        margin: 0,
                        maxHeight: '70vh',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}>
                        <code>{textContent}</code>
                    </pre>
                </div>
            );
        }

        // Documents (PDF, DOCX, XLSX, PPTX) - use DocViewer
        if (typeInfo.category === 'pdf' || typeInfo.category === 'document') {
            const docs = [
                {
                    uri: fileUrl,
                    fileName: file.originalFilename,
                }
            ];

            return (
                <DocViewer
                    documents={docs}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                        header: {
                            disableHeader: true,
                        },
                    }}
                    style={{
                        minHeight: '70vh',
                        height: '70vh',
                        width: '100%',
                        backgroundColor: '#2a2a2a',
                    }}
                />
            );
        }

        // Fallback for unsupported types
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
                }}>
                    Preview not available for this file type
                </p>
            </div>
        );
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
                    minHeight: '70vh',
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
