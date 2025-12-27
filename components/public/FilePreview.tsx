'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
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
                    <div className="relative">
                        <img
                            src={fileUrl}
                            alt={file.originalFilename}
                            className="max-w-full h-auto rounded"
                        />
                    </div>
                );

            case 'video':
                return (
                    <video
                        src={fileUrl}
                        controls
                        className="w-full rounded"
                        preload="metadata"
                    >
                        Your browser does not support video playback.
                    </video>
                );

            case 'audio':
                return (
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[var(--background)] rounded mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium text-[var(--text)]">{file.originalFilename}</h3>
                        </div>
                        <audio
                            src={fileUrl}
                            controls
                            className="w-full"
                            preload="metadata"
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                );

            case 'pdf':
                return (
                    <iframe
                        src={fileUrl}
                        className="w-full h-[80vh] rounded"
                        title={file.originalFilename}
                    />
                );

            case 'document':
            case 'other':
            default:
                return (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[var(--background)] rounded mx-auto mb-4 flex items-center justify-center">
                            <div className="text-3xl">{typeInfo.icon}</div>
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                            {file.originalFilename}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mb-6">
                            Preview not available for this file type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[var(--background)]">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[var(--text)] mb-1">
                            {file.originalFilename}
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleDownload}
                        isLoading={isDownloading}
                    >
                        Download
                    </Button>
                </div>

                {/* Preview */}
                <Card className="overflow-hidden">
                    {renderPreview()}
                </Card>

                {/* Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        This file was shared securely. Do not share your access credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
