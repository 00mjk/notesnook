import { EV, EVENTS } from "../common";
import id from "../utils/id";
import "../types";
import setManipulator from "../utils/set";

class Settings {
  /**
   *
   * @param {import("./index").default} db
   */
  constructor(db) {
    this._db = db;
  }

  async init() {
    this._initSettings();
    var settings = await this._db.context.read("settings");
    if (settings) this._settings = settings;
    else await this._saveSettings();

    EV.subscribe(EVENTS.userLoggedOut, () => {
      this._settings = undefined;
      this._initSettings();
    });
  }

  get raw() {
    return this._settings;
  }

  async merge(item) {
    if (this._settings.dateEdited > (await this._db.lastSynced())) {
      this._settings.pins = setManipulator.union(
        this._settings.pins,
        item.pins
      );
      this._settings.groupOptions = {
        ...item.groupOptions,
        ...this._settings.groupOptions,
      };
    } else {
      this._settings = item;
    }
    await this._db.context.write("settings", item);
  }

  /**
   *
   * @param {GroupingKey} key
   * @param {GroupOptions} groupOptions
   */
  async setGroupOptions(key, groupOptions) {
    this._settings.groupOptions[key] = groupOptions;
    await this._saveSettings();
  }

  /**
   *
   * @param {GroupingKey} key
   * @returns {GroupOptions}
   */
  getGroupOptions(key) {
    return (
      this._settings.groupOptions[key] || {
        groupId: undefined,
        sortBy: "dateEdited",
        groupBy: "dateEdited",
        sortDirection: "desc",
      }
    );
  }

  async pin(type, data) {
    if (type !== "notebook" && type !== "topic" && type !== "tag")
      throw new Error("This item cannot be pinned.");
    if (this.isPinned(data.id)) return;
    this._settings.pins.push({ type, data });
    this._settings.dateEdited = Date.now();

    await this._saveSettings();
  }

  async unpin(id) {
    const index = this._settings.pins.findIndex((i) => i.data.id === id);
    if (index <= -1) return;
    this._settings.pins.splice(index, 1);
    this._settings.dateEdited = Date.now();

    await this._saveSettings();
  }

  isPinned(id) {
    return this._settings.pins.findIndex((v) => v.data.id === id) > -1;
  }

  get pins() {
    return this._settings.pins.reduce((prev, pin) => {
      if (!pin || !pin.data) return;

      let item;
      if (pin.type === "notebook") {
        const notebook = this._db.notebooks.notebook(pin.data.id);
        item = notebook ? notebook.data : null;
      } else if (pin.type === "topic") {
        const notebook = this._db.notebooks.notebook(pin.data.notebookId);
        if (!notebook) item = null;
        const topic = notebook.topics.topic(pin.data.id);
        if (!topic) item = null;
        item = topic._topic;
      } else if (pin.type === "tag") {
        item = this._db.tags.tag(pin.data.id);
      }
      if (item) prev.push(item);
      else this.unpin(pin.data.id); // TODO risky.
      return prev;
    }, []);
  }

  _initSettings() {
    this._settings = {
      type: "settings",
      id: id(),
      pins: [],
      groupOptions: {},
      dateEdited: 0,
      dateCreated: 0,
    };
  }

  async _saveSettings() {
    await this._db.context.write("settings", this._settings);
  }
}
export default Settings;
