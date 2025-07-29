import { useCallback, useEffect } from 'react';

interface KeyboardShortcutOptions {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    preventInInput?: boolean;
    preventDefault?: boolean;
}

/**
 * Custom hook to register a global keyboard shortcut.
 * @param {string} key The key to listen for (e.g., 'n', 's', 'Enter'). Case-insensitive.
 * @param {() => void} callback The function to execute when the shortcut is triggered.
 * @param {KeyboardShortcutOptions} [options={}] Options for the shortcut.
 */
export function useKeyboardShortcut(key: string, callback: () => void, options: KeyboardShortcutOptions = {}): void {
    const {
        ctrlKey = false,
        shiftKey = false,
        altKey = false,
        metaKey = false,
        preventInInput = true,
        preventDefault = true
    } = options;

    const memoizedCallback = useCallback(callback, [callback]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();

            const isCtrlOrMetaMatch = (ctrlKey && event.ctrlKey) || (metaKey && event.metaKey);
            const isShiftMatch = shiftKey === event.shiftKey;
            const isAltMatch = altKey === event.altKey;

            if (isKeyMatch && isShiftMatch && isAltMatch && isCtrlOrMetaMatch) {
                const activeElement = document.activeElement;
                const isInInputField =
                    activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
                const isInContentEditable = activeElement instanceof HTMLElement && activeElement.isContentEditable;

                if (preventInInput && (isInInputField || isInContentEditable)) {
                    return;
                }

                if (preventDefault) {
                    event.preventDefault();
                }

                memoizedCallback();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, ctrlKey, shiftKey, altKey, metaKey, preventInInput, preventDefault, memoizedCallback]);
}
