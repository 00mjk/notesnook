import { notebookTest, noteTest, StorageInterface, TEST_NOTE } from "./utils";

beforeEach(() => StorageInterface.clear());

test("get empty topic", () =>
  notebookTest().then(({ db, id }) => {
    let topic = db.notebooks.notebook(id).topics.topic("General");
    expect(topic.all.length).toBe(0);
  }));

test("getting invalid topic should return undefined", () =>
  notebookTest().then(({ db, id }) => {
    expect(db.notebooks.notebook(id).topics.topic("invalid")).toBeUndefined();
  }));

test("add topic to notebook", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;
    await topics.add("Home");
    expect(topics.all.length).toBeGreaterThan(1);
    expect(topics.all.findIndex((v) => v.title === "Home")).toBeGreaterThan(-1);
  }));

test("add note to topic", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;
    await topics.add("Home");
    let topic = topics.topic("Home");
    let noteId = await db.notes.add(TEST_NOTE);
    await topic.add(noteId);
    expect(topics.all.find((v) => v.title === "Home").notes.length).toBe(1);
  }));

test("edit topic title", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;

    await topics.add("Home");

    let topic = topics.topic("Home");

    expect(topics.all.length).toBe(3);

    const oldDateEdited = topic._topic.dateEdited;

    await delay(30);

    await topics.add({ id: topic._topic.id, title: "Hello22" });

    expect(topics.all.length).toBe(3);
    expect(topics.topic(topic._topic.id)._topic.title).toBe("Hello22");
    expect(topics.topic(topic._topic.id)._topic.dateEdited).toBeGreaterThan(
      oldDateEdited
    );
  }));

test("duplicate topic to notebook should not be added", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;
    await topics.add("Home");
    let len = topics.all.length;
    await topics.add("Home");
    expect(topics.all.length).toBe(len);
  }));

test("get topic", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;
    await topics.add("Home");
    let topic = topics.topic("Home");
    let noteId = await db.notes.add({
      content: TEST_NOTE.content,
    });
    await topic.add(noteId);
    topic = topics.topic("Home");
    expect(await db.content.get(topic.all[0].contentId)).toBeDefined();
    expect(topic.totalNotes).toBe(1);
  }));

test("delete a topic", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;
    await topics.add("Home");
    await topics.delete(topics.topic("Home")._topic.id);
    expect(topics.all.findIndex((v) => v.title === "Home")).toBe(-1);
  }));

test("delete note from edited topic", () =>
  notebookTest().then(async ({ id }) =>
    noteTest().then(async ({ db, id: noteId }) => {
      let topics = db.notebooks.notebook(id).topics;
      await topics.add("Home");
      let topic = topics.topic("Home");
      await db.notes.move({ id, topic: topic._topic.title }, noteId);
      await topics.add({ id: topic._topic.id, title: "Hello22" });
      await db.notes.delete(noteId);
    })
  ));

test("editing one topic should not update dateEdited of all", () =>
  notebookTest().then(async ({ db, id }) => {
    let topics = db.notebooks.notebook(id).topics;

    await topics.add("Home");
    await topics.add("Home2");
    await topics.add("Home3");

    let topic = topics.topic("Home");

    const oldTopics = topics.all.filter((t) => t.title !== "Home");

    await delay(100);

    await topics.add({ id: topic._topic.id, title: "Hello22" });

    const newTopics = topics.all.filter((t) => t.title !== "Hello22");

    //console.log(newTopics, oldTopics);
    expect(
      newTopics.every(
        (t) =>
          oldTopics.findIndex(
            (topic) => topic.id === t.id && topic.dateEdited === t.dateEdited
          ) > -1
      )
    ).toBe(true);
  }));

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
