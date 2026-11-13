// Dil Ustası'nın yapay zekâ ucunu Val Town'a yükler: `node deploy-val.mjs`
// Val Town anahtarı ../nicat-liana/.secrets içinden okunur; bu projenin kendi değerleri .secrets'ta (git'e girmez).
import fs from "node:fs";
import crypto from "node:crypto";

const ROOT = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SECRETS = `${ROOT}.secrets`;
const parse = (p) => fs.existsSync(p) ? Object.fromEntries(fs.readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.includes("="))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })) : {};
const addSecret = (k, v) => fs.appendFileSync(SECRETS, `${k}=${v}\n`);
const TOKEN = parse(`${ROOT}../nicat-liana/.secrets`).VALTOWN_TOKEN;
if (!TOKEN) throw new Error("VALTOWN_TOKEN bulunamadı");
let S = parse(SECRETS);
if (!S.AI_CODE) { addSecret("AI_CODE", crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6)); S = parse(SECRETS); }

const API = "https://api.val.town";
const H = { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" };
async function call(method, path, body) {
  const r = await fetch(API + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}

let valId = S.VAL_ID;
if (!valId) {
  const v = await call("POST", "/v2/vals", { name: "dilustasi", privacy: "public", description: "Dil Ustası — dil öğrenme uygulamasının yapay zekâ ucu" });
  valId = v.id; addSecret("VAL_ID", valId); S = parse(SECRETS);
  console.log("val oluşturuldu");
}
const existing = new Set(((await call("GET", `/v2/vals/${valId}/files?path=&recursive=true&limit=100`)).data || []).map((f) => f.path));
const meta = await call(existing.has("main.ts") ? "PUT" : "POST", `/v2/vals/${valId}/files?path=main.ts`, { content: fs.readFileSync(`${ROOT}valtown/main.mjs`, "utf8"), type: "http" });
const endpoint = meta?.links?.endpoint;
if (endpoint && S.APP_URL !== endpoint) { addSecret("APP_URL", endpoint); S = parse(SECRETS); }

const have = new Set(((await call("GET", `/v2/vals/${valId}/environment_variables/`)).data || []).map((e) => e.key));
for (const key of ["AI_CODE"]) {
  if (have.has(key)) await call("PUT", `/v2/vals/${valId}/environment_variables/${key}`, { value: S[key] });
  else await call("POST", `/v2/vals/${valId}/environment_variables/`, { key, value: S[key] });
}
console.log("adres:", endpoint || S.APP_URL);
