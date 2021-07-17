/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-undef */

/**
 * TODO: We are still not checking if toast appears on delete/restore or not.
 */ const { test, expect } = require("@playwright/test");
const { getTestId, createNote, NOTE, downloadFile } = require("./utils");
const {
  navigateTo,
  clickMenuItem,
  openContextMenu,
  confirmDialog,
  closeContextMenu,
  useContextMenu,
} = require("./utils/actions");
const {
  isToastPresent,
  isPresent,
  isAbsent,
  checkNotePresence,
} = require("./utils/conditions");
const List = require("./utils/listitemidbuilder");
const Menu = require("./utils/menuitemidbuilder");

async function createNoteAndCheckPresence(note = NOTE, viewId = "home") {
  await createNote(note, "notes");

  // make sure the note has saved.
  await page.waitForTimeout(1000);

  let noteSelector = await checkNotePresence(viewId);

  await page.click(noteSelector, { button: "left" });

  return noteSelector;
}

async function deleteNoteAndCheckAbsence(viewId = "home") {
  const noteSelector = await createNoteAndCheckPresence(undefined, viewId);

  await openContextMenu(noteSelector);

  await clickMenuItem("movetotrash");

  // await confirmDialog();

  await expect(isToastPresent()).resolves.toBeTruthy();

  await navigateTo("trash");

  const trashItemSelector = List.new("trash")
    .grouped()
    .atIndex(0)
    .title()
    .build();

  await expect(isPresent(trashItemSelector)).resolves.toBeTruthy();

  await expect(page.innerText(trashItemSelector)).resolves.toBe(NOTE.title);

  return trashItemSelector;
}

async function lockUnlockNote(noteSelector, type) {
  await openContextMenu(noteSelector);

  await clickMenuItem(type);

  await page.fill(getTestId("dialog-password"), "123abc123abc");

  await confirmDialog();

  await expect(isToastPresent()).resolves.toBeTruthy();
}

async function checkNotePinned(noteSelector, pause) {
  await openContextMenu(noteSelector);

  const unpinSelector = Menu.new("menuitem").item("unpin").build();

  await expect(isPresent(unpinSelector)).resolves.toBeTruthy();

  await closeContextMenu(noteSelector);

  // wait for the menu to properly close
  await page.waitForTimeout(500);
}

async function checkNoteLocked(noteSelector) {
  await page.waitForTimeout(500);

  await expect(
    isPresent(List.new("note").grouped().atIndex(0).locked().build())
  ).resolves.toBeTruthy();

  await expect(
    isAbsent(List.new("note").grouped().atIndex(0).body().build())
  ).resolves.toBeTruthy();

  await useContextMenu(noteSelector, () =>
    expect(
      isPresent(Menu.new("menuitem").item("unlock").build())
    ).resolves.toBeTruthy()
  );
}

async function checkNoteColored(noteSelector) {
  await page.waitForTimeout(1000);

  await openContextMenu(noteSelector);

  await expect(
    isPresent(Menu.new("menuitem").colorCheck("red").build())
  ).resolves.toBeTruthy();

  await closeContextMenu(noteSelector);

  // wait for the menu to properly close
  await page.waitForTimeout(500);

  await navigateTo("red");

  // wait for the page to render and notes to populate
  await page.waitForTimeout(500);

  const coloredNote = await page.$(
    List.new("note").grouped().atIndex(0).build()
  );
  if (!coloredNote) throw new Error("Colored note not present.");
}

async function addNoteToNotebook() {
  await page.type(getTestId("mnd-new-notebook-title"), "Test Notebook");

  await page.press(getTestId("mnd-new-notebook-title"), "Enter");

  await page.click(List.new("notebook").atIndex(0).build());

  await page.click(getTestId("mnd-new-topic"));

  await page.type(getTestId("mnd-new-topic-title"), "Topic 1");

  await page.press(getTestId("mnd-new-topic-title"), "Enter");

  await page.click(List.new("notebook").atIndex(0).topic(0).build());

  await page.click(getTestId("dialog-no"));

  await expect(isToastPresent()).resolves.toBeTruthy();

  await navigateTo("notebooks");

  await page.click(List.new("notebook").grouped().atIndex(0).title().build());

  await page.click(List.new("topic").grouped().atIndex(0).title().build());

  await checkNotePresence("notes");
}

async function exportNote(format) {
  const noteSelector = await createNoteAndCheckPresence();

  await openContextMenu(noteSelector);

  await page.click(Menu.new("menuitem").item("export").build());

  // we need to override date time so
  // date created & date edited remain fixed.
  await page.evaluate(() => {
    // eslint-disable-next-line no-extend-native
    Date.prototype.toLocaleDateString = () => "xxx";
  });

  const output = await downloadFile(
    getTestId(`export-dialog-${format}`),
    "utf-8"
  );
  expect(output).toMatchSnapshot(`export-${format}.txt`);
}

