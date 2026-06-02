import { getDb } from '../database/database';
import { Note, NoteChecklistItem, NoteColor } from '../types/models';
import { nowIso } from '../utils/date';
import { createId } from '../utils/id';
import { mapNote, NoteRow } from './mappers';

export type NoteInput = {
  title: string;
  content: string;
  color: NoteColor;
  checklist: NoteChecklistItem[];
};

export class NoteRepository {
  async list(): Promise<Note[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<NoteRow>('SELECT * FROM notes ORDER BY updatedAt DESC');
    return rows.map(mapNote);
  }

  async create(input: NoteInput): Promise<Note> {
    const db = await getDb();
    const now = nowIso();
    const note: Note = {
      id: createId(),
      title: input.title.trim(),
      content: input.content.trim(),
      color: input.color,
      checklist: cleanChecklist(input.checklist),
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO notes (id, title, content, color, checklist, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      note.id,
      note.title,
      note.content,
      note.color,
      JSON.stringify(note.checklist),
      note.createdAt,
      note.updatedAt,
    );
    return note;
  }

  async update(id: string, input: NoteInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE notes SET title = ?, content = ?, color = ?, checklist = ?, updatedAt = ? WHERE id = ?',
      input.title.trim(),
      input.content.trim(),
      input.color,
      JSON.stringify(cleanChecklist(input.checklist)),
      nowIso(),
      id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM notes WHERE id = ?', id);
  }
}

function cleanChecklist(items: NoteChecklistItem[]): NoteChecklistItem[] {
  return items
    .map((item) => ({ ...item, text: item.text.trim() }))
    .filter((item) => item.text.length > 0);
}

export const noteRepository = new NoteRepository();
