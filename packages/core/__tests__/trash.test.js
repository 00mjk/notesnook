import {
  StorageInterface,
  noteTest,
  notebookTest,
  TEST_NOTE,
  TEST_NOTEBOOK,
  databaseTest,
} from "./utils";

beforeEach(() => StorageInterface.clear());

test("trash should be empty", () =>
  databaseTest().then((db) => {
    expect(db.trash.all.length).toBe(0);
  }));

test("permanently delete a note", () =>
  noteTest().then(async ({ db, id }) => {
    const note = db.notes.note(id);
    await db.notes.delete(id);
    expect(db.trash.all.length).toBe(1);
    expect(await note.content()).toBeDefined();
    await db.trash.delete(db.trash.all[0].id);
    expect(db.trash.all.length).toBe(0);
    const content = await db.content.raw(note.data.contentId);
    expect(content.deleted).toBe(true);
  }));

test("restore a deleted note that was in a notebook", () =>
  noteTest().then(async ({ db, id }) => {
    let nbId = await db.notebooks.add(TEST_NOTEBOOK);
    await db.notebooks.notebook(nbId).topics.topic("General").add(id);
    await db.notes.delete(id);
    await db.trash.restore(db.trash.all[0].id);
    expect(db.trash.all.length).toBe(0);

    let note = db.notes.note(id);

    expect(note).toBeDefined();
    expect(await note.content()).toBe(TEST_NOTE.content.data);

    const notebook = db.notebooks.notebook(nbId);
    expect(notebook.topics.topic("General").has(id)).toBe(true);

    expect(note.notebooks.some((n) => n.id === nbId)).toBe(true);

    expect(notebook.topics.has("General")).toBeDefined();
  }));

test("delete a locked note", () =>
  noteTest().then(async ({ db, id }) => {
    const note = db.notes.note(id);
    await db.vault.create("password");
    await db.vault.add(id);
    await db.notes.delete(id);
    expect(db.trash.all.length).toBe(1);
    expect(await db.content.get(note.data.contentId)).toBeDefined();
  }));

test("restore a deleted locked note", () =>
  noteTest().then(async ({ db, id }) => {
    let note = db.notes.note(id);
    await db.vault.create("password");
    await db.vault.add(id);
    await db.notes.delete(id);
    expect(db.trash.all.length).toBe(1);
    expect(await db.content.get(note.data.contentId)).toBeDefined();
    await db.trash.restore(db.trash.all[0].id);
    expect(db.trash.all.length).toBe(0);
    note = db.notes.note(id);
    expect(note).toBeDefined();
  }));

test("restore a deleted note that's in a deleted notebook", () =>
  noteTest().then(async ({ db, id }) => {
    let nbId = await db.notebooks.add(TEST_NOTEBOOK);
    await db.notebooks.notebook(nbId).topics.topic("General").add(id);
    await db.notes.delete(id);
    await db.notebooks.delete(nbId);
    const deletedNote = db.trash.all.find(
      (v) => v.itemId.includes(id) && v.itemType === "note"
    );
    await db.trash.restore(deletedNote.id);
    let note = db.notes.note(id);
    expect(note).toBeDefined();
    expect(db.notes.note(id).notebook).toBeUndefined();
  }));

test("delete a notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let noteId = await db.notes.add(TEST_NOTE);
    await db.notebooks.notebook(id).topics.topic("General").add(noteId);
    await db.notebooks.delete(id);
    expect(db.notebooks.notebook(id).data.deleted).toBe(true);
    expect(db.notes.note(noteId).notebook).toBeUndefined();
  }));

test("restore a deleted notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let noteId = await db.notes.add(TEST_NOTE);
    await db.notebooks.notebook(id).topics.topic("General").add(noteId);
    await db.notebooks.delete(id);
    await db.trash.restore(db.trash.all[0].id);
    let notebook = db.notebooks.notebook(id);
    expect(notebook).toBeDefined();
    let note = db.notes.note(noteId);
    const index = note.notebooks.findIndex((n) => n.id === id);
    expect(note.notebooks[index]).toBeDefined();
    expect(
      notebook.topics.topic(note.notebooks[index].topics[0])
    ).toBeDefined();
  }));

test("restore a notebook that has deleted notes", () =>
  notebookTest().then(async ({ db, id }) => {
    let noteId = await db.notes.add(TEST_NOTE);
    await db.notebooks.notebook(id).topics.topic("General").add(noteId);
    await db.notebooks.delete(id);
    await db.notes.delete(noteId);
    const deletedNotebook = db.trash.all.find(
      (v) => v.itemId.includes(id) && v.itemType === "notebook"
    );
    await db.trash.restore(deletedNotebook.id);
    let notebook = db.notebooks.notebook(id);
    expect(notebook).toBeDefined();
    expect(notebook.topics.topic("General").has(noteId)).toBe(false);
  }));
