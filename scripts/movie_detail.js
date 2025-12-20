document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. KHỞI TẠO BIẾN & CẤU HÌNH ---
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') ? Number(params.get('id')) : null;
    
    const moviesPath = 'data/movies.json';
    const actorsPath = 'data/actors.json';
    const DEFAULT_PLACEHOLDER = 'https://placehold.co/1920x1080/1e1e1e/ffffff?text=No+Image';
    const HISTORY_KEY = 'watch_history_v1';
    const FAVORITE_KEY = 'my_favorite_movies';

    // Helper: Lấy element theo ID nhanh
    const $ = (id) => document.getElementById(id);

    // --- 2. CÁC HÀM HỖ TRỢ (HELPERS) ---
    function formatDate(iso) {
        try {
            const d = new Date(iso);
            if (isNaN(d)) return iso;
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch (e) { return iso; }
    }

    function isValidUrl(url) {
        return url && typeof url === 'string' && url.trim().length > 0 && !url.includes('placehold.co');
    }

    function addToWatchHistory(movie) {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            let history = raw ? JSON.parse(raw) : [];
            const item = {
                id: movie.id,
                title: movie.title || 'Không có tiêu đề',
                poster_url: movie.poster_url || null,
                landscape_poster_url: movie.landscape_poster_url || null,
                watched_at: Date.now(),
            };
            // Xóa cái cũ nếu đã tồn tại để đưa lên đầu
            history = history.filter((x) => x && x.id !== item.id);
            history.unshift(item);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
        } catch (e) { console.warn('Không thể lưu lịch sử xem:', e); }
    }

    // --- 3. LOGIC CHÍNH ---
    try {
        // A. Tải dữ liệu phim
        const resMovies = await fetch(moviesPath);
        if (!resMovies.ok) throw new Error('Không thể tải movies.json');
        const movies = await resMovies.json();

        // B. Tìm phim hiện tại
        let movie = idParam ? movies.find(m => m.id === idParam) : movies[0];
        if (!movie) {
            const container = document.querySelector('.main-container');
            if (container) container.innerHTML = '<div class="text-white text-center p-10">Không tìm thấy phim.</div>';
            return;
        }

        // C. Lưu lịch sử & Cập nhật Meta
        addToWatchHistory(movie);
        document.title = `Chi tiết - ${movie.title}`;
        window.currentMovieId = movie.id; // Dùng cho logic Yêu thích

        // D. Hiển thị Banner & Poster
        const bannerUrl = isValidUrl(movie.landscape_poster_url) ? movie.landscape_poster_url : (isValidUrl(movie.poster_url) ? movie.poster_url : DEFAULT_PLACEHOLDER);
        if ($('banner-bg')) $('banner-bg').style.backgroundImage = `url('${bannerUrl}')`;

        const posterImg = $('poster-img');
        if (posterImg) {
            posterImg.src = isValidUrl(movie.poster_url) ? movie.poster_url : DEFAULT_PLACEHOLDER;
            posterImg.onerror = () => posterImg.src = DEFAULT_PLACEHOLDER;
        }

        // E. Điền thông tin chi tiết
        if ($('movie-title')) $('movie-title').textContent = movie.title || 'Đang cập nhật';
        if ($('age-badge')) $('age-badge').textContent = movie.details?.age_rating || '—';
        if ($('duration')) $('duration').textContent = movie.details?.duration_minutes ? `${movie.details.duration_minutes} phút` : '—';
        if ($('release-date')) $('release-date').textContent = movie.release_date ? formatDate(movie.release_date) : '—';
        if ($('director')) $('director').textContent = movie.credits?.director || '—';
        if ($('country')) $('country').textContent = movie.details?.country || '—';
        if ($('producer')) $('producer').textContent = movie.details?.producer || '—';
        if ($('genres')) $('genres').textContent = Array.isArray(movie.genres) ? movie.genres.join(', ') : '—';
        if ($('vote-average')) $('vote-average').textContent = movie.vote_average || '0';
        if ($('synopsis')) $('synopsis').innerHTML = movie.description ? `<p>${movie.description}</p>` : '<p class="text-gray-500">Nội dung đang cập nhật.</p>';

        // F. Xử lý Diễn viên (Tải từ actors.json kết hợp fallback)
        const actorList = $('actor-list');
        if (actorList) {
            actorList.innerHTML = '<p class="text-gray-500 italic pl-2">Đang tải diễn viên...</p>';
            try {
                const resActors = await fetch(actorsPath);
                const allActors = await resActors.json();
                const castMembers = allActors.filter(actor => actor.movies && actor.movies.includes(movie.id));

                actorList.innerHTML = ''; // Xóa loading

                if (castMembers.length > 0) {
                    castMembers.forEach(actor => {
                        const avatar = isValidUrl(actor.avatar_url) ? actor.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random&color=fff`;
                        actorList.innerHTML += `
                            <div class="flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer mb-2">
                                <img src="${avatar}" alt="${actor.name}" class="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0">
                                <div>
                                    <h4 class="font-bold text-sm text-white">${actor.name}</h4>
                                    <p class="text-xs text-gray-500">${actor.nationality || 'Diễn viên'}</p>
                                </div>
                            </div>`;
                    });
                } else {
                    // Fallback: Lấy tên từ credits.cast của phim nếu ko tìm thấy trong actors.json
                    const simpleCast = movie.credits?.cast || [];
                    if (simpleCast.length === 0) {
                        actorList.innerHTML = '<p class="text-gray-500 italic pl-2">Chưa có thông tin.</p>';
                    } else {
                        simpleCast.forEach(name => {
                            actorList.innerHTML += `
                                <div class="flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5 mb-2 opacity-70">
                                    <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border border-white/10 shrink-0 text-xs font-bold text-white">
                                        ${name.charAt(0)}
                                    </div>
                                    <h4 class="font-bold text-sm text-white">${name}</h4>
                                </div>`;
                        });
                    }
                }
            } catch (e) {
                actorList.innerHTML = '<p class="text-gray-400 italic">Không thể tải danh sách diễn viên chi tiết.</p>';
            }
        }

        // G. Gán sự kiện cho các nút bấm
        if ($('btn-watch')) $('btn-watch').onclick = () => window.location.href = `watch.html?id=${movie.id}`;
        if ($('play-btn')) $('play-btn').onclick = () => {
            if (movie.trailer_url) window.open(movie.trailer_url, '_blank');
            else alert('Trailer chưa cập nhật');
        };

        // H. Cập nhật trạng thái Yêu thích ban đầu
        updateFavoriteUI(movie.id);

    } catch (err) {
        console.error('Lỗi khi tải chi tiết phim:', err);
    }
});

// --- 4. LOGIC YÊU THÍCH (FAVORITES) ---
function updateFavoriteUI(movieId) {
    const FAVORITE_KEY = 'my_favorite_movies';
    const favorites = JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
    const icon = document.getElementById('icon-heart-detail');
    
    if (!icon) return;

    if (favorites.includes(movieId)) {
        icon.classList.remove('text-white/50');
        icon.classList.add('text-red-500');
    } else {
        icon.classList.add('text-white/50');
        icon.classList.remove('text-red-500');
    }
}

function toggleFavoriteDetail() {
    const FAVORITE_KEY = 'my_favorite_movies';
    const movieId = window.currentMovieId;
    if (!movieId) return;

    let favorites = JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
    const icon = document.getElementById('icon-heart-detail');

    if (favorites.includes(movieId)) {
        favorites = favorites.filter(id => id !== movieId);
    } else {
        favorites.push(movieId);
    }
    
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
    updateFavoriteUI(movieId);
}