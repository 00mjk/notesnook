import { CHECK_IDS, EV, EVENTS, sendCheckUserStatusEvent } from "../common";
import getId from "../utils/id";

const ERASE_TIME = 1000 * 60 * 30;
export default class Vault {
  /**
   *
   * @param {import('./index').default} db
   */
  constructor(db) {
    this._db = db;
    this._context = db.context;
    this._key = "Notesnook";
    this._password = "";
    this.ERRORS = {
      noVault: "ERR_NO_VAULT",
      vaultLocked: "ERR_VAULT_LOCKED",
      wrongPassword: "ERR_WRONG_PASSWORD",
    };
    EV.subscribe(EVENTS.userLoggedOut, () => {
      this._password = "";
    });
  }

  /**
   * Creates a new vault (replacing if any older exists)
   * @param {string} password The password
   * @returns {Promise<Boolean>}
   */
  async create(password) {
    if (!(await sendCheckUserStatusEvent(CHECK_IDS.vaultAdd))) return;

    const vaultKey = await this._context.read("vaultKey");
    if (!vaultKey || !vaultKey.cipher || !vaultKey.iv) {
      const encryptedData = await this._context.encrypt(
        { password },
        this._key
      );
      await this._context.write("vaultKey", encryptedData);
      this._password = password;
      this._startEraser();
    }
    return true;
  }

  /**
   * Unlocks the vault with the given password
   * @param {string} password The password
   * @throws  ERR_NO_VAULT | ERR_WRONG_PASSWORD
   * @returns {Promise<Boolean>}
   */
  async unlock(password) {
    const vaultKey = await this._context.read("vaultKey");
    if (!(await this.exists(vaultKey))) throw new Error(this.ERRORS.noVault);
    var data;
    try {
      data = await this._context.decrypt({ password }, vaultKey);
    } catch (e) {
      throw new Error(this.ERRORS.wrongPassword);
    }
    if (data !== this._key) {
      throw new Error(this.ERRORS.wrongPassword);
    }
    this._password = password;
    this._startEraser();
    return true;
  }

  async changePassword(oldPassword, newPassword) {
    if (await this.unlock(oldPassword)) {
      const lockedNotes = this._db.notes.all.filter((v) => v.locked);
      for (var note of lockedNotes) {
        await this._unlockNote(note, true);
      }
      await this._context.remove("vaultKey");
      await this.create(newPassword);
      for (var note of lockedNotes) {
        await this._lockNote(note);
      }
    }
  }

  _startEraser() {
    setTimeout(() => {
      this._password = "";
    }, ERASE_TIME);
  }

  /**
   * Locks (add to vault) a note
   * @param {string} noteId The id of the note to lock
   */
  async add(noteId) {
    if (!(await sendCheckUserStatusEvent(CHECK_IDS.vaultAdd))) return;

    await this._check();
    await this._lockNote({ id: noteId });
  }

  /**
   * Permanently unlocks (remove from vault) a note
   * @param {string} noteId The note id
   * @param {string} password The password to unlock note with
   */
  async remove(noteId, password) {
    if (await this.unlock(password)) {
      const note = this._db.notes.note(noteId).data;
      await this._unlockNote(note, true);
    }
  }

  async clear(password) {}

  /**
   * Temporarily unlock (open) a note
   * @param {string} noteId The note id
   * @param {string} password The password to open note with
   */
  async open(noteId, password) {
    if (await this.unlock(password)) {
      const note = this._db.notes.note(noteId).data;
      return this._unlockNote(note, false);
    }
  }

  /**
   * Saves a note into the vault
   * @param {{Object}} note The note to save into the vault
   */
  async save(note) {
    if (!note) return;
    //await this._check();
    //let id = note.id || getId();
    return await this._lockNote(note);
  }

  async exists(vaultKey) {
    if (!vaultKey) vaultKey = await this._context.read("vaultKey");
    return vaultKey && vaultKey.cipher && vaultKey.iv;
  }

  // Private & internal methods

  /** @private */
  _locked() {
    return !this._password || !this._password.length;
  }

  /** @private */
  async _check() {
    if (!(await this.exists())) {
      throw new Error(this.ERRORS.noVault);
    }

    if (this._locked()) {
      throw new Error(this.ERRORS.vaultLocked);
    }
  }

  /** @private */
  async _encryptContent(contentId, content, type) {
    let encryptedContent = await this._context.encrypt(
      { password: this._password },
      JSON.stringify(content)
    );

    await this._db.content.add({ id: contentId, data: encryptedContent, type });
  }

  /** @private */
  async _decryptContent(contentId) {
    let encryptedContent = await this._db.content.raw(contentId);

    let decryptedContent = await this._context.decrypt(
      { password: this._password },
      encryptedContent.data
    );

    return { type: encryptedContent.type, data: JSON.parse(decryptedContent) };
  }

  /** @private */
  async _lockNote(note) {
    let { id, content: { type, data } = {}, contentId } = note;

    if (!data || !type || !contentId) {
      note = this._db.notes.note(id);
      if (note.data.locked) return;
      contentId = note.data.contentId;
      let content = await this._db.content.raw(contentId);
      data = content.data;
      type = content.type;
    }

    await this._encryptContent(contentId, data, type);

    return await this._db.notes.add({
      id,
      locked: true,
      headline: "",
      title: note.title,
      favorite: note.favorite,
    });
  }

  /** @private */
  async _unlockNote(note, perm = false) {
    let content = await this._decryptContent(note.contentId);

    if (perm) {
      await this._db.notes.add({
        id: note.id,
        locked: false,
        headline: note.headline,
        contentId: note.contentId,
        content,
      });
      // await this._db.content.add({ id: note.contentId, data: content });
      return;
    }

    return {
      ...note,
      content,
    };
  }

  /** @inner */
  async _getKey() {
    if (await this.exists()) return await this._context.read("vaultKey");
  }

  /** @inner */
  async _setKey(vaultKey) {
    if (!vaultKey) return;
    await this._context.write("vaultKey", vaultKey);
  }
}
