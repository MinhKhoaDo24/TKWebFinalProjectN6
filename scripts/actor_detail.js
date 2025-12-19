import {fetchJSON, escapeHTML, getQueryParam, formatDate} from "/utils/utils.js"

function renderActor(actor) {
  const hero = document.getElementById("actor-hero");

  const avatar =
    actor.avatar_url ||
    `https://placehold.co/400x600/111/FFF?text=${encodeURIComponent(actor.name || "Actor")}`;

  const bio = actor.biography?.trim()
    ? actor.biography.trim()
    : "Chưa có mô tả tiểu sử.";

  hero.innerHTML = `
    <div class="md:col-span-4">
      <div class="rounded-3xl overflow-hidden border border-white/5 bg-bgCard shadow-lg">
        <div class="aspect-[2/3]">
          <img
            src="${escapeHTML(avatar)}"
            alt="${escapeHTML(actor.name)}"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

    <div class="md:col-span-8">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold">${escapeHTML(actor.name)}</h1>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/5 text-gray-200">
              Quốc tịch: <b class="text-white">${escapeHTML(actor.nationality || "Chưa cập nhật")}</b>
            </span>
            <span class="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/5 text-gray-200">
              Ngày sinh: <b class="text-white">${escapeHTML(formatDate(actor.birth_date))}</b>
            </span>
          </div>
        </div>

        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-brand font-semibold shadow-lg">
          <i class="fa-solid fa-user"></i>
          Diễn viên
        </span>
      </div>

      <div class="mt-6">
        <h3 class="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-400">Tiểu sử</h3>
        <p class="text-gray-200 leading-relaxed mt-3">
          ${escapeHTML(bio)}
        </p>
      </div>
    </div>
  `;
}

function renderMovies(movies) {
  const wrap = document.getElementById("actor-movies");
  const count = document.getElementById("movie-count");
  count.textContent = movies.length;

  if (movies.length === 0) {
    wrap.innerHTML = `<div class="text-gray-400">Chưa có phim liên kết.</div>`;
    return;
  }

  wrap.innerHTML = movies
    .map((m) => {
      const poster =
        m.poster_url ||
        `https://placehold.co/600x900/111/FFF?text=${encodeURIComponent(m.title || "Movie")}`;

      return `
        <a
          href="movie_detail.html?id=${encodeURIComponent(m.id)}"
          class="group block rounded-2xl overflow-hidden bg-bgCard border border-white/5 hover:border-white/10 transition shadow-lg"
          title="${escapeHTML(m.title)}"
        >
          <div class="relative aspect-[2/3] overflow-hidden">
            <img
              src="${escapeHTML(poster)}"
              alt="${escapeHTML(m.title)}"
              class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <div class="font-semibold leading-snug line-clamp-2">${escapeHTML(m.title)}</div>
              <div class="text-xs text-gray-300 mt-1">
                ${(m.release_date || "").slice(0, 4) || "N/A"} • ${escapeHTML(m.status || "")}
              </div>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

(async function main() {
  try {
    const slug = getQueryParam("slug");
    if (!slug) throw new Error("Missing slug");

    const [actors, movies] = await Promise.all([
      fetchJSON("data/actors.json"),
      fetchJSON("data/movies.json"),
    ]);

    const actor = actors.find((a) => a.slug === slug);
    if (!actor) throw new Error("Actor not found");

    renderActor(actor);

    const actorMovieIds = new Set(actor.movies || []);
    const actorMovies = movies.filter((m) => actorMovieIds.has(m.id));
    renderMovies(actorMovies);
  } catch (err) {
    console.error(err);
    document.getElementById("actor-hero").innerHTML =
      `<div class="text-red-400">Không tải được chi tiết diễn viên. Kiểm tra URL ?slug=... và dữ liệu JSON.</div>`;
    document.getElementById("actor-movies").innerHTML = "";
  }
})();
