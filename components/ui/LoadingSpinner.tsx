export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeStyles = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeStyles[size]} border-[var(--border)] border-t-[var(--primary)] rounded-full`}
                 style={{
                     animation: 'spin 0.8s linear infinite',
                 }} />
        </div>
    );
}
