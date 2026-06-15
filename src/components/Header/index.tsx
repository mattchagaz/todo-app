import todoLogo from "../../assets/todoLogo.svg";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { TbCalendar, TbFlag } from "react-icons/tb";
import styles from "./header.module.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { TaskPayload, TaskPriority } from "../../App";

interface Props {
  onAddTask: (task: TaskPayload) => boolean;
}

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
}

export function Header({ onAddTask }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  const today = getTodayInputValue();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const taskCreated = onAddTask({ title, priority, dueDate });

    if (taskCreated) {
      setTitle("");
      setPriority("medium");
      setDueDate("");
    }
  }

  function onChangeTitle(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function onChangePriority(event: ChangeEvent<HTMLSelectElement>) {
    setPriority(event.target.value as TaskPriority);
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img src={todoLogo} alt="Todo Logo" />
        <p>Organize o dia com foco.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.newTaskForm}>
        <div className={styles.titleField}>
          <input
            placeholder="Adicione uma nova tarefa"
            type="text"
            value={title}
            onChange={onChangeTitle}
            maxLength={120}
            aria-label="Título da tarefa"
          />
        </div>

        <label className={styles.metaField}>
          <TbCalendar size={18} />
          <span>Prazo</span>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>

        <label className={styles.metaField}>
          <TbFlag size={18} />
          <span>Prioridade</span>
          <select value={priority} onChange={onChangePriority}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <button type="submit" aria-label="Criar tarefa">
          Criar <AiOutlinePlusCircle size={20} />
        </button>
      </form>
    </header>
  );
}
