import { create } from 'zustand';
import { taskRepository, TaskInput } from '../repositories/TaskRepository';
import { SortMode, Task, TaskCategory } from '../types/models';
import { matchesSearch, sortByMode } from '../utils/filter';

type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  search: string;
  category: TaskCategory | 'all';
  sort: SortMode;
  load: () => Promise<void>;
  setSearch: (search: string) => void;
  setCategory: (category: TaskCategory | 'all') => void;
  setSort: (sort: SortMode) => void;
  createTask: (input: TaskInput) => Promise<void>;
  updateTask: (id: string, input: TaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  setManyCompleted: (ids: string[], completed: boolean) => Promise<void>;
  clearCompleted: (category: TaskCategory | 'all') => Promise<void>;
  filteredTasks: () => Task[];
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  search: '',
  category: 'all',
  sort: 'newest',
  load: async () => {
    set({ loading: true, error: null });
    try {
      await taskRepository.resetExpiredCompletions();
      set({ tasks: await taskRepository.list(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load tasks', loading: false });
    }
  },
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  createTask: async (input) => {
    await taskRepository.create(input);
    await get().load();
  },
  updateTask: async (id, input) => {
    await taskRepository.update(id, input);
    await get().load();
  },
  deleteTask: async (id) => {
    await taskRepository.delete(id);
    await get().load();
  },
  setCompleted: async (id, completed) => {
    await taskRepository.setCompleted(id, completed);
    await get().load();
  },
  setManyCompleted: async (ids, completed) => {
    await Promise.all(ids.map((id) => taskRepository.setCompleted(id, completed)));
    await get().load();
  },
  clearCompleted: async (category) => {
    const completedTasks = get().tasks.filter((task) => task.isCompleted && (category === 'all' || task.category === category));
    await Promise.all(completedTasks.map((task) => taskRepository.setCompleted(task.id, false)));
    await get().load();
  },
  filteredTasks: () => {
    const { tasks, search, category, sort } = get();
    return sortByMode(
      tasks.filter((task) => (category === 'all' || task.category === category) && matchesSearch([task.title, task.description], search)),
      sort,
    );
  },
}));
