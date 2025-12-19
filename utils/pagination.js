/* Tính toán để hiển thị các diễn viên 
 * ở trang i thì 
 * bắt đầu từ (i-1) * số diễn viên + 1 hiển thị trong 1 trang 
 * kết thúc là i * số diễn viên  
 */

export function createPaginator({
  pageSize = 18,
  getItems,                 
  renderPageItems,          
  paginationElId = "pagination",
  countElId = "actor-count",
  rangeElId = "actor-range",
  prevLabel = "Trước",
  nextLabel = "Sau",
  windowSize = 2,
}) {
  let currentPage = 1;

  function updateRange(totalItems, page, size) {
    const count = document.getElementById(countElId);
    const range = document.getElementById(rangeElId);
    if (count) count.textContent = totalItems;

    if (!range) return;

    if (totalItems === 0) {
      range.textContent = "0–0";
      return;
    }
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, totalItems);
    range.textContent = `${start}–${end}`;
  }

  function renderPagination(totalItems, page, size) {
    const pagination = document.getElementById(paginationElId);
    if (!pagination) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / size));

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
      makeBtn(prevLabel, page === 1, () => updateView(page - 1))
    );

    // 1 ... (page-2 page-1 page page+1 page+2) ... total
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
      makeBtn(nextLabel, page === totalPages, () => updateView(page + 1))
    );
  }

  function updateView(page = 1) {
    const items = getItems() || [];
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const safePage = Math.min(Math.max(1, page), totalPages);
    currentPage = safePage;

    const startIdx = (safePage - 1) * pageSize;
    const pageItems = items.slice(startIdx, startIdx + pageSize);

    renderPageItems(pageItems);
    renderPagination(total, safePage, pageSize);
    updateRange(total, safePage, pageSize);
  }

  return {
    updateView,
    getCurrentPage: () => currentPage,
    setPage: (p) => updateView(p),
  };
}
