export const priorities = ["Low", "Medium", "High"];
export const categories = ["Work", "Personal", "Learning"];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validateTasks(data) {
  if (!Array.isArray(data) || data.length > 2000)
    throw new Error(
      "Choose a Daybook JSON export with no more than 2,000 tasks.",
    );
  const ids = new Set();
  return data.map((t) => {
    if (
      !t ||
      typeof t.id !== "string" ||
      t.id.length > 100 ||
      ids.has(t.id) ||
      typeof t.title !== "string" ||
      !t.title.trim() ||
      t.title.length > 200 ||
      typeof t.completed !== "boolean" ||
      !priorities.includes(t.priority) ||
      !categories.includes(t.category) ||
      typeof t.due !== "string" ||
      (t.due !== "" &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(t.due) ||
          !Number.isFinite(Date.parse(t.due)) ||
          new Date(t.due).toISOString().slice(0, 10) !== t.due))
    )
      throw new Error(
        "This file contains invalid tasks. Your current tasks have not changed.",
      );
    ids.add(t.id);
    return {
      id: t.id,
      title: t.title.trim(),
      completed: t.completed,
      priority: t.priority,
      category: t.category,
      due: t.due,
    };
  });
}
export function selectTasks(
  tasks,
  {
    query = "",
    view = "all",
    category = "All projects",
    sort = "priority",
    today = localDate(),
  } = {},
) {
  let result = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) &&
      (category === "All projects" || t.category === category) &&
      (view === "all" ||
        (view === "active" && !t.completed) ||
        (view === "completed" && t.completed) ||
        (view === "today" && !t.completed && t.due && t.due <= today)),
  );
  return result.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (sort === "date")
      return (a.due || "9999").localeCompare(b.due || "9999");
    if (sort === "title") return a.title.localeCompare(b.title);
    return priorities.indexOf(b.priority) - priorities.indexOf(a.priority);
  });
}
