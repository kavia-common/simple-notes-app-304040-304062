import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotesService } from '../../services/notes.service';
import { NotesListComponent } from '../../components/notes-list/notes-list.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-dashboard',
  standalone: true,
  imports: [NotesListComponent, ConfirmDialogComponent],
  templateUrl: './notes-dashboard.component.html',
  styleUrl: './notes-dashboard.component.css',
})
export class NotesDashboardComponent implements OnInit, OnDestroy {
  notes: Note[] = [];

  confirmOpen = false;
  private pendingDeleteId: string | null = null;

  private sub?: Subscription;

  constructor(
    private readonly notesService: NotesService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.notesService.notes$.subscribe((notes) => (this.notes = notes));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // PUBLIC_INTERFACE
  goCreate(): void {
    /** Navigate to create note screen. */
    this.router.navigateByUrl('/new');
  }

  // PUBLIC_INTERFACE
  onEdit(id: string): void {
    /** Navigate to edit screen for note. */
    this.router.navigate(['/edit', id]);
  }

  // PUBLIC_INTERFACE
  onDeleteRequested(id: string): void {
    /** Open confirmation dialog for note deletion. */
    this.pendingDeleteId = id;
    this.confirmOpen = true;
  }

  // PUBLIC_INTERFACE
  onDeleteConfirmed(): void {
    /** Delete pending note after confirmation. */
    if (this.pendingDeleteId) {
      this.notesService.delete(this.pendingDeleteId);
    }
    this.pendingDeleteId = null;
    this.confirmOpen = false;
  }

  // PUBLIC_INTERFACE
  onDeleteCancelled(): void {
    /** Close confirmation dialog without deleting. */
    this.pendingDeleteId = null;
    this.confirmOpen = false;
  }
}