test.describe("run tests independently", () => {
  /**
   * @type {Page}
   */
  global.page = null;
  test.beforeEach(async ({ page: _page }) => {
    global.page = _page;
    await page.goto("http://localhost:3000/");
  });

  test("create a note", async () => {
    await createNoteAndCheckPresence();
  });

  test("delete a note", async () => {
    await deleteNoteAndCheckAbsence();
  });

  test("restore a note", async () => {
    const trashItemSelector = await deleteNoteAndCheckAbsence();

    await openContextMenu(trashItemSelector);

    await clickMenuItem("restore");

    await expect(isToastPresent()).resolves.toBeTruthy();

    await navigateTo("notes");

    await checkNotePresence("home");
  });

  test("add a note to notebook", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await openContextMenu(noteSelector);

    await clickMenuItem("addtonotebook(s)");

    await addNoteToNotebook();
  });

  test("favorite a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await useContextMenu(noteSelector, async () => {
      await clickMenuItem("favorite");
    });

    await useContextMenu(noteSelector, async () => {
      await expect(
        isPresent(Menu.new("menuitem").item("unfavorite").build())
      ).resolves.toBeTruthy();
    });

    await navigateTo("favorites");

    await checkNotePresence("notes");

    await navigateTo("notes");
  });

  test("unfavorite a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await useContextMenu(noteSelector, async () => {
      await clickMenuItem("favorite");
    });

    await page.waitForTimeout(500);

    await useContextMenu(noteSelector, async () => {
      await clickMenuItem("unfavorite");
    });

    await useContextMenu(noteSelector, async () => {
      await expect(
        isPresent(Menu.new("menuitem").item("favorite").build())
      ).resolves.toBeTruthy();
    });
  });

  test("favorite a note from properties", async () => {
    let noteSelector = await createNoteAndCheckPresence();

    await page.click(getTestId("properties"));

    await page.click(getTestId("properties-favorite"));

    await page.click(getTestId("properties-close"));

    await navigateTo("favorites");

    noteSelector = await checkNotePresence("notes");

    await useContextMenu(noteSelector, async () => {
      await expect(
        isPresent(Menu.new("menuitem").item("unfavorite").build())
      ).resolves.toBeTruthy();
    });

    await navigateTo("notes");
  });

  test("assign a color to a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await openContextMenu(noteSelector);

    await page.click(Menu.new("menuitem").color("red").build());

    await page.click(getTestId("properties"));

    await expect(
      isPresent(getTestId("properties-red-check"))
    ).resolves.toBeTruthy();

    await page.click(getTestId("properties-close"));

    await checkNoteColored(noteSelector);
  });

  test("pin a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await useContextMenu(noteSelector, () => clickMenuItem("pin"));

    await checkNotePinned(noteSelector);
  });

  test("unpin a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await useContextMenu(noteSelector, () => clickMenuItem("pin"));

    await page.waitForTimeout(500);

    await useContextMenu(noteSelector, () => clickMenuItem("unpin"));

    await useContextMenu(noteSelector, () =>
      expect(
        isPresent(Menu.new("menuitem").item("pin").build())
      ).resolves.toBeTruthy()
    );
  });

  test("pin a note from properties", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await page.click(getTestId("properties"));

    await page.click(getTestId("properties-pinned"));

    await page.click(getTestId("properties-close"));

    await checkNotePinned(noteSelector, true);
  });

  test("permanently delete a note", async () => {
    //editor-title  //quill
    const trashItemSelector = await deleteNoteAndCheckAbsence();

    await openContextMenu(trashItemSelector);

    await clickMenuItem("delete");

    await confirmDialog();

    await expect(isToastPresent()).resolves.toBeTruthy();

    await expect(page.$(trashItemSelector)).resolves.toBeFalsy();
  });

  test("lock a note", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await lockUnlockNote(noteSelector, "lock");

    await checkNoteLocked(noteSelector);
  });

  test("unlock a note permanently", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await lockUnlockNote(noteSelector, "lock");

    await page.waitForTimeout(1000);

    await lockUnlockNote(noteSelector, "unlock");

    await expect(
      isAbsent(List.new("note").grouped().atIndex(0).locked().build())
    ).resolves.toBeTruthy();

    await expect(
      page.textContent(List.new("note").grouped().atIndex(0).body().build())
    ).resolves.toContain(NOTE.content);

    await openContextMenu(noteSelector);

    await expect(
      isPresent(Menu.new("menuitem").item("lock").build())
    ).resolves.toBeTruthy();

    await closeContextMenu(noteSelector);
  });

  test("lock a note from properties", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await page.click(getTestId("properties"));

    await page.click(getTestId("properties-locked"));

    await page.fill(getTestId("dialog-password"), "123abc123abc");

    await confirmDialog();

    // TODO fix this: no toast is shown when locking note from properties.
    //await expect(isToastPresent()).resolves.toBeTruthy();

    await checkNoteLocked(noteSelector);
  });

  test("add a note to notebook from properties", async () => {
    await createNoteAndCheckPresence();

    await page.click(getTestId("properties"));

    await page.click(getTestId("properties-add-to-nb"));

    await addNoteToNotebook();
  });

  test("assign a color to note from properties", async () => {
    const noteSelector = await createNoteAndCheckPresence();

    await page.click(getTestId("properties"));

    await page.click(getTestId("properties-red"));

    await checkNoteColored(noteSelector);
  });

  test("add tags to note", async () => {
    await createNoteAndCheckPresence();
    const tags = ["hello", "nevermind", "what", "no way", "gold and goldie"];

    for (let tag of tags) {
      await page.fill(getTestId("editor-tag-input"), tag);

      await page.press(getTestId("editor-tag-input"), "Enter");

      await expect(isPresent(getTestId(`tag-${tag}`))).resolves.toBeTruthy();
    }
  });

  test(`export note as txt`, async () => await exportNote("txt"));
  test(`export note as md`, async () => await exportNote("md"));
  test(`export note as html`, async () => await exportNote("html"));
});
