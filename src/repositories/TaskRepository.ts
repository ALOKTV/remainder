import { getDb } from '../database/database';
import { Task, TaskCategory } from '../types/models';
import { nowIso, shouldResetTask } from '../utils/date';
import { createId } from '../utils/id';
import { boolToInt, mapTask, TaskRow } from './mappers';

export type TaskInput = {
  title: string;
  description: string;
  category: TaskCategory;
};

export class TaskRepository {
  async list(): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskRow>('SELECT * FROM tasks ORDER BY createdAt DESC');
    return rows.map(mapTask);
  }

  async resetExpiredCompletions(): Promise<void> {
    const tasks = await this.list();
    const expired = tasks.filter((task) => shouldResetTask(task));
    if (expired.length === 0) return;
    const db = await getDb();
    const updatedAt = nowIso();
    await db.withTransactionAsync(async () => {
      for (const task of expired) {
        await db.runAsync(
          'UPDATE tasks SET isCompleted = 0, lastCompletedAt = NULL, updatedAt = ? WHERE id = ?',
          updatedAt,
          task.id,
        );
      }
    });
  }

  async create(input: TaskInput): Promise<Task> {
    const db = await getDb();
    const now = nowIso();
    const task: Task = {
      id: createId(),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      isCompleted: false,
      lastCompletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO tasks (id, title, description, category, isCompleted, lastCompletedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      task.id,
      task.title,
      task.description,
      task.category,
      boolToInt(task.isCompleted),
      task.lastCompletedAt,
      task.createdAt,
      task.updatedAt,
    );
    return task;
  }

  async update(id: string, input: TaskInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE tasks SET title = ?, description = ?, category = ?, updatedAt = ? WHERE id = ?',
      input.title.trim(),
      input.description.trim(),
      input.category,
      nowIso(),
      id,
    );
  }

  async setCompleted(id: string, completed: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE tasks SET isCompleted = ?, lastCompletedAt = ?, updatedAt = ? WHERE id = ?',
      boolToInt(completed),
      completed ? nowIso() : null,
      nowIso(),
      id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
  }
}

export const taskRepository = new TaskRepository();
