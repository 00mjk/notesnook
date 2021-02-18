import Indexer from "./indexer";

export default class IndexedCollection {
  constructor(context, type) {
    this.indexer = new Indexer(context, type);
  }

  clear() {
    return this.indexer.clear();
  }

  async init() {
    await this.indexer.init();
  }

  async addItem(item) {
    if (!item.id) throw new Error("The item must contain the id field.");

    const exists = this.exists(item.id);
    if (!exists) item.dateCreated = item.dateCreated || Date.now();
    await this.updateItem(item);
    if (!exists) {
      await this.indexer.index(item.id);
    }
  }

  async updateItem(item) {
    if (!item.id) throw new Error("The item must contain the id field.");
    // if item is newly synced, remote will be true.
    item.dateEdited = item.remote ? item.dateEdited : Date.now();
    // the item has become local now, so remove the flags
    delete item.remote;
    delete item.migrated;
    await this.indexer.write(item.id, item);
  }

  removeItem(id) {
    return this.updateItem({
      id,
      deleted: true,
      dateEdited: Date.now(),
    });
  }

  async deleteItem(id) {
    await this.indexer.deindex(id);
    return await this.indexer.remove(id);
  }

  exists(id) {
    return this.indexer.exists(id);
  }

  getItem(id) {
    return this.indexer.read(id);
  }

  async getItems(indices) {
    const data = await this.indexer.readMulti(indices);
    return data.reduce((total, current) => {
      total.push(current[1]);
      return total;
    }, []);
  }
}
