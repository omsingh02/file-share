'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '@/components/ui';
import { FileMetadata, FileAccess } from '@/lib/types';
import { generateRandomPassword } from '@/lib/utils/crypto';

interface AccessManagerProps {
    file: FileMetadata;
    isOpen: boolean;
    onClose: () => void;
}

export default function AccessManager({ file, isOpen, onClose }: AccessManagerProps) {
    const [accessList, setAccessList] = useState<FileAccess[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAccessList();
        }
    }, [isOpen, file.id]);

    const fetchAccessList = async () => {
        try {
            const response = await fetch(`/api/access?fileId=${file.id}`);
            if (response.ok) {
                const data = await response.json();
                setAccessList(data.access || []);
            }
        } catch (error) {
            console.error('Failed to fetch access list:', error);
        }
    };

    const handleAddAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId: file.id,
                    userIdentifier,
                    password,
                    expiresAt: expiresAt || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add access');
            }

            // Reset form
            setUserIdentifier('');
            setPassword('');
            setExpiresAt('');

            // Refresh list
            await fetchAccessList();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeAccess = async (accessId: string) => {
        if (!confirm('Are you sure you want to revoke this access?')) return;

        try {
            const response = await fetch(`/api/access?id=${accessId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAccessList(accessList.filter(a => a.id !== accessId));
            }
        } catch (error) {
            console.error('Failed to revoke access:', error);
        }
    };

    const handleGeneratePassword = () => {
        setPassword(generateRandomPassword(12));
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage File Access" size="lg">
            <div className="space-y-6">
                {/* File Info */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                    <h3 className="font-medium text-[var(--foreground)] mb-1">{file.originalFilename}</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                        Short link: <code className="px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--primary)]">
                            {window.location.origin}/{file.shortCode}
                        </code>
                    </p>
                </div>

                {/* Add Access Form */}
                <form onSubmit={handleAddAccess} className="space-y-4 p-4 rounded-lg border border-[var(--border)]">
                    <h4 className="font-medium text-[var(--foreground)]">Grant New Access</h4>

                    <Input
                        label="User Identifier (Email/Username)"
                        value={userIdentifier}
                        onChange={(e) => setUserIdentifier(e.target.value)}
                        placeholder="user@example.com"
                        required
                    />

                    <div>
                        <Input
                            label="Password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGeneratePassword}
                            className="mt-2"
                        >
                            🎲 Generate Random Password
                        </Button>
                    </div>

                    <Input
                        label="Expiry Date/Time (Optional)"
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        helperText="Leave empty for permanent access"
                    />

                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                        Grant Access
                    </Button>
                </form>

                {/* Access List */}
                <div>
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Current Access Grants</h4>

                    {accessList.length === 0 ? (
                        <p className="text-sm text-[var(--foreground-secondary)] text-center py-4">
                            No access grants yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {accessList.map((access) => (
                                <div
                                    key={access.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-[var(--foreground)]">{access.userIdentifier}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-[var(--foreground-secondary)]">
                                                Accessed {access.accessCount} times
                                            </span>
                                            {access.expiresAt && (
                                                <Badge variant={isExpired(access.expiresAt) ? 'error' : 'warning'}>
                                                    {isExpired(access.expiresAt) ? 'Expired' : `Expires ${new Date(access.expiresAt).toLocaleDateString()}`}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleRevokeAccess(access.id)}
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
