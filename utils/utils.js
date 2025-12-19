export async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}: ${res.status}`);
  return res.json();
}

export function normalizeText(s = "") {
  return s.toLowerCase().trim();
}

export function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function formatDate(dateStr) {
  if (!dateStr) return "Chưa cập nhật";
  return dateStr;
}
