/**
 * Smoke test: parse [SHAPE] WBS.xlsx and print summary.
 * Usage: node scripts/smoke-wbs-import.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const file = path.join(root, "[SHAPE] WBS.xlsx");

function excelSerialToYmd(serial) {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  const d = new Date(utc);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeWbs(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^\d+(\.\d+)*$/.test(s)) {
    return s
      .split(".")
      .map((part, idx, arr) => {
        if (arr.length === 2 && idx === 1 && part === "0") return null;
        return part.replace(/^0+(?=\d)/, "") || "0";
      })
      .filter((p) => p != null)
      .join(".");
  }
  return s;
}

const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: "buffer", cellDates: false });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

let count = 0;
const samples = [];
for (let r = 12; r < rows.length; r++) {
  const row = rows[r] || [];
  const wbs = normalizeWbs(row[1]);
  const title = row[2] != null ? String(row[2]).trim() : "";
  const start = typeof row[5] === "number" ? excelSerialToYmd(row[5]) : null;
  const end = typeof row[6] === "number" ? excelSerialToYmd(row[6]) : null;
  if (!start || !end) continue;
  count++;
  if (samples.length < 3) samples.push({ wbs, title, start, end });
}

console.log(
  JSON.stringify(
    {
      file: path.basename(file),
      milestoneRowsWithDates: count,
      samples,
      ok: count >= 30,
    },
    null,
    2
  )
);

if (count < 30) {
  process.exit(1);
}
