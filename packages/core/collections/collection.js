import { EV } from "../common";
import CachedCollection from "../database/cached-collection";
import IndexedCollection from "../database/indexed-collection";

class Collection {
  static async new(db, name, cached = true, deferred = false) {
    const collection = new this(db, name, cached);

    if (!deferred && collection.init) await collection.init();
    else await collection._collection.indexer.init();

    if (collection._collection.clear)
      EV.subscribe(
        "user:loggedOut",
        async () => await collection._collection.clear()
      );

    return collection;
  }

  async init() {
    await this._collection.init();
  }

  /**
   *
   * @param {import("../api").default} db
   */
  constructor(db, name, cached) {
    this._db = db;
    if (cached) this._collection = new CachedCollection(this._db.context, name);
    else this._collection = new IndexedCollection(this._db.context, name);
  }
}
export default Collection;
