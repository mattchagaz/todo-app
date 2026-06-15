import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";
import { Tasks } from "./components/Tasks";

const LOCAL_STORAGE_KEY = "todo:savedTasks";

export type TaskPriority = "low" | "medium" | "high";

export interface ITask {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  priority: TaskPriority;
  dueDate: string;
}

function App() {
  const [tasks, setTasks] = useState<ITask[]>([]);

  function isTaskPriority(priority: unknown): priority is TaskPriority {
    return priority === "low" || priority === "medium" || priority === "high";
  }

  function normalizeSavedTask(task: unknown): ITask | null {
    if (!task || typeof task !== "object") {
      return null;
    }

    const taskData = task as Partial<ITask>;
    const title = typeof taskData.title === "string" ? taskData.title.trim() : "";

    if (!title) {
      return null;
    }

    const now = new Date().toISOString();

    return {
      id:
        typeof taskData.id === "string" && taskData.id
          ? taskData.id
          : crypto.randomUUID(),
      title,
      isCompleted: Boolean(taskData.isCompleted),
      priority: isTaskPriority(taskData.priority) ? taskData.priority : "medium",
      dueDate: typeof taskData.dueDate === "string" ? taskData.dueDate : "",
      createdAt:
        typeof taskData.createdAt === "string" && taskData.createdAt
          ? taskData.createdAt
          : now,
      updatedAt:
        typeof taskData.updatedAt === "string" && taskData.updatedAt
          ? taskData.updatedAt
          : now,
    };
  }

  function loadSavedTasks() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((task) => normalizeSavedTask(task))
        .filter((task): task is ITask => Boolean(task));
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
  }

  useEffect(() => {
    setTasks(loadSavedTasks());
  }, []);

  function setTasksAndSave(newTasks: ITask[]) {
    setTasks(newTasks);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTasks));
  }

  function hasTaskWithTitle(taskTitle: string, ignoredTaskId?: string) {
    return tasks.some(
      (task) =>
        task.id !== ignoredTaskId &&
        task.title.toLowerCase() === taskTitle.toLowerCase()
    );
  }

  function addTask({ title, priority, dueDate }: TaskPayload) {
    const taskTitle = title.trim();

    if (!taskTitle) {
      toast.error("Por favor, adicione uma tarefa");
      return false;
    }

    if (hasTaskWithTitle(taskTitle)) {
      toast.warning("Essa tarefa já existe");
      return false;
    }

    const now = new Date().toISOString();

    setTasksAndSave([
      {
        id: crypto.randomUUID(),
        title: taskTitle,
        isCompleted: false,
        priority,
        dueDate,
        createdAt: now,
        updatedAt: now,
      },
      ...tasks,
    ]);

    toast.success("Tarefa criada");
    return true;
  }

  function deleteTaskById(taskId: string) {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasksAndSave(newTasks);
    toast.success("Tarefa removida");
  }

  function toggleTaskCompletedById(taskId: string) {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          isCompleted: !task.isCompleted,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    setTasksAndSave(newTasks);
  }

  function updateTaskById(taskId: string, taskPayload: TaskPayload) {
    const title = taskPayload.title.trim();

    if (!title) {
      toast.error("A tarefa precisa ter um título");
      return false;
    }

    if (hasTaskWithTitle(title, taskId)) {
      toast.warning("Já existe uma tarefa com esse título");
      return false;
    }

    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          ...taskPayload,
          title,
          updatedAt: new Date().toISOString(),
        };
      }

      return task;
    });

    setTasksAndSave(newTasks);
    toast.success("Tarefa atualizada");
    return true;
  }

  function clearCompletedTasks() {
    const completedTasks = tasks.filter((task) => task.isCompleted);

    if (completedTasks.length === 0) {
      toast.info("Nenhuma tarefa concluída para limpar");
      return;
    }

    const newTasks = tasks.filter((task) => !task.isCompleted);
    setTasksAndSave(newTasks);
    toast.success("Tarefas concluídas removidas");
  }

  return (
    <>
      <Header onAddTask={addTask} />
      <Tasks
        tasks={tasks}
        onDelete={deleteTaskById}
        onComplete={toggleTaskCompletedById}
        onUpdate={updateTaskById}
        onClearCompleted={clearCompletedTasks}
      />
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
