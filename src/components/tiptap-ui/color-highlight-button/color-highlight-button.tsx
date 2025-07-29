import { forwardRef, useCallback, useMemo } from 'react';

import {
    Badge,
    Button,
    type ButtonProps,
    COLOR_HIGHLIGHT_SHORTCUT_KEY,
    type UseColorHighlightConfig,
    useColorHighlight
} from '@/components';

import { parseShortcutKeys } from '@/lib';

import { useTiptapEditor } from '@/hooks';

import '@/components/tiptap-ui/color-highlight-button/color-highlight-button.scss';

export interface ColorHighlightButtonProps extends Omit<ButtonProps, 'type'>, UseColorHighlightConfig {
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

export function ColorHighlightShortcutBadge({
    shortcutKeys = COLOR_HIGHLIGHT_SHORTCUT_KEY
}: {
    shortcutKeys?: string;
}) {
    return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 */
export const ColorHighlightButton = forwardRef<HTMLButtonElement, ColorHighlightButtonProps>(
    (
        {
            editor: providedEditor,
            highlightColor,
            text,
            hideWhenUnavailable = false,
            onApplied,
            showShortcut = false,
            onClick,
            children,
            style,
            ...buttonProps
        },
        ref
    ) => {
        const { editor } = useTiptapEditor(providedEditor);
        const { isVisible, canColorHighlight, isActive, handleColorHighlight, label, shortcutKeys } = useColorHighlight(
            {
                editor,
                highlightColor,
                label: text || `Toggle highlight (${highlightColor})`,
                hideWhenUnavailable,
                onApplied
            }
        );

        const handleClick = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event);
                if (event.defaultPrevented) return;
                handleColorHighlight();
            },
            [handleColorHighlight, onClick]
        );

        const buttonStyle = useMemo(
            () =>
                ({
                    ...style,
                    '--highlight-color': highlightColor
                }) as React.CSSProperties,
            [highlightColor, style]
        );

        if (!isVisible) {
            return null;
        }

        return (
            <Button
                type="button"
                data-style="ghost"
                data-active-state={isActive ? 'on' : 'off'}
                role="button"
                tabIndex={-1}
                disabled={!canColorHighlight}
                data-disabled={!canColorHighlight}
                aria-label={label}
                aria-pressed={isActive}
                tooltip={label}
                onClick={handleClick}
                style={buttonStyle}
                {...buttonProps}
                ref={ref}
            >
                {children ?? (
                    <>
                        <span
                            className="tiptap-button-highlight"
                            style={{ '--highlight-color': highlightColor } as React.CSSProperties}
                        />
                        {text && <span className="tiptap-button-text">{text}</span>}
                        {showShortcut && <ColorHighlightShortcutBadge shortcutKeys={shortcutKeys} />}
                    </>
                )}
            </Button>
        );
    }
);

ColorHighlightButton.displayName = 'ColorHighlightButton';
