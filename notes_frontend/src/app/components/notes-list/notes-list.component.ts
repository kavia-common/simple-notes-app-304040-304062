import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Note } from '../../models/note.model';
import { NoteCardComponent } from '../note-card/note-card.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [NgIf, NgFor, NoteCardComponent],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css',
})
export class NotesListComponent {
  @Input() notes: Note[] = [];

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  onEdit(id: string): void {
    /** Proxy edit event from child cards. */
    this.edit.emit(id);
  }

  // PUBLIC_INTERFACE
  onDelete(id: string): void {
    /** Proxy delete event from child cards. */
    this.delete.emit(id);
  }
}
