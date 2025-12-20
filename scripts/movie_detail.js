document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id') ? Number(params.get('id')) : null;
  const dataPath = 'data/movies.json';

  const DEFAULT_PLACEHOLDER =
    'https://placehold.co/1920x1080/1e1e1e/ffffff?text=Dang+cap+nhat+hinh+anh';

  // Lưu lịch sử xem (front-end) bằng localStorage
  function addToWatchHistory(movie) {
    try {
      const KEY = 'watch_history_v1';
      const raw = localStorage.getItem(KEY);
      const history = raw ? JSON.parse(raw) : [];

      const item = {
        id: movie.id,
        title: movie.title || 'Không có tiêu đề',
        poster_url: movie.poster_url && String(movie.poster_url).trim() ? movie.poster_url : null,
        landscape_poster_url:
          movie.landscape_poster_url && String(movie.landscape_poster_url).trim()
            ? movie.landscape_poster_url
            : null,
        release_date: movie.release_date || null,
        vote_average: movie.vote_average ?? null,
        watched_at: Date.now(),
      };

      const filtered = history.filter((x) => x && x.id !== item.id);
      filtered.unshift(item);

      localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 200)));
    } catch (e) {
      console.warn('Không thể lưu lịch sử xem:', e);
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}/${d.getFullYear()}`;
    } catch (e) {
      return iso;
    }
  }

  function isValidUrl(url) {
    return url && typeof url === 'string' && url.trim().length > 0;
  }

  // Helper: lấy element an toàn
  const $ = (id) => document.getElementById(id);

  try {
    const res = await fetch(dataPath);
    if (!res.ok) throw new Error('Failed to fetch movies.json');
    const movies = await res.json();

    // Tìm phim theo ID
    let movie = null;
    if (idParam) movie = movies.find((m) => m.id === idParam);

    // Fallback: Nếu không có ID hoặc không tìm thấy, dùng phim đầu tiên
    if (!movie && movies.length > 0) movie = movies[0];

    if (!movie) {
      const main = document.querySelector('.main-container');
      if (main) {
        main.innerHTML =
          '<div style="color:white; text-align:center; padding:50px; font-size: 1.5rem;">Không tìm thấy dữ liệu phim.</div>';
      }
      return;
    }

    // ✅ LƯU LỊCH SỬ ĐÚNG CHỖ
    addToWatchHistory(movie);

    document.title = `Chi tiết phim - ${movie.title || ''}`;

    // --- HÌNH ẢNH ---
    const banner = $('banner-bg');
    if (banner) {
      let bannerUrl = DEFAULT_PLACEHOLDER;
      if (isValidUrl(movie.landscape_poster_url)) bannerUrl = movie.landscape_poster_url;
      else if (isValidUrl(movie.poster_url)) bannerUrl = movie.poster_url;

      banner.style.backgroundImage = `url('${bannerUrl}')`;
    }

    const posterImg = $('poster-img');
    if (posterImg) {
      let posterUrl = DEFAULT_PLACEHOLDER;
      if (isValidUrl(movie.poster_url)) posterUrl = movie.poster_url;
      posterImg.src = posterUrl;
      posterImg.onerror = function () {
        this.src = DEFAULT_PLACEHOLDER;
      };
    }

    // --- THÔNG TIN ---
    if ($('movie-title')) $('movie-title').textContent = movie.title || 'Đang cập nhật';
    if ($('age-badge')) $('age-badge').textContent = movie.details?.age_rating || '—';
    if ($('duration'))
      $('duration').textContent = movie.details?.duration_minutes
        ? `${movie.details.duration_minutes} phút`
        : '—';
    if ($('release-date'))
      $('release-date').textContent = movie.release_date ? formatDate(movie.release_date) : '—';
    if ($('director')) $('director').textContent = movie.credits?.director || '—';
    if ($('country')) $('country').textContent = movie.details?.country || '—';
    if ($('producer')) $('producer').textContent = movie.details?.producer || '—';
    if ($('genres'))
      $('genres').textContent = Array.isArray(movie.genres) ? movie.genres.join(', ') : '—';
    if ($('vote-average')) $('vote-average').textContent = movie.vote_average ?? '—';

    const synopsisEl = $('synopsis');
    if (synopsisEl) {
      synopsisEl.innerHTML = movie.description
        ? `<p>${movie.description}</p>`
        : '<p class="text-gray-500">Nội dung đang cập nhật.</p>';
    }

    // --- DIỄN VIÊN ---
    const actorList = $('actor-list');
    if (actorList) {
      actorList.innerHTML = '';
      const cast = movie.credits?.cast || [];
      if (!cast.length) {
        actorList.innerHTML = '<p class="text-gray-500 italic">Danh sách diễn viên đang cập nhật.</p>';
      } else {
        cast.forEach((name) => {
          const card = document.createElement('div');
          card.className =
            'actor-card flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5';
          card.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=random&color=fff" alt="${name}" class="w-12 h-12 rounded-full object-cover">
            <div class="actor-info"><h4 class="font-bold text-sm">${name}</h4></div>
          `;
          actorList.appendChild(card);
        });
      }
    }

    // --- NÚT TRAILER ---
    const playBtn = $('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (movie.trailer_url) window.open(movie.trailer_url, '_blank');
        else alert('Trailer chưa cập nhật!');
      });
    }

    // --- NÚT XEM NGAY ---
    const watchBtn = $('btn-watch');
    if (watchBtn) {
      watchBtn.addEventListener('click', () => {
        window.location.href = `watch.html?id=${movie.id}`;
      });
    }
  } catch (err) {
    console.error('Lỗi khi tải chi tiết phim:', err);
    const main = document.querySelector('.main-container');
    if (main) {
      main.innerHTML =
        '<div style="color:red; text-align:center; padding:50px;">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra Console.</div>';
    }
  }
});
