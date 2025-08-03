import { cn } from '@/lib';

function UIButton({ className, type = 'button', ...props }: React.ComponentProps<'button'>) {
    return (
        <button
            className={cn(
                'cursor-pointer rounded-xl bg-neutral-200 px-4 py-2 hover:bg-neutral-300 focus-visible:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus-visible:bg-neutral-700 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950',
                className
            )}
            type={type}
            {...props}
        />
    );
}

export { UIButton };
