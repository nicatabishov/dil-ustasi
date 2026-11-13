// Dil Ustası — yapay zekâ ucu (Val Town HTTP). Sohbet partneri, yazı düzeltme, kelime açıklama.
// POST { op: "chat" | "write" | "word" | "ping", ... }  ·  başlık: x-code = erişim kodu
import { OpenAI } from "https://esm.town/v/std/openai";
import { blob } from "https://esm.town/v/std/blob";

const MODEL = process.env.AI_MODEL || "gpt-5.6-luna";
const CODE = process.env.AI_CODE || "";
const DAILY_CAP = Number(process.env.DAILY_CAP || 80); // hesabın günlük ücretsiz kotasını korur
const LANG = { en: "English", ka: "Georgian" };
const LV = { 1: "A1 (beginner)", 2: "A2 (elementary)", 3: "B1 (intermediate)", 4: "B2 (upper-intermediate)" };
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-code",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json; charset=utf-8" } });
const str = (v, max) => String(v ?? "").slice(0, max);
const openai = new OpenAI();

async function ai(system, messages, maxTokens = 700) {
  const r = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: system }, ...messages],
    max_completion_tokens: maxTokens * 4, // düşünen modellerde sınır düşünmeyi de kapsar
    response_format: { type: "json_object" },
  });
  const text = (r.choices?.[0]?.message?.content || "").replace(/^```(?:json)?|```$/g, "").trim();
  return JSON.parse(text);
}

async function underCap() {
  const key = "dilustasi_count_" + new Date().toISOString().slice(0, 10);
  let n = 0;
  try { n = Number(await blob.getJSON(key)) || 0; } catch (_) {}
  if (n >= DAILY_CAP) return false;
  try { await blob.setJSON(key, n + 1); } catch (_) {}
  return true;
}

export default async function (req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { error: "POST gerekli" });
  if (!CODE || req.headers.get("x-code") !== CODE) return json(401, { error: "kod" });
  let b;
  try { b = await req.json(); } catch (_) { return json(400, { error: "geçersiz istek" }); }
  if (b.op === "ping") return json(200, { ok: true });
  const lang = LANG[b.lang] ? b.lang : "en", L = LANG[lang], lv = LV[b.level] || LV[1];
  if (!(await underCap())) return json(429, { error: "limit" });

  try {
    if (b.op === "chat") {
      const history = (Array.isArray(b.history) ? b.history : []).slice(-14)
        .map((m) => ({ role: m.r === "a" ? "assistant" : "user", content: str(m.t, 600) }));
      const system = `You are a friendly conversation partner for a Turkish speaker who is learning ${L}. Their level is CEFR ${lv}.
Scenario: ${str(b.scenario, 300) || "free small talk"}. Stay in your role in this scenario.
Rules:
- "reply": your next line, ONLY in ${L}${lang === "ka" ? " (Georgian script)" : ""}, 1-2 short sentences using vocabulary and grammar suitable for ${lv}. Always end with a simple question or prompt so the conversation continues.
- "tr": natural Turkish translation of "reply".
- Look at the learner's LAST message. If it contains a grammar, word-choice or spelling mistake, or is not in ${L}, put the corrected ${L} sentence in "fix" and a short explanation in TURKISH in "note" (one or two sentences, name the rule). If it is fine, set "fix" and "note" to "". Ignore capitalization and missing final punctuation.
- If there is no learner message yet, start the scene with a greeting and set "fix" and "note" to "".
Return JSON: {"reply": "...", "tr": "...", "fix": "...", "note": "..."}`;
      const out = await ai(system, history.length ? history : [{ role: "user", content: "(start the conversation)" }], 400);
      return json(200, { reply: str(out.reply, 800), tr: str(out.tr, 800), fix: str(out.fix, 600), note: str(out.note, 600) });
    }
    if (b.op === "write") {
      const system = `You are a ${L} writing teacher for a Turkish speaker at CEFR ${lv}. The learner wrote a short text for this task: "${str(b.prompt, 300)}".
Return JSON:
{"score": integer 0-100 for accuracy and clarity relative to ${lv},
 "corrected": "the learner's text with only the mistakes fixed, in ${L}",
 "natural": "a more natural version a native speaker might write, at most one level above ${lv}, in ${L}",
 "errors": [{"wrong": "the wrong fragment", "right": "the correction", "why": "short explanation in TURKISH naming the rule"}] (max 6, most important first; empty if none),
 "praise": "one encouraging sentence in TURKISH about what they did well",
 "tip": "one concrete suggestion in TURKISH on what to practise next"}
If the text is not in ${L} at all, set score to 0 and explain in "tip" (Turkish).`;
      const out = await ai(system, [{ role: "user", content: str(b.text, 1500) }], 900);
      return json(200, {
        score: Math.max(0, Math.min(100, Math.round(Number(out.score) || 0))),
        corrected: str(out.corrected, 2000), natural: str(out.natural, 2000),
        errors: (Array.isArray(out.errors) ? out.errors : []).slice(0, 6).map((e) => ({ wrong: str(e.wrong, 200), right: str(e.right, 200), why: str(e.why, 300) })),
        praise: str(out.praise, 300), tip: str(out.tip, 300),
      });
    }
    if (b.op === "word") {
      const system = `You explain ${L} words to a Turkish speaker at CEFR ${lv}. Given a word${b.sentence ? " and the sentence it appears in" : ""}, return JSON:
{"base": "dictionary form of the word in ${L}", "tr": "Turkish meaning in this context (1-4 words)", "pos": "isim|fiil|sıfat|zarf|edat|bağlaç|zamir|ifade",
 "ex": "one short, simple example sentence in ${L} using the word", "exTr": "Turkish translation of the example"}`;
      const out = await ai(system, [{ role: "user", content: `Word: ${str(b.word, 60)}${b.sentence ? `\nSentence: ${str(b.sentence, 400)}` : ""}` }], 300);
      return json(200, { base: str(out.base, 80), tr: str(out.tr, 120), pos: str(out.pos, 20), ex: str(out.ex, 300), exTr: str(out.exTr, 300) });
    }
    return json(400, { error: "bilinmeyen işlem" });
  } catch (e) {
    console.error("ai", e.status, String(e.message || e).slice(0, 300));
    return json(e.status === 429 ? 429 : 502, { error: e.status === 429 ? "limit" : "ai" });
  }
}
