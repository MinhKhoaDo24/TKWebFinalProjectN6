document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') ? Number(params.get('id')) : null;
    const dataPath = 'data/movies.json';

    // Ảnh mặc định khi không tìm thấy dữ liệu ảnh nào
    const DEFAULT_PLACEHOLDER = 'https://placehold.co/1920x1080/1e1e1e/ffffff?text=Dang+cap+nhat+hinh+anh';

    function formatDate(iso) {
        try {
            const d = new Date(iso);
            if (isNaN(d)) return iso;
            return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        } catch (e) { return iso; }
    }

    // Hàm kiểm tra URL ảnh có hợp lệ không
    function isValidUrl(url) {
        return url && typeof url === 'string' && url.trim().length > 0 && !url.includes('placehold.co');
    }

    try {
        const res = await fetch(dataPath);
        if (!res.ok) throw new Error('Failed to fetch movies.json');
        const movies = await res.json();

        // Tìm phim theo ID
        let movie = null;
        if (idParam) movie = movies.find(m => m.id === idParam);
        
        // Fallback: Nếu không có ID hoặc không tìm thấy, dùng phim đầu tiên
        if (!movie && movies.length > 0) movie = movies[0];

        if (!movie) {
            document.querySelector('.main-container').innerHTML = '<div style="color:white; text-align:center; padding:50px; font-size: 1.5rem;">Không tìm thấy dữ liệu phim.</div>';
            return;
        }

        document.title = `Chi tiết phim - ${movie.title}`;

        // --- XỬ LÝ HÌNH ẢNH (SỬA LỖI ĐEN MÀN HÌNH) ---
        
        // 1. Xử lý Banner (Ưu tiên ảnh ngang -> ảnh dọc -> ảnh mặc định)
        let bannerUrl = DEFAULT_PLACEHOLDER;
        if (isValidUrl(movie.landscape_poster_url)) {
            bannerUrl = movie.landscape_poster_url;
        } else if (isValidUrl(movie.poster_url)) {
            bannerUrl = movie.poster_url;
        }
        document.getElementById('banner-bg').style.backgroundImage = `url('${bannerUrl}')`;

        // 2. Xử lý Poster (Ưu tiên ảnh dọc -> ảnh mặc định)
        const posterImg = document.getElementById('poster-img');
        let posterUrl = DEFAULT_PLACEHOLDER;
        if (isValidUrl(movie.poster_url)) {
            posterUrl = movie.poster_url;
        }
        posterImg.src = posterUrl;
        // Thêm sự kiện: nếu ảnh load lỗi thì thay bằng ảnh mặc định
        posterImg.onerror = function() {
            this.src = DEFAULT_PLACEHOLDER;
        };


        // --- ĐIỀN THÔNG TIN CƠ BẢN ---
        document.getElementById('movie-title').textContent = movie.title || 'Đang cập nhật';
        document.getElementById('age-badge').textContent = movie.details?.age_rating || '—';
        document.getElementById('duration').textContent = movie.details?.duration_minutes ? `${movie.details.duration_minutes} phút` : '—';
        document.getElementById('release-date').textContent = movie.release_date ? formatDate(movie.release_date) : '—';
        document.getElementById('director').textContent = movie.credits?.director || '—';
        document.getElementById('country').textContent = movie.details?.country || '—';
        document.getElementById('producer').textContent = movie.details?.producer || '—';
        document.getElementById('genres').textContent = Array.isArray(movie.genres) ? movie.genres.join(', ') : '—';
        document.getElementById('vote-average').textContent = movie.vote_average || '—';

        // Nội dung phim
        const synopsisEl = document.getElementById('synopsis');
        synopsisEl.innerHTML = movie.description ? `<p>${movie.description}</p>` : '<p class="text-gray-500">Nội dung đang cập nhật.</p>';

        // Diễn viên
        const actorList = document.getElementById('actor-list');
        actorList.innerHTML = '';
        const cast = movie.credits?.cast || [];
        if (cast.length === 0) {
            actorList.innerHTML = '<p class="text-gray-500 italic">Danh sách diễn viên đang cập nhật.</p>';
        } else {
            cast.forEach(name => {
                const card = document.createElement('div');
                card.className = 'actor-card flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5';
                // Ảnh placeholder cho diễn viên
                card.innerHTML = `
                    <img src="https://ui-avatars.com/api/?name=${name}&background=random&color=fff" alt="${name}" class="w-12 h-12 rounded-full object-cover">
                    <div class="actor-info"><h4 class="font-bold text-sm">${name}</h4></div>
                `;
                actorList.appendChild(card);
            });
        }

        // Logic nút Trailer (Trên banner)
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (movie.trailer_url) window.open(movie.trailer_url, '_blank');
                else alert('Trailer chưa cập nhật!');
            });
        }

        // Logic nút XEM NGAY -> Sang trang watch.html
        const watchBtn = document.getElementById('btn-watch');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                window.location.href = `watch.html?id=${movie.id}`;
            });
        }

    } catch (err) {
        console.error("Lỗi khi tải chi tiết phim:", err);
        document.querySelector('.main-container').innerHTML = '<div style="color:red; text-align:center; padding:50px;">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra Console.</div>';
    }
});