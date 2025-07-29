import { forwardRef, useCallback } from 'react';

import {
    Badge,
    Button,
    type ButtonProps,
    TEXT_ALIGN_SHORTCUT_KEYS,
    type TextAlign,
    type UseTextAlignConfig,
    useTextAlign
} from '@/components';

import { parseShortcutKeys } from '@/lib';

import { useTiptapEditor } from '@/hooks';

export interface TextAlignButtonProps extends Omit<ButtonProps, 'type'>, UseTextAlignConfig {
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Optional show shortcut keys in the button.
     * @default false
     */
    showShortcut?: boolean;
}

export function TextAlignShortcutBadge({
    align,
    shortcutKeys = TEXT_ALIGN_SHORTCUT_KEYS[align]
}: {
    align: TextAlign;
    shortcutKeys?: string;
}) {
    return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
export const TextAlignButton = forwardRef<HTMLButtonElement, TextAlignButtonProps>(
    (
        {
            editor: providedEditor,
            align,
            text,
            hideWhenUnavailable = false,
            onAligned,
            showShortcut = false,
            onClick,
            children,
            ...buttonProps
        },
        ref
    ) => {
        const { editor } = useTiptapEditor(providedEditor);
        const { isVisible, handleTextAlign, label, canAlign, isActive, Icon, shortcutKeys } = useTextAlign({
            editor,
            align,
            hideWhenUnavailable,
            onAligned
        });

        const handleClick = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event);
                if (event.defaultPrevented) return;
                handleTextAlign();
            },
            [handleTextAlign, onClick]
        );

        if (!isVisible) {
            return null;
        }

        return (
            <Button
                type="button"
                disabled={!canAlign}
                data-style="ghost"
                data-active-state={isActive ? 'on' : 'off'}
                data-disabled={!canAlign}
                role="button"
                tabIndex={-1}
                aria-label={label}
                aria-pressed={isActive}
                tooltip={label}
                onClick={handleClick}
                {...buttonProps}
                ref={ref}
            >
                {children ?? (
                    <>
                        <Icon className="tiptap-button-icon" />
                        {text && <span className="tiptap-button-text">{text}</span>}
                        {showShortcut && <TextAlignShortcutBadge align={align} shortcutKeys={shortcutKeys} />}
                    </>
                )}
            </Button>
        );
    }
);

TextAlignButton.displayName = 'TextAlignButton';
