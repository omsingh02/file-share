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
        rounded-2xl
        ${glass ? 'glass shadow-lg' : 'bg-[var(--background)] shadow-md'}
        ${hover ? 'hover:shadow-xl transition-smooth cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
