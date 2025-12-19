document.addEventListener("DOMContentLoaded", () => {
  const KEY = "watch_history_v1";
  const listEl = document.getElementById("history-list");
  const emptyEl = document.getElementById("history-empty");
  const countEl = document.getElementById("history-count");
  const searchEl = document.getElementById("history-search");
  const clearBtn = document.getElementById("btn-clear");

  const DEFAULT_THUMB = "https://placehold.co/640x360/1e1e1e/ffffff?text=No+Image";

  function safeText(v) {
    return (v ?? "").toString();
  }

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      if (isNaN(d)) return "";
      // ví dụ: 20/12/2025, 03:37
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
    } catch {
      return "";
    }
  }

  function getHistory() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function setHistory(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function render(items) {
    listEl.innerHTML = "";

    countEl.textContent = String(items.length);

    if (!items.length) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    for (const it of items) {
      const id = it?.id;
      const title = safeText(it?.title) || "Không có tiêu đề";
      const thumb =
        (it?.landscape_poster_url && safeText(it.landscape_poster_url).trim()) ||
        (it?.poster_url && safeText(it.poster_url).trim()) ||
        DEFAULT_THUMB;

      const vote = (it?.vote_average ?? "") !== "" ? `⭐ ${it.vote_average}` : "";
      const release = it?.release_date ? `Ra mắt: ${it.release_date}` : "";
      const watched = it?.watched_at ? `Xem: ${formatTime(it.watched_at)}` : "";

      const row = [vote, release, watched].filter(Boolean);

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="thumb">
          <img src="${thumb}" alt="${title}">
        </div>
        <div class="info">
          <h3 class="name">${title}</h3>
          <div class="row">
            ${row.map((x, idx) => `<span>${idx ? `<span class="dot"></span>` : ""}${x}</span>`).join("")}
          </div>
        </div>
      `;

      div.addEventListener("click", () => {
        if (id != null) window.location.href = `movie_detail.html?id=${id}`;
      });

      // nếu ảnh lỗi → fallback
      const img = div.querySelector("img");
      img.onerror = () => { img.src = DEFAULT_THUMB; };

      listEl.appendChild(div);
    }
  }

  function applyFilter() {
    const q = safeText(searchEl.value).trim().toLowerCase();
    const all = getHistory();
    if (!q) return render(all);

    const filtered = all.filter(it => safeText(it?.title).toLowerCase().includes(q));
    render(filtered);
  }

  // init
  render(getHistory());

  // search
  searchEl.addEventListener("input", applyFilter);

  // clear
  clearBtn.addEventListener("click", () => {
    const ok = confirm("Xóa toàn bộ lịch sử xem?");
    if (!ok) return;
    setHistory([]);
    render([]);
  });
});
