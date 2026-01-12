import { TestBed } from '@angular/core/testing';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
    TestBed.configureTestingModule({});
  });

  it('creates notes and persists to localStorage', () => {
    const service = TestBed.inject(NotesService);

    const created = service.create({ title: 'Hello', content: 'World', tags: ['a', 'b'] });
    expect(created.id).toBeTruthy();

    const raw = globalThis.localStorage?.getItem('ocean_notes_v1') ?? '';
    expect(raw).toContain('Hello');
  });

  it('updates notes', () => {
    const service = TestBed.inject(NotesService);
    const created = service.create({ title: 'One', content: '', tags: [] });

    const updated = service.update(created.id, { title: 'Two' });
    expect(updated.title).toBe('Two');
    expect(service.getById(created.id)?.title).toBe('Two');
  });

  it('deletes notes', () => {
    const service = TestBed.inject(NotesService);
    const created = service.create({ title: 'To delete', content: '', tags: [] });

    service.delete(created.id);
    expect(service.getById(created.id)).toBeUndefined();
  });
});
