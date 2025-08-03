import { useEffect, useRef, useState } from 'react';

import { type JSONContent } from '@tiptap/react';
import { format, formatDistance } from 'date-fns';
import { LoaderCircle, Plus, RotateCcw } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import {
    UIButton as Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Editor,
    Logo,
    ThemeToggle
} from '@/components';

import { DEFAULT_NOTE_TITLE, type Note, cn, createNote, getNotes, isMac, updateNote } from '@/lib';

import { useKeyboardShortcut } from '@/hooks';

import emptyState from '@/assets/empty-state.svg';
import errorState from '@/assets/error-state.svg';
import fetchingState from '@/assets/fetching-state.svg';

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
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleUpdateNote = useDebouncedCallback(async (noteId: number, value: JSONContent) => {
        await updateNote(noteId, value);
        await handleGetNotes({ initalStatus: 'REFETCHING' });
    }, 500);

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

            if (notes.length > 0) {
                setSelectedNote(notes[0]);
            }
        }
    }

    useEffect(() => {
        handleGetNotes();
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setIsDarkMode(mediaQuery.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const initialDarkMode =
            !!document.querySelector('meta[name="color-scheme"][content="dark"]') ||
            window.matchMedia('(prefers-color-scheme: dark)').matches;

        setIsDarkMode(initialDarkMode);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark);

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
                            My Scribbles
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
                                <Button
                                    className="flex items-center gap-2"
                                    type="button"
                                    onClick={() => handleGetNotes()}
                                >
                                    Refetch
                                    <RotateCcw size={16} />
                                </Button>
                            </div>
                        ) : notes.status === 'REFETCHING' ? (
                            <div className="flex flex-col gap-4 opacity-50">
                                <NoteCards
                                    notes={notes.notes}
                                    selectedNote={selectedNote}
                                    setSelectedNote={setSelectedNote}
                                />
                            </div>
                        ) : notes.notes.length === 0 ? (
                            <div>
                                <p className="italic">No notes created yet</p>
                                <p className="mt-2 py-1 text-sm">
                                    Click on <span className="text-base font-bold">New note</span> or type{' '}
                                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                                        {isMac() ? 'Cmd' : 'Ctrl'} + Shift + O
                                    </kbd>{' '}
                                    to create a new note
                                </p>
                            </div>
                        ) : (
                            <NoteCards
                                notes={notes.notes}
                                selectedNote={selectedNote}
                                setSelectedNote={setSelectedNote}
                            />
                        )}
                    </section>
                </div>

                <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center justify-center gap-2">
                            <Plus size={16} /> New note
                        </Button>
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
                                <Button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-neutral-50 hover:bg-blue-800 focus-visible:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 focus-visible:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:bg-blue-700 dark:focus-visible:ring-blue-700 dark:focus-visible:ring-offset-neutral-950"
                                >
                                    Create
                                </Button>
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </aside>
            <section className="w-full">
                {notes.status === 'FETCHING' ? (
                    <div className="p-4">
                        <div className="ml-auto w-fit">
                            <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                        </div>
                        <img src={fetchingState} alt="Fetching state for notes" className="mx-auto" />
                        <div className="flex items-center justify-center gap-2 p-4">
                            <LoaderCircle size={18} className="animate-spin ease-out" />
                            <p className="italic">Fetching notes...</p>
                        </div>
                    </div>
                ) : notes.status === 'ERROR' ? (
                    <div className="p-4">
                        <div className="ml-auto w-fit">
                            <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                        </div>
                        <img src={errorState} alt="Error state for notes" className="mx-auto" />
                        <p className="mb-4 text-center">Error fetching notes</p>
                        <Button
                            className="mx-auto flex items-center gap-2"
                            type="button"
                            onClick={() => handleGetNotes()}
                        >
                            Refetch
                            <RotateCcw size={16} />
                        </Button>
                    </div>
                ) : notes.status === 'REFETCHING' ? (
                    <Editor
                        key={selectedNote?.id}
                        note={selectedNote}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        handleUpdateNote={handleUpdateNote}
                    />
                ) : notes.notes.length === 0 ? (
                    <div className="p-4">
                        <div className="ml-auto w-fit">
                            <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                        </div>
                        <img src={emptyState} alt="Empty state for notes" className="mx-auto" />
                        <p className="text-center italic">No notes created yet</p>
                        <p className="mt-2 py-1 text-center text-sm">
                            Click on <span className="text-base font-bold">New note</span> or type{' '}
                            <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                                {isMac() ? 'Cmd' : 'Ctrl'} + Shift + O
                            </kbd>{' '}
                            to create a new note
                        </p>
                    </div>
                ) : (
                    <Editor
                        key={selectedNote?.id}
                        note={selectedNote}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        handleUpdateNote={handleUpdateNote}
                    />
                )}
            </section>
        </main>
    );
}

