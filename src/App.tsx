import { Editor } from '@/components';

import { useKeyboardShortcut } from '@/hooks';

export default function App() {
    useKeyboardShortcut(
        'o',
        () => {
            console.log('Shortcut triggred');
        },
        {
            ctrlKey: true,
            metaKey: true,
            shiftKey: true,
            preventDefault: true,
            preventInInput: false
        }
    );
    return (
        <main className="h-full grid grid-cols-12">
            <aside className="col-span-2 hidden border-r border-neutral-300 sm:block dark:border-r-neutral-800">
                <h1>Test</h1>
            </aside>
            <section className="col-span-10">
                <Editor />
            </section>
        </main>
    );
}
