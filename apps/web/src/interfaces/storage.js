import localforage from "localforage";
import { extendPrototype } from "localforage-getitems";
import sort from "fast-sort";
import Crypto from "./crypto";

const crypto = new Crypto();
extendPrototype(localforage);

localforage.config({
  name: "Notesnook",
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
});

function read(key) {
  return localforage.getItem(key);
}

function readMulti(keys) {
  if (keys.length <= 0) return [];
  return localforage.getItems(sort(keys).asc());
}

function write(key, data) {
  return localforage.setItem(key, data);
}

function remove(key) {
  return localforage.removeItem(key);
}

function clear() {
  return localforage.clear();
}

function getAllKeys() {
  return localforage.keys();
}

async function deriveCryptoKey(name, data) {
  const { password, salt } = data;
  if (!password) throw new Error("Invalid data provided to deriveCryptoKey.");

  const keyData = await crypto.deriveKey(password, salt, true);

  if (localforage.supports(localforage.INDEXEDDB) && window?.crypto?.subtle) {
    const pbkdfKey = await derivePBKDF2Key(password);
    await write(name, pbkdfKey);
    const cipheredKey = await aesEncrypt(pbkdfKey, keyData);
    await write(`${name}@_k`, cipheredKey);
  } else {
    await write(`${name}@_k`, keyData);
  }
}

async function getCryptoKey(name) {
  if (localforage.supports(localforage.INDEXEDDB) && window?.crypto?.subtle) {
    const pbkdfKey = await read(name);
    const cipheredKey = await read(`${name}@_k`);
    if (typeof cipheredKey === "string") return cipheredKey;
    if (!pbkdfKey || !cipheredKey) return;
    return await aesDecrypt(pbkdfKey, cipheredKey);
  } else {
    return await read(`${name}@_k`);
  }
}

const Storage = {
  read,
  readMulti,
  write,
  remove,
  clear,
  getAllKeys,
  deriveCryptoKey,
  getCryptoKey,
  hash: crypto.hashPassword,
  encrypt: crypto.encrypt,
  decrypt: crypto.decrypt,
};
export default Storage;

let enc = new TextEncoder();
let dec = new TextDecoder();
async function derivePBKDF2Key(password) {
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  let salt = window.crypto.getRandomValues(new Uint8Array(16));
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(cryptoKey, data) {
  let iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cipher = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    enc.encode(data)
  );

  return {
    iv,
    cipher,
  };
}

async function aesDecrypt(cryptoKey, data) {
  const { iv, cipher } = data;

  const plainText = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    cipher
  );
  return dec.decode(plainText);
}
