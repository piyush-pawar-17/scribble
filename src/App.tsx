import { useEffect, useRef, useState } from 'react';

import { format } from 'date-fns';
import { LoaderCircle, Plus, RotateCcw } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Editor,
    Logo
} from '@/components';

import { parseShortcutKeys } from '@/lib';
import { DEFAULT_NOTE_TITLE, type Note, cn, createNote, getNotes } from '@/lib';

import { useKeyboardShortcut } from '@/hooks';

type Notes =
    | {
          status: 'FETCHING';
      }
    | {
          status: 'REFETCHING';
          notes: Note[];
          error?: string;
      }
    | {
          status: 'SUCCESS';
          notes: Note[];
      }
    | {
          status: 'ERROR';
          error: string;
      };

function App() {
    const [notes, setNotes] = useState<Notes>({
        status: 'FETCHING'
    });
    const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
    const [didCreateNoteFail, setDidCreateNoteFail] = useState(false);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    async function handleGetNotes({ initalStatus = 'FETCHING' }: { initalStatus?: 'FETCHING' | 'REFETCHING' } = {}) {
        setNotes((prevState) => {
            if (initalStatus === 'FETCHING') {
                return {
                    status: 'FETCHING'
                };
            }

            if (prevState.status === 'REFETCHING' || prevState.status === 'SUCCESS') {
                return {
                    ...prevState,
                    status: 'REFETCHING'
                };
            }

            return prevState;
        });

        const { code, notes, errorMessage } = await getNotes();

        if (code === 500) {
            setNotes(() => ({
                status: 'ERROR',
                error: errorMessage
            }));
        } else {
            setNotes(() => ({
                status: 'SUCCESS',
                notes
            }));
        }
    }

    useEffect(() => {
        handleGetNotes();
    }, []);

    useKeyboardShortcut(
        'o',
        () => {
            if (!isNewNoteDialogOpen) {
                setIsNewNoteDialogOpen(true);
            }
        },
        {
            ctrlKey: true,
            metaKey: true,
            shiftKey: true,
            preventDefault: true,
            preventInInput: false
        }
    );

    async function handleCreateNote(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);

        const title = formData.get('title') as string;

        const { code } = await createNote(title);

        if (code === 500) {
            setDidCreateNoteFail(true);

            errorTimeoutRef.current = setTimeout(() => {
                setDidCreateNoteFail(false);
            }, 2500);
        } else {
            setIsNewNoteDialogOpen(false);
            handleGetNotes({ initalStatus: 'REFETCHING' });
        }
    }

    return (
        <main className="flex h-full">
            <aside className="hidden w-96 shrink-0 flex-col justify-between border-r border-neutral-300 p-4 sm:flex dark:border-r-neutral-800">
                <div>
                    <h3 className="flex items-center justify-between">
                        <p className="flex items-center gap-2">
                            <Logo />
                            Your notes
                        </p>

                        {notes.status === 'REFETCHING' && <LoaderCircle size={18} className="animate-spin ease-out" />}
                    </h3>

                    <section className="mt-8">
                        {notes.status === 'FETCHING' ? (
                            <div className="flex items-center gap-2">
                                <LoaderCircle size={18} className="animate-spin ease-out" />
                                <p className="text-sm italic">Fetching notes...</p>
                            </div>
                        ) : notes.status === 'ERROR' ? (
                            <div>
                                <p className="text-sm text-red-500 dark:text-red-400">{notes.error}</p>
                                <button
                                    type="button"
                                    className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-200 px-3 py-2 text-sm hover:bg-neutral-300 focus-visible:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus-visible:bg-neutral-700 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950"
                                    onClick={() => handleGetNotes()}
                                >
                                    Refetch
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        ) : notes.status === 'REFETCHING' ? (
                            <div className="flex flex-col gap-4 opacity-50">
                                {notes.notes.map((note) => (
                                    <NotesCard key={note.createdAt} note={note} />
                                ))}
                            </div>
                        ) : notes.notes.length === 0 ? (
                            <div>
                                <p className="italic">No notes created yet</p>
                                <p className="mt-2 py-1 text-sm">
                                    Click on New note or type{' '}
                                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                                        {parseShortcutKeys({ shortcutKeys: 'ctrl-shift-O' })}
                                    </kbd>{' '}
                                    to create a new note
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {notes.notes.map((note) => (
                                    <NotesCard key={note.createdAt} note={note} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 hover:bg-neutral-300 focus-visible:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus-visible:bg-neutral-700 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950">
                            <Plus size={16} /> New note
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleCreateNote}>
                            <DialogHeader className="mb-4">
                                <DialogTitle>Note title</DialogTitle>
                                <DialogDescription className="sr-only">Enter the title for the note</DialogDescription>
                            </DialogHeader>
                            <div className="mb-4 flex flex-1 flex-col gap-2">
                                <label htmlFor="note-title" className="sr-only">
                                    Note title
                                </label>
                                <input
                                    id="note-title"
                                    name="title"
                                    className="rounded-md border border-neutral-400 px-2 py-1 focus:ring focus:ring-neutral-600 focus:outline-none dark:focus:ring-neutral-50"
                                    onChange={() => {
                                        if (errorTimeoutRef.current) {
                                            clearTimeout(errorTimeoutRef.current);
                                            setDidCreateNoteFail(false);
                                        }
                                    }}
                                    defaultValue={DEFAULT_NOTE_TITLE}
                                />
                                <p
                                    className={cn('invisible text-sm text-red-500 dark:text-red-400', {
                                        visible: didCreateNoteFail
                                    })}
                                >
                                    Failed to create the note
                                </p>
                            </div>
                            <DialogFooter className="sm:justify-start">
                                <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-neutral-50 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950">
                                    Create
                                </button>
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-xl bg-neutral-200 px-4 py-2 hover:bg-neutral-300 focus-visible:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus-visible:bg-neutral-700 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950"
                                    >
                                        Close
                                    </button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </aside>
            <section className="w-full">
                <Editor />
            </section>
        </main>
    );
}

interface NoteCardProps {
    note: Note;
}

function NotesCard({ note }: NoteCardProps) {
    return (
        <button className="flex w-full flex-col gap-4 rounded-md bg-neutral-200 p-3 text-left hover:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-900 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950">
            <span className="text-lg font-semibold">{note.title}</span>
            <span className="text-sm">Last updated: {format(note.lastUpdatedAt, "MMM dd, yyyy 'at' HH:mm")}</span>
        </button>
    );
}

export default App;
