import Topic from "../models/topic";
import { qclone } from "qclone";
import id from "../utils/id";

export default class Topics {
  /**
   *
   * @param {import('../api').default} db
   * @param {string} notebookId
   */
  constructor(notebookId, db) {
    this._db = db;
    this._notebookId = notebookId;
  }

  has(topic) {
    return (
      this.all.findIndex(
        (v) => v.id === topic || v.title === (topic.title || topic)
      ) > -1
    );
  }

  /* _dedupe(source) {
    let length = source.length,
      seen = new Map();
    for (let index = 0; index < length; index++) {
      let value = source[index];
      if (value.id) {
        seen.set(value.id, {
          ...seen.get(value.id),
          ...value,
        });
        continue;
      }
      let title = value.title || value;
      if (title.trim().length <= 0) continue;
      seen.set(title, value);
    }
    return seen;
  } */

  async add(...topics) {
    let notebook = qclone(this._db.notebooks.notebook(this._notebookId).data);

    let allTopics = [...notebook.topics, ...topics];

    notebook.topics = [];
    for (let t of allTopics) {
      let topic = makeTopic(t, this._notebookId);

      if (notebook.topics.findIndex((_topic) => _topic.title === t) > -1)
        continue;

      if (topic.title.length <= 0) continue;

      if (topics.findIndex((t) => topic.id === t.id) > -1)
        topic.dateEdited = Date.now();

      let index = notebook.topics.findIndex((t) => t.id === topic.id);
      if (index > -1) {
        notebook.topics[index] = {
          ...notebook.topics[index],
          ...topic,
        };
      } else {
        notebook.topics.push(topic);
      }
    }
    return this._db.notebooks._collection.addItem(notebook);
  }

  /**
   * @returns {Array} an array containing all the topics
   */
  get all() {
    return this._db.notebooks.notebook(this._notebookId).data.topics;
  }

  /**
   *
   * @param {string | Object} topic can be an object or string containing the topic title.
   * @returns {Topic} The topic by the given title
   */
  topic(topic) {
    if (typeof topic === "string") {
      topic = this.all.find((t) => t.id === topic || t.title === topic);
    }
    if (!topic) return;
    return new Topic(topic, this._notebookId, this._db);
  }

  async delete(...topicIds) {
    let allTopics = qclone(this.all); //FIXME: make a deep copy
    for (let i = 0; i < allTopics.length; i++) {
      let topic = allTopics[i];
      if (!topic) continue;
      let index = topicIds.findIndex((id) => topic.id === id);
      let t = this.topic(topic);
      await t.delete(...topic.notes);
      await this._db.settings.unpin(topic.id);
      if (index > -1) {
        allTopics.splice(i, 1);
      }
    }
    await this._db.notebooks.add({ id: this._notebookId, topics: allTopics });
  }
}

// we export this for testing.
export function makeTopic(topic, notebookId) {
  if (typeof topic !== "string") return topic;
  return {
    type: "topic",
    id: id(), //topic,
    notebookId,
    title: topic.trim(),
    dateCreated: Date.now(),
    dateEdited: Date.now(),
    notes: [],
  };
}
