import { ChangeEvent, FormEvent, useState } from "react";
import { TbCalendar, TbCheck, TbFlag, TbPencil, TbTrash, TbX } from "react-icons/tb";
import { BsFillCheckCircleFill } from "react-icons/bs";

import styles from "./task.module.css";
import { ITask, TaskPayload, TaskPriority } from "../../App";

interface Props {
  task: ITask;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, task: TaskPayload) => boolean;
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

function getInputDate(dueDate: string) {
  if (!dueDate) {
    return null;
  }

  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDueDate(dueDate: string) {
  const date = getInputDate(dueDate);

  if (!date) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getDueStatus(task: ITask) {
  const dueDate = getInputDate(task.dueDate);

  if (!dueDate) {
    return "neutral";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!task.isCompleted && dueDate.getTime() < today.getTime()) {
    return "overdue";
  }

  if (!task.isCompleted && dueDate.getTime() === today.getTime()) {
    return "today";
  }

  return "scheduled";
}

export function Task({ task, onComplete, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const dueStatus = getDueStatus(task);

  function startEditing() {
    setTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setIsEditing(true);
  }

  function cancelEditing() {
    setTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const wasUpdated = onUpdate(task.id, { title, priority, dueDate });

    if (wasUpdated) {
      setIsEditing(false);
    }
  }

  function onChangePriority(event: ChangeEvent<HTMLSelectElement>) {
    setPriority(event.target.value as TaskPriority);
  }

  if (isEditing) {
    return (
      <form className={`${styles.task} ${styles.editing}`} onSubmit={handleSubmit}>
        <div className={styles.editFields}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            aria-label="Editar título da tarefa"
          />

          <div className={styles.editControls}>
            <label>
              <TbCalendar size={18} />
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                aria-label="Editar prazo"
              />
            </label>

            <label>
              <TbFlag size={18} />
              <select
                value={priority}
                onChange={onChangePriority}
                aria-label="Editar prioridade"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveButton} type="submit" aria-label="Salvar tarefa">
            <TbCheck size={20} />
          </button>

          <button
            className={styles.cancelButton}
            type="button"
            onClick={cancelEditing}
            aria-label="Cancelar edição"
          >
            <TbX size={20} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <article
      className={`${styles.task} ${task.isCompleted ? styles.completed : ""} ${
        dueStatus === "overdue" ? styles.overdue : ""
      }`}
    >
      <button
        className={styles.checkContainer}
        onClick={() => onComplete(task.id)}
        aria-label={task.isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
      >
        {task.isCompleted ? <BsFillCheckCircleFill /> : <div />}
      </button>

      <div className={styles.content}>
        <p className={task.isCompleted ? styles.textCompleted : ""}>{task.title}</p>

        <div className={styles.metadata}>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            <TbFlag size={14} />
            {priorityLabels[task.priority]}
          </span>

          <span className={`${styles.dueDate} ${styles[dueStatus]}`}>
            <TbCalendar size={14} />
            {formatDueDate(task.dueDate)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.editButton} onClick={startEditing} aria-label="Editar tarefa">
          <TbPencil size={20} />
        </button>

        <button className={styles.deleteButton} onClick={() => onDelete(task.id)} aria-label="Excluir tarefa">
          <TbTrash size={20} />
        </button>
      </div>
    </article>
  );
}
