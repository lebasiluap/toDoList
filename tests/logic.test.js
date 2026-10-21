import test from "node:test";
import assert from "node:assert/strict";
import { validateTasks, selectTasks, localDate } from "../src/logic.js";
const task = {
  id: "1",
  title: "Write proposal",
  priority: "High",
  category: "Work",
  due: "2026-10-21",
  completed: false,
};
test("validates imported backups before replacing state", () => {
  assert.deepEqual(validateTasks([task]), [task]);
  for (const data of [
    [task, task],
    [{ ...task, completed: "false" }],
    [{ ...task, due: "2026-02-30" }],
    [{ ...task, title: " " }],
    {},
  ])
    assert.throws(() => validateTasks(data));
});
test("search, project and overdue filters combine", () => {
  const tasks = [
    task,
    {
      ...task,
      id: "2",
      title: "Read",
      priority: "Low",
      category: "Learning",
      due: "",
      completed: true,
    },
  ];
  assert.equal(
    selectTasks(tasks, { view: "today", today: "2026-10-22" }).length,
    1,
  );
  assert.equal(
    selectTasks(tasks, { query: "write", category: "Learning" }).length,
    0,
  );
  assert.equal(selectTasks(tasks, { view: "completed" })[0].id, "2");
  assert.equal(localDate(new Date(2026, 0, 2)), "2026-01-02");
});
