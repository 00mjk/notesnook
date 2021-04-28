import {
  StorageInterface,
  notebookTest,
  TEST_NOTEBOOK,
  TEST_NOTE,
} from "./utils";
import { makeTopic } from "../collections/topics";

beforeEach(async () => {
  StorageInterface.clear();
});

test("add a notebook", () =>
  notebookTest().then(({ db, id }) => {
    expect(id).toBeDefined();
    let notebook = db.notebooks.notebook(id);
    expect(notebook).toBeDefined();
    expect(notebook.title).toBe(TEST_NOTEBOOK.title);
  }));

test("get all notebooks", () =>
  notebookTest().then(({ db }) => {
    expect(db.notebooks.all.length).toBeGreaterThan(0);
  }));

test("pin a notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);
    await notebook.pin();
    notebook = db.notebooks.notebook(id);
    expect(notebook.data.pinned).toBe(true);
  }));

test("unpin a notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);
    await notebook.pin();
    notebook = db.notebooks.notebook(id);
    expect(notebook.data.pinned).toBe(true);
    await notebook.pin();
    notebook = db.notebooks.notebook(id);
    expect(notebook.data.pinned).toBe(false);
  }));

test("updating notebook with empty title should throw", () =>
  notebookTest().then(async ({ db, id }) => {
    await expect(db.notebooks.add({ id, title: "" })).rejects.toThrow();
  }));

test("merge notebook with new topics", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);

    const newNotebook = { ...notebook.data, remote: true };
    newNotebook.topics.push(makeTopic("Home", id));

    await expect(db.notebooks.merge(newNotebook)).resolves.not.toThrow();

    expect(notebook.topics.has("Home")).toBe(true);
    expect(notebook.topics.has("hello")).toBe(true);
  }));

test("merge notebook with topics removed", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);

    const newNotebook = { ...notebook.data, remote: true };
    newNotebook.topics.splice(0, 1); // remove hello topic
    newNotebook.topics.push(makeTopic("Home", id));

    await expect(db.notebooks.merge(newNotebook)).resolves.not.toThrow();

    expect(notebook.topics.has("Home")).toBe(true);
    expect(notebook.topics.has("hello")).toBe(false);
  }));

test("merge notebook with topic edited", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);

    const newNotebook = { ...notebook.data, remote: true };
    newNotebook.topics[0].title = "hello (edited)";

    await expect(db.notebooks.merge(newNotebook)).resolves.not.toThrow();

    expect(notebook.topics.has("hello (edited)")).toBe(true);
    expect(notebook.topics.has("hello")).toBe(false);
  }));

test("merge notebook when local notebook is also edited", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);

    const newNotebook = { ...notebook.data, remote: true };
    newNotebook.topics[0].title = "hello (edited)";

    await delay(500);

    await notebook.topics.add({
      ...notebook.topics.all[0],
      title: "hello (edited too)",
    });

    await expect(db.notebooks.merge(newNotebook)).resolves.not.toThrow();

    expect(notebook.topics.has("hello (edited too)")).toBe(true);
    expect(notebook.topics.has("hello (edited)")).toBe(false);
    expect(notebook.topics.has("hello")).toBe(false);
  }));

test("merge notebook with topic removed that is edited in the local notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let notebook = db.notebooks.notebook(id);

    const newNotebook = { ...notebook.data, remote: true };
    newNotebook.topics.splice(0, 1); // remove hello topic

    await StorageInterface.write("lastSynced", Date.now());

    await delay(500);

    await notebook.topics.add({
      ...notebook.topics.all[1],
      title: "hello (i exist)",
    });

    await expect(db.notebooks.merge(newNotebook)).resolves.not.toThrow();

    expect(notebook.topics.has("hello (i exist)")).toBe(true);
    expect(notebook.topics.has("hello")).toBe(false);
  }));

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
