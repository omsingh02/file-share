import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--text)] mb-2"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-3 py-2 rounded
          bg-[var(--surface)] text-[var(--text)]
          border ${error ? 'border-[var(--error)]' : 'border-[var(--border)]'}
          focus:outline-none focus:ring-2 ${error ? 'focus:ring-[var(--error)]' : 'focus:ring-[var(--primary)]'}
          placeholder:text-[var(--text-muted)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{helperText}</p>
            )}
        </div>
    );
}
