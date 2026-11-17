"use strict";

// This module contains no DOM calls, storage or network requests.

export function calculateSubnet(input) {
  const match = /^((?:\d{1,3}\.){3}\d{1,3})\/(\d{1,2})$/.exec(String(input).trim());
  if (!match) throw new Error("Ange en IPv4-adress med CIDR-prefix, till exempel 192.168.1.10/24.");
  const octets = match[1].split(".");
  if (!octets.every((part) => String(Number(part)) === part && Number(part) <= 255)) {
    throw new Error("Ogiltig IPv4-adress. Varje oktett måste vara mellan 0 och 255 utan inledande nollor.");
  }
  const prefix = Number(match[2]);
  if (prefix < 0 || prefix > 32) throw new Error("CIDR-prefix måste vara mellan 0 och 32.");
  const ip = octets.reduce((acc, octet) => acc * 256 + Number(octet), 0) >>> 0;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const wildcard = (~mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  const usable = prefix <= 30 ? total - 2 : total;
  const first = prefix <= 30 ? network + 1 : network;
  const last = prefix <= 30 ? broadcast - 1 : broadcast;
  const dotted = (value) => [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
  return {
    ip: dotted(ip), cidr: `${dotted(network)}/${prefix}`, prefix,
    network: dotted(network), mask: dotted(mask), wildcard: dotted(wildcard),
    broadcast: dotted(broadcast), first: dotted(first), last: dotted(last),
    total, usable,
    note: prefix === 31 ? "Punkt-till-punkt-nät: båda adresserna är användbara (RFC 3021)." :
      prefix === 32 ? "En enda IPv4-adress (/32)." : "Nätadress och broadcastadress räknas inte som användbara värdadresser."
  };
}

const MAX_INPUT = 1024 * 1024;
export function transformJson(input, mode = "format") {
  if (input.length > MAX_INPUT) throw new Error("JSON-texten får vara högst 1 MiB.");
  if (!input.trim()) throw new Error("Klistra in JSON för att fortsätta.");
  let parsed;
  try { parsed = JSON.parse(input); }
  catch (error) { throw new Error(`Ogiltig JSON: ${error.message}`); }
  if (mode !== "format" && mode !== "minify") throw new Error("Okänd JSON-åtgärd.");
  return JSON.stringify(parsed, null, mode === "format" ? 2 : 0);
}

export function encodeBase64(text) {
  if (text.length > 100000) throw new Error("Texten får vara högst 100 000 tecken.");
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  // Avoid huge argument arrays and browser-specific Unicode behavior of btoa().
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary);
}

export function decodeBase64(text) {
  const normalized = text.replace(/\s+/g, "");
  if (normalized.length > 150000) throw new Error("Base64-texten är för lång.");
  if (!normalized || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error("Ogiltig Base64. Kontrollera tecken och eventuell padding (=).");
  }
  try {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Base64 innehåller inte giltig UTF-8-text.");
  }
}

function secureIndex(limit, source) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 0xffffffff) throw new Error("Ogiltig slumptalsgräns.");
  const range = 0x100000000;
  const maxAccepted = Math.floor(range / limit) * limit;
  const buffer = new Uint32Array(1);
  let value;
  do { source.getRandomValues(buffer); value = buffer[0]; } while (value >= maxAccepted);
  return value % limit;
}

export function generateUuids(count = 1, source = globalThis.crypto) {
  if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error("Antalet måste vara mellan 1 och 20.");
  if (!source?.getRandomValues) throw new Error("Web Crypto API är inte tillgängligt.");
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(16);
    source.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  });
}

