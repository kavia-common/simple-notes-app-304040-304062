import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Note } from '../models/note.model';

const STORAGE_KEY = 'ocean_notes_v1';

/**
 * NotesService provides local, persistent CRUD for notes via localStorage.
 * Notes are stored as a simple array and exposed via an RxJS BehaviorSubject.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly _notes$ = new BehaviorSubject<Note[]>(this.loadFromStorage());

  /** Observable stream of notes, sorted by updatedAt descending. */
  readonly notes$ = this._notes$.asObservable();

  // PUBLIC_INTERFACE
  getSnapshot(): Note[] {
    /** Return current notes array (sorted by updatedAt desc). */
    return this._notes$.getValue();
  }

  // PUBLIC_INTERFACE
  getById(id: string): Note | undefined {
    /** Find a note by id. */
    return this.getSnapshot().find((n) => n.id === id);
  }

  // PUBLIC_INTERFACE
  create(input: { title: string; content: string; tags: string[] }): Note {
    /** Create a new note and persist changes. */
    const now = new Date().toISOString();
    const note: Note = {
      id: this.generateId(),
      title: input.title.trim(),
      content: input.content ?? '',
      tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    };

    const next = [note, ...this.getSnapshot()];
    this.setAndPersist(next);
    return note;
  }

  // PUBLIC_INTERFACE
  update(
    id: string,
    patch: Partial<Pick<Note, 'title' | 'content' | 'tags'>>
  ): Note {
    /** Update an existing note and persist changes. Throws if not found. */
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Note not found');
    }

    const updated: Note = {
      ...existing,
      title: (patch.title ?? existing.title).trim(),
      content: patch.content ?? existing.content,
      tags: (patch.tags ?? existing.tags).map((t) => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    const next = this.getSnapshot().map((n) => (n.id === id ? updated : n));
    this.setAndPersist(next);
    return updated;
  }

  // PUBLIC_INTERFACE
  delete(id: string): void {
    /** Delete a note by id and persist changes. */
    const next = this.getSnapshot().filter((n) => n.id !== id);
    this.setAndPersist(next);
  }

  private setAndPersist(notes: Note[]) {
    const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    this._notes$.next(sorted);
    this.saveToStorage(sorted);
  }

  private loadFromStorage(): Note[] {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) return [];
      const sanitized: Note[] = parsed
        .map((n) => this.sanitizeNote(n))
        .filter((n): n is Note => !!n);

      return sanitized.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  private saveToStorage(notes: Note[]) {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage quota errors; app still works in-memory.
    }
  }

  private sanitizeNote(input: any): Note | null {
    if (!input || typeof input !== 'object') return null;
    if (typeof input.id !== 'string') return null;
    if (typeof input.title !== 'string') return null;

    const createdAt =
      typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString();
    const updatedAt =
      typeof input.updatedAt === 'string' ? input.updatedAt : createdAt;

    return {
      id: input.id,
      title: input.title,
      content: typeof input.content === 'string' ? input.content : '',
      tags: Array.isArray(input.tags)
        ? input.tags.filter((t: unknown) => typeof t === 'string')
        : [],
      createdAt,
      updatedAt,
    };
  }

  private generateId(): string {
    // Prefer crypto.randomUUID when available.
    const anyCrypto = globalThis as any;
    if (anyCrypto?.crypto?.randomUUID) {
      return anyCrypto.crypto.randomUUID();
    }
    // Fallback: time + random
    return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
