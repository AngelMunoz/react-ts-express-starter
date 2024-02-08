import { useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type TodoResponse = {
  rows: Todo[];
  count: number;
};

type TodoUpdateResponse = {
  todo: Todo;
  count: number;
};

async function getTodos(page: number, limit: number): Promise<TodoResponse> {
  const res = await fetch(`/api/todos?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return await res.json();
}

async function addTodo(todo: Partial<Todo>): Promise<TodoUpdateResponse> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...todo, completed: false }),
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return await res.json();
}

async function updateTodoById(todo: Todo): Promise<TodoUpdateResponse> {
  const res = await fetch(`/api/todos/${todo.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return await res.json();
}

async function deleteTodoById(id: number): Promise<TodoUpdateResponse> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return await res.json();
}

export function Todo({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <li className="level" style={{ width: "100%" }}>
      <section className="level-left">
        <div className="level-item">
          <label className="checkbox">
            <input
              className="checkbox"
              type="checkbox"
              checked={todo.completed}
              onChange={(e) =>
                onUpdate({ ...todo, completed: !e.target.checked })
              }
            />
          </label>
        </div>
      </section>
      <section className="level-item">
        <p style={{ textDecoration: todo.completed ? "line-through" : "" }}>
          {todo.title}
        </p>
      </section>
      <section className="level-right">
        <div className="level-item">
          <button className="delete" onClick={() => onDelete(todo.id)}></button>
        </div>
      </section>
    </li>
  );
}

function setTodoResponse(
  response: { rows: Todo[]; count: number },
  setTodos: (arg0: Todo[]) => void,
  setMaxPage: (arg0: number) => void,
  setStatus: (arg0: "idle" | "loading" | ["error", string]) => void
) {
  setTodos(response.rows);
  if (response.count > 0) {
    setMaxPage(Math.ceil(response.count / 10));
  }
  setStatus("idle");
}

export function Todos() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [maxPage, setMaxPage] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "idle" | ["error", string]>(
    "loading"
  );

  // initial todos fetch when the component loads
  useEffect(() => {
    setStatus("loading");
    getTodos(page, 10).then((todos: { rows: Todo[]; count: number }) =>
      setTodoResponse(todos, setTodos, setMaxPage, setStatus)
    );
  }, []);

  // fetch todos when the page changes or when maxPage changes
  useEffect(() => {
    setStatus("loading");
    getTodos(page, 10).then((todos) =>
      setTodoResponse(todos, setTodos, setMaxPage, setStatus)
    );
  }, [page, maxPage]);

  const handleAddTodo = async () => {
    setStatus("loading");
    const addAction = addTodo({
      title: newTodo,
      completed: false,
    });
    setNewTodo("");
    addAction
      .then(({ todo, count }) => {
        setTodos((prevTodos) => {
          if (prevTodos.length >= 10) {
            return [todo, ...prevTodos.slice(0, 9)];
          } else {
            return [todo, ...prevTodos];
          }
        });
        setMaxPage(Math.ceil(count / 10));
        setStatus("idle");
      })
      .catch((err) => {
        const error = err as Error;
        setStatus(["error", error.message]);
      });
  };

  const handleUpdateTodo = (todo: Todo) => {
    setStatus("loading");
    updateTodoById({ ...todo, completed: !todo.completed })
      .then(({ todo: updatedTodo, count }) => {
        setTodos((prevTodos) =>
          prevTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
        );
        setMaxPage(Math.ceil(count / 10));
        setStatus("idle");
      })
      .catch((err) => {
        const error = err as Error;
        setStatus(["error", error.message]);
      });
  };

  const handleDeleteTodo = (id: number) => {
    setStatus("loading");
    deleteTodoById(id)
      .then(({ todo, count }) => {
        setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
        setMaxPage(Math.ceil(count / 10));
        setStatus("idle");
      })
      .catch((err) => {
        const error = err as Error;
        setStatus(["error", error.message]);
      });
  };

  return (
    <article className="panel">
      <header className="panel-heading">Todos</header>
      <section className="panel-block">
        <div className="control field has-addons">
          <p className="control is-expanded">
            <input
              className="input"
              type="text"
              placeholder="New Todo"
              defaultValue={newTodo}
              onChange={(el) => setNewTodo(el.target.value)}
            />
          </p>
          <p className="control">
            <button className="button is-primary" onClick={handleAddTodo}>
              Add
            </button>
          </p>
        </div>
      </section>
      <section className="panel-block">
        {status[0] === "error" && (
          <div className="notification is-danger mt-2">{status[1]}</div>
        )}
      </section>
      <ul className="panel-block is-flex is-flex-direction-column">
        {todos.map((todo) => (
          <Todo
            key={todo.id}
            todo={todo}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>
      <div className="panel-block">
        <nav
          className="pagination is-centered"
          role="navigation"
          aria-label="pagination"
        >
          <a
            className={`pagination-previous ${page === 1 ? "is-disabled" : ""}`}
            onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          >
            Previous
          </a>
          <a
            className={`pagination-next ${
              page === maxPage ? "is-disabled" : ""
            }`}
            onClick={() =>
              setPage((prevPage) => Math.min(prevPage + 1, maxPage))
            }
          >
            Next page
          </a>
        </nav>
      </div>
    </article>
  );
}
