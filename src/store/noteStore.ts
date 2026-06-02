import { create } from 'zustand';
import { NoteInput, noteRepository } from '../repositories/NoteRepository';
import { Note, SortMode } from '../types/models';
import { matchesSearch, sortByMode } from '../utils/filter';

type NoteState = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  search: string;
  sort: SortMode;
  load: () => Promise<void>;
  setSearch: (search: string) => void;
  setSort: (sort: SortMode) => void;
  createNote: (input: NoteInput) => Promise<void>;
  updateNote: (id: string, input: NoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  filteredNotes: () => Note[];
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  search: '',
  sort: 'newest',
  load: async () => {
    set({ loading: true, error: null });
    try {
      set({ notes: await noteRepository.list(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load notes', loading: false });
    }
  },
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  createNote: async (input) => {
    await noteRepository.create(input);
    await get().load();
  },
  updateNote: async (id, input) => {
    await noteRepository.update(id, input);
    await get().load();
  },
  deleteNote: async (id) => {
    await noteRepository.delete(id);
    await get().load();
  },
  filteredNotes: () => {
    const { notes, search, sort } = get();
    return sortByMode(notes.filter((note) => matchesSearch([note.title, note.content, ...note.checklist.map((item) => item.text)], search)), sort);
  },
}));
