'use client';

import { useState } from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
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

    const docs = [
        {
            uri: fileUrl,
            fileName: file.originalFilename,
            fileType: file.mimeType,
        }
    ];

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
                            backgroundColor: '#2a2a2a',
                        }}
                    />
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
