import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-lg ${className}`}>
            {children}
        </div>
    );
}
