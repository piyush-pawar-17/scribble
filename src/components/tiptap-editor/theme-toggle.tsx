import { Button, MoonStarIcon, SunIcon } from '@/components';

interface ThemeToggleProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export function ThemeToggle({ isDarkMode, toggleDarkMode }: ThemeToggleProps) {
    return (
        <Button
            onClick={toggleDarkMode}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            data-style="ghost"
        >
            {isDarkMode ? <MoonStarIcon className="tiptap-button-icon" /> : <SunIcon className="tiptap-button-icon" />}
        </Button>
    );
}
