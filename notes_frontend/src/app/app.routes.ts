import { Routes } from '@angular/router';
import { NotesDashboardComponent } from './pages/notes-dashboard/notes-dashboard.component';
import { NoteEditorComponent } from './pages/note-editor/note-editor.component';

export const routes: Routes = [
  { path: '', component: NotesDashboardComponent },
  { path: 'new', component: NoteEditorComponent },
  { path: 'edit/:id', component: NoteEditorComponent },
  { path: '**', redirectTo: '' },
];
