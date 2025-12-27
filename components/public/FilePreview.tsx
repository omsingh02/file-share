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
            console.error('Download error:', error);
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
                            className="max-w-full h-auto rounded-lg shadow-lg"
                        />
                    </div>
                );

            case 'video':
                return (
                    <video
                        src={fileUrl}
                        controls
                        className="w-full rounded-lg shadow-lg"
                        preload="metadata"
                    >
                        Your browser does not support video playback.
                    </video>
                );

            case 'audio':
                return (
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🎵</div>
                            <h3 className="text-lg font-medium text-[var(--foreground)]">{file.originalFilename}</h3>
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
                        className="w-full h-[80vh] rounded-lg"
                        title={file.originalFilename}
                    />
                );

            case 'document':
            case 'other':
            default:
                return (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">{typeInfo.icon}</div>
                        <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">
                            {file.originalFilename}
                        </h3>
                        <p className="text-[var(--foreground-secondary)] mb-6">
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                        <p className="text-sm text-[var(--foreground-muted)] mb-6">
                            Preview not available for this file type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                            {file.originalFilename}
                        </h1>
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            {formatFileSize(file.fileSize)} • {typeInfo.category}
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleDownload}
                        isLoading={isDownloading}
                    >
                        ⬇️ Download
                    </Button>
                </div>

                {/* Preview */}
                <Card glass className="overflow-hidden">
                    {renderPreview()}
                </Card>

                {/* Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--foreground-muted)]">
                        This file was shared securely. Do not share your access credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
