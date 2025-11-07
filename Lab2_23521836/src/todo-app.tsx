// src/todo-app.tsx
/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import "./todo-app.css";

/* ------------ Types ------------ */
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface TodoListProps {
  items: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface AddTodoFormProps {
  onAdd: (text: string) => void;
}

/* ------------ Components ------------ */
const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <li className="todo-item">
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className={todo.completed ? "todo-text done" : "todo-text"}>
          {todo.text}
        </span>
      </label>
      <button className="todo-delete" onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  );
};

const TodoList = ({ items, onToggle, onDelete }: TodoListProps) => {
  if (items.length === 0) {
    return <p className="muted">No todos yet. Add one!</p>;
  }
  return (
    <ul className="todo-list">
      {items.map((t) => (
        <TodoItem todo={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
};

const AddTodoForm = ({ onAdd }: AddTodoFormProps) => {
  const [getValue, setValue] = useState("");

  const submit = (e: Event) => {
    e.preventDefault(); // required by the lab
    const text = getValue.trim();
    if (!text) return;
    onAdd(text);
    setValue("");
  };

  return (
    <form className="todo-form" onSubmit={submit as any}>
      <input
        className="todo-input"
        type="text"
        placeholder="Add a todo…"
        value={getValue}
        onInput={(e: any) => setValue(e.target.value)}
      />
      <button className="btn add" type="submit">
        Add
      </button>
    </form>
  );
};

/* ------------ Main App ------------ */
type Filter = "all" | "active" | "completed";

const TodoApp = () => {
  const [getTodos, setTodos] = useState<Todo[]>([]);
  const [getFilter, setFilter] = useState<Filter>("all");

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(), // simple unique id (per lab hint)
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos([...getTodos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      getTodos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(getTodos.filter((t) => t.id !== id));
  };

  const todos = getTodos;
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;

  const visible = todos.filter((t) => {
    const f = getFilter;
    if (f === "active") return !t.completed;
    if (f === "completed") return t.completed;
    return true;
  });

  return (
    <div className="todo-app">
      <h1>✅ Todo List</h1>

      <AddTodoForm onAdd={addTodo} />

      <div className="filters">
        <button
          className={getFilter === "all" ? "btn tab active" : "btn tab"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={getFilter === "active" ? "btn tab active" : "btn tab"}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={getFilter === "completed" ? "btn tab active" : "btn tab"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      <TodoList items={visible} onToggle={toggleTodo} onDelete={deleteTodo} />

      <p className="summary">
        Total: <strong>{total}</strong> • Completed:{" "}
        <strong>{completed}</strong>
      </p>
    </div>
  );
};

export { TodoApp };
