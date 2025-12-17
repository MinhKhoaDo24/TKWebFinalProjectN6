async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}: ${res.status}`);
  return res.json();
}

function normalizeText(s = "") {
  return s.toLowerCase().trim();
}

function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const PAGE_SIZE = 18;

let allActors = [];
let filteredActors = [];
let currentPage = 1;

function renderActors(list) {
  const grid = document.getElementById("actors-grid");

  grid.innerHTML = list
    .map((a) => {
      const avatar =
        a.avatar_url ||
        `https://placehold.co/400x600/111/FFF?text=${encodeURIComponent(
          a.name || "Actor"
        )}`;

      return `
        <a
          href="actor_detail.html?slug=${encodeURIComponent(a.slug)}"
          class="group block rounded-2xl overflow-hidden bg-bgCard border border-white/5 hover:border-white/10 transition shadow-lg"
          title="${escapeHTML(a.name)}"
        >
          <div class="relative aspect-[2/3] overflow-hidden">
            <img
              src="${escapeHTML(avatar)}"
              alt="${escapeHTML(a.name)}"
              class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <div class="font-semibold leading-snug line-clamp-2">${escapeHTML(a.name)}</div>
              <div class="text-xs text-gray-300 mt-1">
                ${(a.movies?.length || 0)} phim
              </div>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderPagination(totalItems, page, pageSize) {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // clamp
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  currentPage = page;

  const makeBtn = (label, disabled, onClick, active = false) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.disabled = disabled;

    btn.className =
      "px-3 py-2 rounded-xl text-sm border border-white/10 bg-bgCard hover:border-white/20 " +
      "disabled:opacity-40 disabled:cursor-not-allowed transition " +
      (active ? "border-primary/60 ring-1 ring-primary/30" : "");

    btn.addEventListener("click", onClick);
    return btn;
  };

  pagination.innerHTML = "";

  pagination.appendChild(
    makeBtn("Trước", page === 1, () => updateView(page - 1))
  );

  // Hiển thị số trang gọn: ví dụ 1 ... 4 5 6 ... 10
  const windowSize = 2; // 2 trang trước/sau
  const total = totalPages;

  const pages = [];
  const push = (p) => pages.push(p);

  push(1);
  for (let p = page - windowSize; p <= page + windowSize; p++) {
    if (p > 1 && p < total) push(p);
  }
  if (total > 1) push(total);

  const unique = [...new Set(pages)].sort((a, b) => a - b);

  const finalPages = [];
  for (let i = 0; i < unique.length; i++) {
    finalPages.push(unique[i]);
    if (i < unique.length - 1 && unique[i + 1] - unique[i] > 1) {
      finalPages.push("…");
    }
  }

  finalPages.forEach((p) => {
    if (p === "…") {
      const span = document.createElement("span");
      span.textContent = "…";
      span.className = "px-2 text-gray-400";
      pagination.appendChild(span);
      return;
    }

    pagination.appendChild(
      makeBtn(String(p), false, () => updateView(p), p === page)
    );
  });

  pagination.appendChild(
    makeBtn("Sau", page === totalPages, () => updateView(page + 1))
  );
}
/**
 * Tính toán để hiển thị các diễn viên
 * ở trang i thì 
 * bắt đầu từ (i-1) * số diễn viên + 1 hiển thị trong 1 trang
 * kết thúc là i số diễn viên
 * 
 */
function updateRange(totalItems, page, pageSize) {
  const count = document.getElementById("actor-count");
  const range = document.getElementById("actor-range");
  count.textContent = totalItems;

  if (totalItems === 0) {
    range.textContent = "0–0";
    return;
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  range.textContent = `${start}–${end}`;
}

function updateView(page = 1) {
  const total = filteredActors.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const safePage = Math.min(Math.max(1, page), totalPages);
  currentPage = safePage;

  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageItems = filteredActors.slice(startIdx, startIdx + PAGE_SIZE);

  renderActors(pageItems);
  renderPagination(total, safePage, PAGE_SIZE);
  updateRange(total, safePage, PAGE_SIZE); 
}

(async function main() {
  try {
    allActors = await fetchJSON("data/actors.json");
    filteredActors = allActors;

    const input = document.getElementById("actor-search");

    updateView(1);

    input.addEventListener("input", () => {
      const q = normalizeText(input.value);
      filteredActors = allActors.filter((a) =>
        normalizeText(a.name).includes(q)
      );
      updateView(1);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("actors-grid").innerHTML =
      `<div class="text-red-400">Lỗi tải dữ liệu diễn viên. Kiểm tra đường dẫn data/actors.json</div>`;
  }
})();
