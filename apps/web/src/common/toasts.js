import { db } from ".";
import { store as notestore } from "../stores/note-store";
import { store as nbstore } from "../stores/notebook-store";
import { store as trashstore } from "../stores/trash-store";
import { showToast } from "../utils/toast";

function showNotesMovedToast(note, noteIds, notebook) {
  let actions;

  const newNotebook = db.notebooks.notebook(notebook.id);
  let verb =
    noteIds.length > 1 ? "added" : note.notebook?.id ? "moved" : "added";
  let messageText = noteIds.length > 1 ? `${noteIds.length} notes` : "Note";
  messageText += ` ${verb} to "${newNotebook.title}"`;

  if (noteIds.length === 1) {
    const undoAction = async () => {
      toast.hide();
      if (note.notebook?.id) {
        db.notes.move(note.notebook, note.id);
        const notebook = db.notebooks.notebook(note.notebook.id);
        showToast("success", `Note moved back to "${notebook.title}"`);
      } else {
        await newNotebook.topics.topic(notebook.topic).delete(note.id);
        showToast("success", `Note removed from "${newNotebook.title}"`);
      }
    };
    actions = [{ text: "Undo", onClick: undoAction }];
  }
  var toast = showToast("success", messageText, actions);
}

async function showUnpinnedToast(itemId, itemType) {
  const noun = itemType === "note" ? "Note" : "Notebook";
  const messageText = `${noun} unpinned successfully!`;
  const undoAction = async () => {
    toast.hide();
    if (itemType === "note") await notestore.pin(itemId);
    else if (itemType === "notebook") await nbstore.pin(itemId);
  };
  let actions = [{ text: "Undo", onClick: undoAction }];
  var toast = showToast("success", messageText, actions);
}

function showItemDeletedToast(item) {
  const noun = item.type === "note" ? "Note" : "Notebook";
  const messageText = `${noun} deleted successfully!`;
  const undoAction = async () => {
    toast.hide();
    let trashItem = db.trash.all.find((i) => i.itemId === item.id);
    await db.trash.restore(trashItem.id);
    nbstore.refresh();
  };
  let actions = [{ text: "Undo", onClick: undoAction }];
  var toast = showToast("success", messageText, actions);
}

async function showPermanentDeleteToast(item) {
  const noun = item.itemType === "note" ? "Note" : "Notebook";
  const messageText = `${noun} permanently deleted!`;
  const timeoutId = setTimeout(() => {
    trashstore.delete(item.id, true);
  }, 5000);
  const undoAction = async () => {
    toast.hide();
    trashstore.refresh();
    clearTimeout(timeoutId);
  };
  let actions = [{ text: "Undo", onClick: undoAction }];
  var toast = showToast("success", messageText, actions);
}

export {
  showNotesMovedToast,
  showUnpinnedToast,
  showItemDeletedToast,
  showPermanentDeleteToast,
};
