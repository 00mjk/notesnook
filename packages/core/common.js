import EventManager from "./utils/event-manager";

export const EV = new EventManager();

export async function sendCheckUserStatusEvent(type) {
  const results = await EV.publishWithResult(EVENTS.userCheckStatus, type);
  if (typeof results === "boolean") return results;
  return results.some((r) => r.type === type && r.result === true);
}

export const CHECK_IDS = {
  noteColor: "note:color",
  noteTag: "note:tag",
  noteExport: "note:export",
  vaultAdd: "vault:add",
  notebookAdd: "notebook:add",
  backupEncrypt: "backup:encrypt",
  databaseSync: "database:sync",
};

export const EVENTS = {
  userCheckStatus: "user:checkStatus",
  userSubscriptionUpdated: "user:subscriptionUpdated",
  userEmailConfirmed: "user:emailConfirmed",
  userLoggedIn: "user:loggedIn",
  userLoggedOut: "user:loggedOut",
  userFetched: "user:fetched",
  userSignedUp: "user:signedUp",
  userSessionExpired: "user:sessionExpired",
  databaseSyncRequested: "db:syncRequested",
  databaseMigrated: "db:migrated",
  databaseUpdated: "db:updated",
  appRefreshRequested: "app:refreshRequested",
  noteRemoved: "note:removed",
};

export const CURRENT_DATABASE_VERSION = 5.2;

export function setUserPersonalizationBytes(userSalt) {
  USER_PERSONALIZATION_HASH = new Uint8Array(
    Buffer.from(userSalt, "base64url"),
    0,
    8
  );
  if (
    !USER_PERSONALIZATION_HASH.length ||
    !USER_PERSONALIZATION_HASH.byteLength
  )
    USER_PERSONALIZATION_HASH = undefined;
}
export var USER_PERSONALIZATION_HASH = null;
