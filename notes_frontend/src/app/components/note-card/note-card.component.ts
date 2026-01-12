import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './note-card.component.html',
  styleUrl: './note-card.component.css',
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  onEdit(): void {
    /** Emit edit request with note id. */
    this.edit.emit(this.note.id);
  }

  // PUBLIC_INTERFACE
  onDelete(): void {
    /** Emit delete request with note id. */
    this.delete.emit(this.note.id);
  }

  get preview(): string {
    const raw = (this.note.content ?? '').trim();
    if (!raw) return 'No content yet.';
    const normalized = raw.replace(/\s+/g, ' ');
    return normalized.length > 140 ? `${normalized.slice(0, 140)}…` : normalized;
  }

  get updatedLabel(): string {
    return new Date(this.note.updatedAt).toLocaleString();
  }

  get createdLabel(): string {
    return new Date(this.note.createdAt).toLocaleString();
  }
}