interface NoteCardsProps {
    notes: Note[];
    selectedNote: Note | null;
    setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
}

function NoteCards({ notes, selectedNote, setSelectedNote }: NoteCardsProps) {
    let noteIndex = 0;

    return (
        <div className="flex flex-col gap-6">
            {Object.entries(Object.groupBy(notes, ({ lastUpdatedAt }) => format(lastUpdatedAt, 'MMM dd, yyyy'))).map(
                ([date, notes]) => {
                    if (!notes) {
                        return null;
                    }

                    return (
                        <div>
                            <p className="mb-2 text-lg">{date}</p>
                            <div className="flex flex-col gap-3">
                                {notes.map((note) => {
                                    noteIndex += 1;

                                    return (
                                        <NoteCard
                                            note={note}
                                            noteIndex={noteIndex}
                                            selectedNote={selectedNote}
                                            setSelectedNote={setSelectedNote}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    );
}

interface NoteCardProps {
    note: Note;
    selectedNote: Note | null;
    setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
    noteIndex: number;
}

function NoteCard({ note, selectedNote, setSelectedNote, noteIndex }: NoteCardProps) {
    useKeyboardShortcut(
        noteIndex.toString(),
        () => {
            if (noteIndex <= 9) {
                setSelectedNote(note);
            }
        },
        {
            ctrlKey: true,
            metaKey: true,
            shiftKey: false,
            preventDefault: true,
            preventInInput: false
        }
    );

    return (
        <Button
            key={note.createdAt}
            className={cn(
                'flex w-full flex-col gap-2 rounded-md bg-neutral-200 text-left focus-visible:bg-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800',
                {
                    'bg-blue-700 text-neutral-50 hover:bg-blue-600 focus-visible:bg-blue-700 focus-visible:ring-blue-700 dark:bg-blue-500 dark:text-neutral-950 dark:hover:bg-blue-600 focus-visible:dark:bg-blue-500 focus-visible:dark:ring-blue-500':
                        selectedNote?.id === note.id,
                    'pb-3': noteIndex <= 9
                }
            )}
            onClick={() => setSelectedNote(note)}
        >
            <span>{note.title}</span>
            {noteIndex <= 9 && (
                <span className="flex items-end justify-between gap-1 text-sm">
                    <span className="flex flex-wrap items-center gap-1 text-xs">
                        Updated
                        <time dateTime={new Date(note.lastUpdatedAt).toString()}>
                            {formatDistance(Date.now(), note.lastUpdatedAt)}
                        </time>
                        ago
                    </span>
                    <kbd
                        className={cn(
                            'shrink-0 rounded border border-neutral-300 bg-neutral-200 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800',
                            {
                                'border-blue-400 bg-blue-600 dark:border-blue-700 dark:bg-blue-300':
                                    selectedNote?.id === note.id
                            }
                        )}
                    >
                        {isMac() ? 'Cmd' : 'Ctrl'} + {noteIndex}
                    </kbd>
                </span>
            )}
        </Button>
    );
}

export default App;
