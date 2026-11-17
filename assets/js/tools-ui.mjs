"use strict";
import {
  calculateSubnet, transformJson, encodeBase64, decodeBase64,
  compareLines, generateUuids, generatePassword, parseTimestamp, describeTimestamp
} from "./tools-core.mjs";

const $ = (selector, scope = document) => scope.querySelector(selector);
const getValue = (id) => document.getElementById(id).value;
function status(id, text, isError = false) {
  const element = document.getElementById(id);
  element.textContent = text;
  element.classList.toggle("is-error", isError);
}
function runSafely(statusId, work) {
  try { work(); }
  catch (error) { status(statusId, error instanceof Error ? error.message : "Ett okänt fel inträffade.", true); }
}
function renderFields(target, fields) {
  target.replaceChildren();
  for (const [label, value] of fields) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = String(value);
    target.append(dt, dd);
  }
}
function showResults(id) { document.getElementById(id).hidden = false; }

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text); return;
  }
  // Clipboard may be unavailable in older browsers or localhost previews.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Urklippsfunktionen nekades av webbläsaren.");
  } finally { textarea.remove(); }
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = $(button.dataset.copyTarget);
    const text = "value" in target ? target.value : target.textContent;
    if (!text) return;
    const previous = button.textContent;
    try {
      await copyText(text);
      button.textContent = "Kopierat!";
      setTimeout(() => { button.textContent = previous; }, 1700);
    } catch {
      button.textContent = "Kunde inte kopiera";
      setTimeout(() => { button.textContent = previous; }, 2500);
    }
  });
});

// Search/filter on the toolbox landing page.
const searchInput = $("#tools-search");
if (searchInput) {
  const cards = Array.from(document.querySelectorAll("#tools-list .tool-card"));
  const normalize = (text) => text.toLocaleLowerCase("sv").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  searchInput.addEventListener("input", () => {
    const query = normalize(searchInput.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const matches = normalize(card.dataset.search).includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    $("#tools-count").textContent = `${visible} av ${cards.length} verktyg`;
    $("#tools-empty").hidden = visible !== 0;
  });
}

if ($('[data-tool="subnet"]')) {
  $("#subnet-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#subnet-result").hidden = true;
    runSafely("subnet-status", () => {
      const result = calculateSubnet(getValue("subnet-input"));
      const fields = [
        ["Nätadress / CIDR", result.cidr], ["Nätmask", result.mask],
        ["Wildcard", result.wildcard], ["Broadcast", result.broadcast],
        ["Första värdadress", result.first], ["Sista värdadress", result.last],
        ["Totalt antal adresser", result.total.toLocaleString("sv-SE")],
        ["Användbara adresser", result.usable.toLocaleString("sv-SE")]
      ];
      renderFields($("#subnet-fields"), fields);
      $("#subnet-summary").textContent = fields.map(([label, value]) => `${label}: ${value}`).join("\n") + `\n${result.note}`;
      showResults("subnet-result");
      status("subnet-status", result.note);
    });
  });
}

if ($('[data-tool="json"]')) {
  $("#json-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#json-result").hidden = true;
    runSafely("json-status", () => {
      const mode = event.submitter?.value === "minify" ? "minify" : "format";
      const output = transformJson(getValue("json-input"), mode);
      $("#json-output").value = output;
      showResults("json-result");
      status("json-status", `Giltig JSON. Resultat: ${output.length.toLocaleString("sv-SE")} tecken.`);
    });
  });
  $("[data-reset-json]").addEventListener("click", () => {
    $("#json-input").value = "";
    $("#json-output").value = "";
    $("#json-result").hidden = true;
    status("json-status", "");
    $("#json-input").focus();
  });
}