export function generatePassword({ length = 20, lower = true, upper = true, digits = true, symbols = true, avoidSimilar = false } = {}, source = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 12 || length > 64) throw new Error("Längden måste vara mellan 12 och 64 tecken.");
  if (!source?.getRandomValues) throw new Error("Web Crypto API är inte tillgängligt.");
  const groups = [];
  if (lower) groups.push("abcdefghijklmnopqrstuvwxyz");
  if (upper) groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (digits) groups.push("0123456789");
  if (symbols) groups.push("!@#$%^&*()-_=+?");
  if (!groups.length) throw new Error("Välj minst en teckentyp.");
  const selectedGroups = groups.map((group) => avoidSimilar ? group.replace(/[0O1lI]/g, "") : group).filter(Boolean);
  if (selectedGroups.length !== groups.length) throw new Error("En vald teckentyp saknar tillgängliga tecken.");
  const pool = selectedGroups.join("");
  const chars = selectedGroups.map((group) => group[secureIndex(group.length, source)]);
  while (chars.length < length) chars.push(pool[secureIndex(pool.length, source)]);
  for (let index = chars.length - 1; index > 0; index--) {
    const randomIndex = secureIndex(index + 1, source);
    [chars[index], chars[randomIndex]] = [chars[randomIndex], chars[index]];
  }
  return chars.join("");
}

const MAX_LINES = 250;
export function compareLines(before, after) {
  if (before.length > 100000 || after.length > 100000) throw new Error("En text får vara högst 100 000 tecken.");
  const split = (s) => s.replace(/\r\n/g, "\n").split("\n");
  const left = split(before);
  const right = split(after);
  if (left.length > MAX_LINES || right.length > MAX_LINES) throw new Error("Max 250 rader per text.");
  const n = left.length, m = right.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const changes = [];
  let i = 0, j = 0, added = 0, removed = 0;
  while (i < n || j < m) {
    if (i < n && j < m && left[i] === right[j]) {
      changes.push({ type: "same", value: left[i] }); i++; j++;
    } else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) {
      changes.push({ type: "add", value: right[j++] }); added++;
    } else {
      changes.push({ type: "remove", value: left[i++] }); removed++;
    }
  }
  return { changes, added, removed, unchanged: changes.length - added - removed };
}

const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;
export function parseTimestamp(input, mode) {
  const value = String(input).trim();
  if (!value) throw new Error("Ange en tidsstämpel.");
  let millis;
  if (mode === "iso") {
    if (!ISO_WITH_ZONE.test(value)) throw new Error("Ange ISO 8601 med Z eller tidszonsförskjutning, t.ex. 2026-11-17T13:00:00Z.");
    // Reject overflows such as February 30 or 25:61 before calling Date.parse.
    const [, year, month, day, hour, minute, second = "0"] = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/i) || [];
    const y = Number(year), mo = Number(month);
    const leapYear = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
    if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > daysInMonth || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
      throw new Error("Datum eller klockslag är ogiltigt.");
    }
    const offset = value.match(/([+-])(\d{2}):(\d{2})$/);
    if (offset && (Number(offset[2]) > 14 || Number(offset[3]) > 59 || (Number(offset[2]) === 14 && Number(offset[3]) !== 0))) throw new Error("Ogiltig tidszonsförskjutning.");
    millis = Date.parse(value);
  } else if (mode === "seconds" || mode === "milliseconds") {
    if (!/^-?\d+$/.test(value)) throw new Error("Unix-tid måste vara ett heltal.");
    const integer = Number(value);
    if (!Number.isSafeInteger(integer)) throw new Error("Tidsstämpeln är för stor.");
    millis = mode === "seconds" ? integer * 1000 : integer;
  } else throw new Error("Okänt tidsformat.");
  if (!Number.isFinite(millis) || Number.isNaN(new Date(millis).getTime()) || millis < -62135596800000 || millis > 253402300799999) {
    throw new Error("Tidsstämpeln ligger utanför intervallet år 0001–9999.");
  }
  return new Date(millis);
}

export function describeTimestamp(date) {
  const ms = date.getTime();
  if (!Number.isFinite(ms)) throw new Error("Ogiltigt datum.");
  return {
    iso: date.toISOString(),
    stockholm: new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(date),
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: ms
  };
}
