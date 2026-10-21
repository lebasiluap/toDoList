import { useEffect, useRef, useState } from "react";
import {
  categories,
  priorities,
  validateTasks,
  selectTasks,
  localDate,
} from "./logic.js";
import "./styles.css";
const KEY = "daybook-tasks-v1";
const blank = { title: "", priority: "Medium", category: "Work", due: "" };
const starter = [
  {
    id: "welcome",
    title: "Make room for your next big idea",
    priority: "High",
    category: "Work",
    due: "",
    completed: false,
  },
  {
    id: "first",
    title: "Add a task with a due date",
    priority: "Medium",
    category: "Personal",
    due: "",
    completed: false,
  },
  {
    id: "explore",
    title: "Try search, filters, and keyboard navigation",
    priority: "Low",
    category: "Learning",
    due: "",
    completed: true,
  },
];
function load() {
  try {
    const s = localStorage.getItem(KEY);
    return s
      ? { tasks: validateTasks(JSON.parse(s)), message: "" }
      : {
          tasks: starter,
          message: "Welcome. These starter tasks are yours to edit or remove.",
        };
  } catch {
    return {
      tasks: [],
      message:
        "Saved tasks could not be read. Import a backup or start a new list.",
    };
  }
}
export default function App() {
  const [initial] = useState(load),
    [tasks, setTasks] = useState(initial.tasks),
    [message, setMessage] = useState(initial.message),
    [storageError, setStorageError] = useState("");
  const [view, setView] = useState("all"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All projects"),
    [sort, setSort] = useState("priority"),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState(null),
    [undo, setUndo] = useState(null),
    [formError, setFormError] = useState("");
  const dialog = useRef(null),
    importDialog = useRef(null),
    file = useRef(null),
    titleInput = useRef(null);
  const [incoming, setIncoming] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Export a backup before closing this tab.",
      );
    }
  }, [tasks]);
  const today = localDate(),
    active = tasks.filter((t) => !t.completed).length,
    done = tasks.length - active,
    due = tasks.filter((t) => !t.completed && t.due && t.due <= today).length;
  const visible = selectTasks(tasks, { query, view, category, sort, today });
  function openEditor(task = null) {
    setEditing(task?.id || null);
    setForm(
      task
        ? {
            title: task.title,
            priority: task.priority,
            category: task.category,
            due: task.due,
          }
        : blank,
    );
    setFormError("");
    dialog.current.showModal();
    requestAnimationFrame(() => titleInput.current?.focus());
  }
  function submit(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setFormError("Give your task a title.");
      return;
    }
    if (!editing && tasks.length >= 2000) {
      setFormError(
        "This workspace supports up to 2,000 tasks. Export or remove completed tasks first.",
      );
      return;
    }
    const item = { ...form, title };
    setTasks((prev) =>
      editing
        ? prev.map((t) => (t.id === editing ? { ...t, ...item } : t))
        : [...prev, { ...item, id: crypto.randomUUID(), completed: false }],
    );
    setMessage(editing ? "Task updated." : "Task added.");
    dialog.current.close();
    setUndo(null);
  }
  function toggle(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    setUndo(null);
  }
  function remove(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setUndo(task);
    setMessage("Task removed. You can undo this action.");
  }
  function restore() {
    if (undo) {
      setTasks((prev) => [...prev, undo]);
      setUndo(null);
      setMessage("Task restored.");
    }
  }
  function download() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(tasks, null, 2)], {
          type: "application/json",
        }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `daybook-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Backup exported.");
  }
  async function readFile(e) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (selected.size > 2 * 1024 * 1024) {
      setMessage("Choose a JSON backup smaller than 2 MB.");
      return;
    }
    try {
      const data = validateTasks(JSON.parse(await selected.text()));
      setIncoming(data);
      importDialog.current.showModal();
    } catch (err) {
      setMessage(
        err instanceof SyntaxError
          ? "This is not valid JSON. Your tasks have not changed."
          : err.message,
      );
    }
  }
  const names = {
    all: "Your next chapter.",
    active: "Make things happen.",
    today: "One day at a time.",
    completed: "Look how far you’ve come.",
  };
  return (
    <div className="workspace">
      <aside className="sidebar">
        <a href="./" className="wordmark">
          daybook<span>✳</span>
        </a>
        <p className="sidebar-label">A little focus goes a long way.</p>
        <div className="side-rule" />
        <p className="tiny">YOUR WORKSPACE</p>
        <nav aria-label="Task views">
          {[
            ["all", "All tasks", tasks.length],
            ["today", "Due today", due],
            ["active", "In progress", active],
            ["completed", "Completed", done],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <span>{label}</span>
              <span>{count}</span>
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <span className="storage-dot" /> LOCAL WORKSPACE
          <p>
            Private by default.
            <br />
            Saved in this browser.
          </p>
          <div className="side-actions">
            <button onClick={download}>Export backup ↗</button>
            <button onClick={() => file.current.click()}>
              Import backup ↙
            </button>
          </div>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={readFile}
          />
        </div>
      </aside>
      <main>
        <header className="top">
          <span className="tiny">A WORKSPACE BY PAUL SACKEY</span>
          <span className="date">
            {new Intl.DateTimeFormat("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </span>
        </header>
        <section className="hero">
          <div>
            <p className="tiny">LESS NOISE. MORE PROGRESS.</p>
            <h1>{names[view]}</h1>
            <p className="sub">A clear place for everything you want to do.</p>
          </div>
          <button className="primary" onClick={() => openEditor()}>
            ＋ New task
          </button>
        </section>
        <section className="metrics" aria-label="Task summary">
          <div>
            <span>IN PROGRESS</span>
            <strong>{String(active).padStart(2, "0")}</strong>
            <small>Ideas becoming action</small>
          </div>
          <div>
            <span>DUE TODAY & OVERDUE</span>
            <strong>{String(due).padStart(2, "0")}</strong>
            <small>A little attention needed</small>
          </div>
          <div className="completion">
            <span>COMPLETED</span>
            <strong>
              {tasks.length ? Math.round((done / tasks.length) * 100) : 0}
              <em>%</em>
            </strong>
            <div className="progress">
              <i
                style={{
                  width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <small>
              {done} of {tasks.length} tasks finished
            </small>
          </div>
        </section>
        <section className="task-area">
          <div className="toolbar">
            <label className="search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search tasks"
                type="search"
                placeholder="Find your focus…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Project</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["All projects", ...categories].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort tasks</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="priority">Priority first</option>
                <option value="date">Due date</option>
                <option value="title">Alphabetical</option>
              </select>
            </label>
          </div>
          <div className="list-head">
            <h2>
              {view === "all"
                ? "All tasks"
                : view === "today"
                  ? "Due today & overdue"
                  : view === "active"
                    ? "In progress"
                    : "Completed"}{" "}
              <span>{visible.length}</span>
            </h2>
            <span className="tiny">SMALL STEPS, REAL MOMENTUM</span>
          </div>
          <ul className="tasks">
            {visible.map((task) => (
              <li key={task.id} className={task.completed ? "done" : ""}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggle(task.id)}
                  aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
                />
                <div className="task-main">
                  <button
                    className="task-title"
                    onClick={() => openEditor(task)}
                  >
                    {task.title}
                  </button>
                  <div className="task-meta">
                    <span>{task.category}</span>
                    {task.due && (
                      <span
                        className={
                          !task.completed && task.due < today ? "overdue" : ""
                        }
                      >
                        {task.due === today
                          ? "Today"
                          : new Intl.DateTimeFormat("en", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(task.due + "T12:00:00"))}
                      </span>
                    )}
                  </div>
                </div>
                <span className={"priority " + task.priority.toLowerCase()}>
                  <i />
                  {task.priority}
                </span>
                <button
                  className="icon"
                  onClick={() => openEditor(task)}
                  aria-label={"Edit " + task.title}
                >
                  ↗
                </button>
                <button
                  className="icon delete"
                  onClick={() => remove(task)}
                  aria-label={"Delete " + task.title}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {!visible.length && (
            <div className="empty">
              <span>✳</span>
              <h3>
                {tasks.length ? "A little breathing room." : "A fresh page."}
              </h3>
              <p>
                {tasks.length
                  ? "No tasks match this view. Try another filter."
                  : "Add your first task and make a little progress."}
              </p>
              <button
                onClick={() => {
                  setView("all");
                  setQuery("");
                  setCategory("All projects");
                  openEditor();
                }}
              >
                Add a task ↗
              </button>
            </div>
          )}
        </section>
        <div className="feedback" role="status">
          <span>{storageError || message}</span>
          {undo && <button onClick={restore}>Undo deletion</button>}
        </div>
        <footer>
          MAKE SPACE FOR WHAT MATTERS. <span>DAYBOOK / 2026</span>
        </footer>
      </main>
      <dialog ref={dialog} className="editor" aria-label="Task editor">
        <form onSubmit={submit}>
          <div className="dialog-head">
            <span className="tiny">A LITTLE INTENTION</span>
            <button
              type="button"
              className="icon"
              onClick={() => dialog.current.close()}
              aria-label="Close task editor"
            >
              ×
            </button>
          </div>
          <h2>{editing ? "Refine your task." : "What’s next?"}</h2>
          <label>
            Task title
            <input
              ref={titleInput}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              placeholder="Something worth doing…"
              required
            />
          </label>
          <div className="form-grid">
            <label>
              Project
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {priorities.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Due date <small>Optional</small>
            <input
              type="date"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
              min="1900-01-01"
              max="9999-12-31"
            />
          </label>
          <p className="error" role="alert">
            {formError}
          </p>
          <button className="primary" type="submit">
            {editing ? "Save changes" : "Create task"} ↗
          </button>
        </form>
      </dialog>
      <dialog
        ref={importDialog}
        className="editor"
        aria-label="Import backup confirmation"
      >
        <h2>Replace this workspace?</h2>
        <p>
          This backup contains {incoming?.length || 0} tasks. Importing replaces
          the current {tasks.length} tasks. Export your current list first if
          you want to keep it.
        </p>
        <div className="dialog-actions">
          <button onClick={() => importDialog.current.close()}>
            Keep current tasks
          </button>
          <button
            className="primary"
            onClick={() => {
              if (incoming) {
                setTasks(incoming);
                setUndo(null);
                setMessage("Backup imported.");
                setView("all");
                setQuery("");
                setCategory("All projects");
              }
              importDialog.current.close();
            }}
          >
            Replace with backup
          </button>
        </div>
      </dialog>
    </div>
  );
}
