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
      emptyEl.classList.remove("hidden");
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    // Sử dụng CSS Grid cho danh sách giống trang yêu thích
    listEl.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6";

    items.forEach((it, index) => {
      const id = it?.id;
      const title = safeText(it?.title) || "Không có tiêu đề";
      const thumb = (it?.poster_url && safeText(it.poster_url).trim()) || DEFAULT_THUMB;
      const vote = it?.vote_average || "0";
      const genre = it?.genres ? it.genres[0] : "Phim";
      const watchedAt = it?.watched_at ? formatTime(it.watched_at) : "";

      const card = document.createElement("div");
      card.className = "relative group/card history-item-card";
      card.innerHTML = `
          <div class="block cursor-pointer">
              <div class="thumb-2-3 bg-gray-800 mb-3 relative border border-white/5 shadow-lg group">
                  <img src="${thumb}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                  
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20" onclick="window.location.href='movie_detail.html?id=${id}'">
                      <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                          <i class="fa-solid fa-play text-white text-sm ml-1"></i>
                      </div>
                  </div>

                  <button class="remove-quick-btn hover:bg-red-600 text-white shadow-lg" title="Xóa khỏi lịch sử" data-id="${id}">
                      <i class="fa-solid fa-xmark text-xs"></i>
                  </button>
                  
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-primary/80 backdrop-blur-md rounded text-[10px] font-bold text-white shadow-lg">HD</div>
              </div>

              <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition mb-1" title="${title}">${title}</h4>
              <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center text-[11px] text-gray-500">
                      <p class="text-xs text-gray-500">${genre}</p>
                      
                  </div>
                  <span class="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold">
                    <i class="fa-solid fa-star mr-0.5"></i>${vote}
                  </span>
              </div>
          </div>
      `;

      // Xử lý sự kiện xóa từng mục
      const delBtn = card.querySelector(".remove-quick-btn");
      delBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const all = getHistory();
          const updated = all.filter(item => item.id !== id);
          setHistory(updated);
          render(updated);
      });

      // Click vào tên hoặc ảnh để xem chi tiết
      card.querySelector("h4").addEventListener("click", () => {
          window.location.href = `movie_detail.html?id=${id}`;
      });

      listEl.appendChild(card);
    });
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