if ($('[data-tool="diff"]')) {
  let currentDiff = "";
  $("#diff-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#diff-result").hidden = true;
    runSafely("diff-status", () => {
      const result = compareLines(getValue("diff-left"), getValue("diff-right"));
      const parent = $("#diff-output");
      parent.replaceChildren();
      const prefixes = { add: "+", remove: "−", same: " " };
      for (const entry of result.changes) {
        const line = document.createElement("div");
        line.className = `diff-line diff-${entry.type}`;
        const prefix = document.createElement("span");
        prefix.className = "diff-prefix";
        prefix.textContent = prefixes[entry.type];
        const content = document.createElement("span");
        content.className = "diff-text";
        content.textContent = entry.value || " ";
        line.append(prefix, content);
        parent.append(line);
      }
      currentDiff = result.changes.map((entry) => `${prefixes[entry.type]} ${entry.value}`).join("\n");
      $("#diff-stats").textContent = `+${result.added} / −${result.removed}`;
      showResults("diff-result");
      status("diff-status", `${result.added} tillagda, ${result.removed} borttagna och ${result.unchanged} oförändrade rader.`);
    });
  });
  $("[data-swap-diff]").addEventListener("click", () => {
    const left = $("#diff-left"), right = $("#diff-right");
    [left.value, right.value] = [right.value, left.value];
    $("#diff-result").hidden = true;
    status("diff-status", "");
  });
  $("[data-copy-diff]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!currentDiff || $("#diff-result").hidden) return;
    const previous = button.textContent;
    try { await copyText(currentDiff); button.textContent = "Kopierat!"; }
    catch { button.textContent = "Kunde inte kopiera"; }
    setTimeout(() => { button.textContent = previous; }, 2000);
  });
}

if ($('[data-tool="base64"]')) {
  $("#base64-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#base64-result").hidden = true;
    runSafely("base64-status", () => {
      const mode = event.submitter?.value === "decode" ? "decode" : "encode";
      $("#base64-output").value = mode === "encode" ? encodeBase64(getValue("base64-input")) : decodeBase64(getValue("base64-input"));
      showResults("base64-result");
      status("base64-status", mode === "encode" ? "Texten är kodad till Base64." : "Base64 är avkodad till UTF-8-text.");
    });
  });
}

if ($('[data-tool="timestamp"]')) {
  const mode = $("#timestamp-type"), input = $("#timestamp-input");
  const now = () => {
    const current = new Date();
    input.value = mode.value === "iso" ? current.toISOString() : String(mode.value === "seconds" ? Math.floor(current.getTime() / 1000) : current.getTime());
    $("#timestamp-result").hidden = true;
    status("timestamp-status", "");
  };
  now();
  $("#timestamp-now").addEventListener("click", now);
  mode.addEventListener("change", now);
  $("#timestamp-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#timestamp-result").hidden = true;
    runSafely("timestamp-status", () => {
      const result = describeTimestamp(parseTimestamp(input.value, mode.value));
      const fields = [
        ["ISO 8601 (UTC)", result.iso], ["Svensk tid", result.stockholm],
        ["Unix (sekunder)", result.unixSeconds], ["Unix (millisekunder)", result.unixMilliseconds]
      ];
      renderFields($("#timestamp-fields"), fields);
      $("#timestamp-summary").textContent = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
      showResults("timestamp-result");
      status("timestamp-status", "Tidsstämpeln har konverterats.");
    });
  });
}

if ($('[data-tool="uuid"]')) {
  $("#uuid-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#uuid-result").hidden = true;
    runSafely("uuid-status", () => {
      const result = generateUuids(Number(getValue("uuid-count")));
      $("#uuid-output").value = result.join("\n");
      showResults("uuid-result");
      status("uuid-status", `${result.length} UUID v4 genererade.`);
    });
  });
}

if ($('[data-tool="password"]')) {
  const output = $("#password-output"), toggle = $("#password-show");
  $("#password-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#password-result").hidden = true;
    runSafely("password-status", () => {
      output.value = generatePassword({
        length: Number(getValue("password-length")),
        lower: $("#password-lower").checked,
        upper: $("#password-upper").checked,
        digits: $("#password-digits").checked,
        symbols: $("#password-symbols").checked,
        avoidSimilar: $("#password-avoid").checked
      });
      output.type = "password";
      toggle.textContent = "Visa";
      toggle.setAttribute("aria-pressed", "false");
      showResults("password-result");
      status("password-status", "Lösenord genererat med Web Crypto API.");
    });
  });
  toggle.addEventListener("click", () => {
    const reveal = output.type === "password";
    output.type = reveal ? "text" : "password";
    toggle.textContent = reveal ? "Dölj" : "Visa";
    toggle.setAttribute("aria-pressed", String(reveal));
  });
}
