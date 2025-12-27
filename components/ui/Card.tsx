import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
}

export function Card({ children, className = '', glass = false, hover = false }: CardProps) {
    return (
        <div
            className={`
        rounded-xl p-6
        ${glass ? 'glass' : 'bg-[var(--surface)] border border-[var(--border)]'}
        ${hover ? 'hover:shadow-lg transition-smooth cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
