import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css',
})
export class NoteEditorComponent implements OnInit {
  mode: 'create' | 'edit' = 'create';
  noteId: string | null = null;
  loadedNote: Note | null = null;

  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notesService: NotesService
  ) {
    // Ensure FormBuilder is initialized before building the form (strict property init).
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      content: [''],
      tags: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.noteId = id;
      const note = this.notesService.getById(id);
      if (!note) {
        // If the note doesn't exist anymore, return to dashboard.
        this.router.navigateByUrl('/');
        return;
      }
      this.loadedNote = note;
      this.form.patchValue({
        title: note.title,
        content: note.content,
        tags: note.tags.join(', '),
      });
    } else {
      this.mode = 'create';
    }
  }

  // PUBLIC_INTERFACE
  onCancel(): void {
    /** Navigate back to dashboard without saving. */
    this.router.navigateByUrl('/');
  }

  // PUBLIC_INTERFACE
  onSave(): void {
    /** Create or update note if form is valid. */
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const title = (this.form.value.title ?? '').trim();
    const content = this.form.value.content ?? '';
    const tags = this.parseTags(this.form.value.tags ?? '');

    if (this.mode === 'create') {
      this.notesService.create({ title, content, tags });
      this.router.navigateByUrl('/');
      return;
    }

    if (this.mode === 'edit' && this.noteId) {
      this.notesService.update(this.noteId, { title, content, tags });
      this.router.navigateByUrl('/');
    }
  }

  get titleCtrl() {
    return this.form.controls.title;
  }

  private parseTags(raw: string): string[] {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
}
