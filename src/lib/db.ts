import type { JSONContent } from '@tiptap/react';
import Dexie, { type EntityTable } from 'dexie';

import { DEFAULT_NOTE_TITLE, to } from '@/lib';

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
    notes: '++id, lastUpdatedAt'
});

export async function createNote(title?: string) {
    const noteTitle = title?.trim() || DEFAULT_NOTE_TITLE;
    const initialNote: Note = {
        title: noteTitle,
        content: {},
        lastUpdatedAt: Date.now(),
        createdAt: Date.now()
    };

    const [error, newNoteId] = await to(db.notes.add(initialNote));

    if (error) {
        return {
            code: 500,
            error
        } as const;
    }

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
    const [error, notes] = await to(db.notes.orderBy('lastUpdatedAt').reverse().toArray());

    if (error) {
        return {
            code: 500,
            error,
            errorMessage: 'Error occured while fetching notes'
        } as const;
    }

    return {
        code: 200,
        notes
    } as const;
}
