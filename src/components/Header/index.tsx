import todoLogo from "../../assets/todoLogo.svg";
import { AiOutlinePlusCircle, AiOutlineInsertRowRight } from "react-icons/ai";
import styles from "./header.module.css";
import { Toaster, toast } from 'sonner'
import { ChangeEvent, FormEvent, useState } from "react";

interface Props {
  onAddTask: (taskTitle: string) => void;
}

export function Header({ onAddTask }: Props) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (title.trim() === "") {
      toast.error("Por favor, adicione uma tarefa");
      return;
    }

    onAddTask(title);
    setTitle("");
    toast.error("");
  }

  function onChangeTitle(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  return (
    <header className={styles.header}>
      <img src={todoLogo} alt="Todo Logo" />

      <form onSubmit={handleSubmit} className={styles.newTaskForm}>
        <input
          className="newTaskInput"
          placeholder="Adicione uma nova tarefa"
          type="text"
          value={title}
          onChange={onChangeTitle}
        />
        <button type="submit">
          Criar <AiOutlinePlusCircle size={20} />
        </button>
      </form>
      {error && (
        <div className={styles.errorPopup}>
          <p>{error}</p>
        </div>
      )}
      <Toaster richColors position="top-center"  />
    </header>
  );
}
