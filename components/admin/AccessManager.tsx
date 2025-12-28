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
    const [maxDownloads, setMaxDownloads] = useState('');
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
            // Error handled silently
        }
    };

    const handleAddAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Convert datetime-local to ISO string with timezone
            const expiresAtISO = expiresAt ? new Date(expiresAt).toISOString() : null;

            const response = await fetch('/api/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId: file.id,
                    userIdentifier,
                    password,
                    expiresAt: expiresAtISO,
                    maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
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
            setMaxDownloads('');

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
            // Error handled silently
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* File Info */}
                <div style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #3a3a3a',
                }}>
                    <h3 style={{
                        fontWeight: 500,
                        color: '#e0e0e0',
                        marginBottom: '0.25rem',
                        fontSize: '0.95rem',
                    }}>{file.originalFilename}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                        Short link: <code style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '3px',
                            backgroundColor: '#252525',
                            color: '#3b82f6',
                            fontSize: '0.8rem',
                        }}>
                            {window.location.origin}/{file.shortCode}
                        </code>
                    </p>
                </div>

                {/* Add Access Form */}
                <form onSubmit={handleAddAccess} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3a3a',
                }}>
                    <h4 style={{
                        fontWeight: 500,
                        color: '#e0e0e0',
                        margin: 0,
                        fontSize: '0.95rem',
                    }}>Grant New Access</h4>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>User Identifier (Email/Username)</label>
                        <input
                            value={userIdentifier}
                            onChange={(e) => setUserIdentifier(e.target.value)}
                            placeholder="user@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#3a3a3a';
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>Password</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#3a3a3a';
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8rem',
                                color: '#9ca3af',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#e0e0e0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                            Generate Random Password
                        </button>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>Max Downloads (Optional)</label>
                        <input
                            type="number"
                            min="1"
                            value={maxDownloads}
                            onChange={(e) => setMaxDownloads(e.target.value)}
                            placeholder="Unlimited"
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#3a3a3a';
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '0.5rem',
                        }}>Expiry Date/Time (Optional)</label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#1a1a1a',
                                color: '#e0e0e0',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#3a3a3a';
                            }}
                        />
                        <p style={{
                            marginTop: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                        }}>Leave empty for permanent access</p>
                    </div>

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

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#3b82f6';
                        }}
                    >
                        {isLoading ? 'Granting Access...' : 'Grant Access'}
                    </button>
                </form>

                {/* Access List */}
                <div>
                    <h4 style={{
                        fontWeight: 500,
                        color: '#e0e0e0',
                        marginBottom: '0.75rem',
                        fontSize: '0.95rem',
                    }}>Current Access Grants</h4>

                    {accessList.length === 0 ? (
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            textAlign: 'center',
                            padding: '1rem 0',
                        }}>
                            No access grants yet
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {accessList.map((access) => (
                                <div
                                    key={access.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #3a3a3a',
                                        backgroundColor: '#252525',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            fontWeight: 500,
                                            color: '#e0e0e0',
                                            margin: 0,
                                            fontSize: '0.875rem',
                                        }}>{access.userIdentifier}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                Accessed {access.accessCount} times
                                            </span>
                                            {access.maxDownloads && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: '3px',
                                                    backgroundColor: (access.downloadCount || 0) >= access.maxDownloads ? '#7f1d1d' : '#1e3a8a',
                                                    color: (access.downloadCount || 0) >= access.maxDownloads ? '#fecaca' : '#93c5fd',
                                                }}>
                                                    {access.downloadCount || 0}/{access.maxDownloads} downloads
                                                </span>
                                            )}
                                            {access.expiresAt && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: '3px',
                                                    backgroundColor: isExpired(access.expiresAt) ? '#7f1d1d' : '#78350f',
                                                    color: isExpired(access.expiresAt) ? '#fecaca' : '#fcd34d',
                                                }}>
                                                    {isExpired(access.expiresAt) ? 'Expired' : `Expires ${new Date(access.expiresAt).toLocaleDateString()}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRevokeAccess(access.id)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.8rem',
                                            color: '#ef4444',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #3a3a3a',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: 500,
                                            marginLeft: '1rem',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#7f1d1d';
                                            e.currentTarget.style.borderColor = '#ef4444';
                                            e.currentTarget.style.color = '#ffffff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = '#3a3a3a';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                    >
                                        Revoke
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
