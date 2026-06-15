import { ChangeEvent, useMemo, useState } from "react";
import {
  TbArchiveOff,
  TbArrowsSort,
  TbBookmarksOff,
  TbChecklist,
  TbClearAll,
  TbFilter,
  TbSearch,
} from "react-icons/tb";
import { ITask, TaskPayload, TaskPriority } from "../../App";
import { Task } from "../Task";
import styles from "./tasks.module.css";

interface Props {
  tasks: ITask[];
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, task: TaskPayload) => boolean;
  onClearCompleted: () => void;
}

type StatusFilter = "all" | "pending" | "completed";
type PriorityFilter = "all" | TaskPriority;
type SortOption = "newest" | "dueDate" | "priority";

const priorityWeight: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function getDueDateTime(dueDate: string) {
  if (!dueDate) {
    return Number.POSITIVE_INFINITY;
  }

  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return date.getTime();
}

function isTaskOverdue(task: ITask) {
  if (!task.dueDate || task.isCompleted) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return getDueDateTime(task.dueDate) < today.getTime();
}

export function Tasks({
  tasks,
  onComplete,
  onDelete,
  onUpdate,
  onClearCompleted,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const tasksQuantity = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const pendingTasks = tasksQuantity - completedTasks;
  const overdueTasks = tasks.filter(isTaskOverdue).length;
  const completionPercentage =
    tasksQuantity > 0 ? Math.round((completedTasks / tasksQuantity) * 100) : 0;
  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    sortOption !== "newest";

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "completed" && task.isCompleted) ||
          (statusFilter === "pending" && !task.isCompleted);
        const matchesPriority =
          priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((firstTask, secondTask) => {
        if (sortOption === "priority") {
          const priorityDifference =
            priorityWeight[secondTask.priority] - priorityWeight[firstTask.priority];

          if (priorityDifference !== 0) {
            return priorityDifference;
          }
        }

        if (sortOption === "dueDate") {
          const dueDateDifference =
            getDueDateTime(firstTask.dueDate) - getDueDateTime(secondTask.dueDate);

          if (dueDateDifference !== 0) {
            return dueDateDifference;
          }
        }

        return (
          new Date(secondTask.createdAt).getTime() -
          new Date(firstTask.createdAt).getTime()
        );
      });
  }, [priorityFilter, search, sortOption, statusFilter, tasks]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortOption("newest");
  }

  function onChangeStatus(event: ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value as StatusFilter);
  }

  function onChangePriority(event: ChangeEvent<HTMLSelectElement>) {
    setPriorityFilter(event.target.value as PriorityFilter);
  }

  function onChangeSort(event: ChangeEvent<HTMLSelectElement>) {
    setSortOption(event.target.value as SortOption);
  }

  return (
    <section className={styles.tasks}>
      <div className={styles.summary}>
        <div>
          <strong>{pendingTasks}</strong>
          <span>Pendentes</span>
        </div>

        <div>
          <strong>{completedTasks}</strong>
          <span>Concluídas</span>
        </div>

        <div>
          <strong>{overdueTasks}</strong>
          <span>Atrasadas</span>
        </div>
      </div>

      <header className={styles.header}>
        <div>
          <p>Tarefas criadas</p>
          <span>{tasksQuantity}</span>
        </div>

        <div>
          <p className={styles.textPurple}>Concluídas</p>
          <span>
            {completedTasks} de {tasksQuantity}
          </span>
        </div>
      </header>

      <div className={styles.progress}>
        <div>
          <strong>{completionPercentage}%</strong>
          <span>do plano finalizado</span>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <TbSearch size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tarefa"
            aria-label="Buscar tarefa"
          />
        </label>

        <label className={styles.selectBox}>
          <TbChecklist size={18} />
          <select value={statusFilter} onChange={onChangeStatus} aria-label="Filtrar status">
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídas</option>
          </select>
        </label>

        <label className={styles.selectBox}>
          <TbFilter size={18} />
          <select
            value={priorityFilter}
            onChange={onChangePriority}
            aria-label="Filtrar prioridade"
          >
            <option value="all">Toda prioridade</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </label>

        <label className={styles.selectBox}>
          <TbArrowsSort size={18} />
          <select value={sortOption} onChange={onChangeSort} aria-label="Ordenar tarefas">
            <option value="newest">Mais recentes</option>
            <option value="dueDate">Prazo próximo</option>
            <option value="priority">Prioridade</option>
          </select>
        </label>

        <button
          className={styles.clearCompletedButton}
          type="button"
          onClick={onClearCompleted}
          disabled={completedTasks === 0}
        >
          <TbClearAll size={18} />
          Limpar concluídas
        </button>
      </div>

      <div className={styles.listHeader}>
        <span>{filteredTasks.length} visíveis</span>

        {hasActiveFilters && (
          <button type="button" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      <div className={styles.list}>
        {filteredTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}

        {tasks.length <= 0 && (
          <section className={styles.empty}>
            <TbBookmarksOff size={50} />
            <div>
              <p>Você ainda não cadastrou nenhuma tarefa</p>
              <span>Crie tarefas e organize seus itens a fazer</span>
            </div>
          </section>
        )}

        {tasks.length > 0 && filteredTasks.length <= 0 && (
          <section className={styles.empty}>
            <TbArchiveOff size={50} />
            <div>
              <p>Nenhuma tarefa encontrada</p>
              <span>Ajuste os filtros para ver outros itens</span>
            </div>
            <button type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          </section>
        )}
      </div>
    </section>
  );
}
