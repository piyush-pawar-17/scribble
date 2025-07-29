import type { JSONContent } from '@tiptap/react';
import { format } from 'date-fns';
import Dexie, { type EntityTable } from 'dexie';

export interface NoteContent {
    content: string;
    isChecked: boolean;
}

export interface Note {
    id?: number;
    title: string;
    content: JSONContent;
    lastUpdatedAt: number;
    createdAt: number;
}

export const db = new Dexie('notes') as Dexie & {
    notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
    notes: '++id'
});

export async function createNote(title?: string) {
    const noteTitle = title?.trim() || `Notes for ${format(Date.now(), 'dd-MM-yyyy')}`;
    const initialNote: Note = {
        title: noteTitle,
        content: {},
        lastUpdatedAt: Date.now(),
        createdAt: Date.now()
    };

    const newNoteId = await db.notes.add(initialNote);

    return {
        code: 201,
        data: {
            id: newNoteId,
            ...initialNote
        }
    } as const;
}

export async function updateNote(noteId: number, content: JSONContent) {
    const recordsUpdated = await db.notes.update(noteId, { content });

    if (recordsUpdated === 0) {
        return {
            code: 404,
            message: 'No note found with the given id'
        } as const;
    } else {
        return {
            code: 200
        } as const;
    }
}

export async function getNotes() {
    return await db.notes.orderBy('id').reverse().toArray();
}
