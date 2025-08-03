import { cn } from '@/lib';

function Key({ className, children, ...props }: React.ComponentProps<'kbd'>) {
    return (
        <kbd
            className={cn(
                'rounded border border-neutral-300 bg-neutral-200 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800',
                className
            )}
            {...props}
        >
            {children}
        </kbd>
    );
}

export { Key };
