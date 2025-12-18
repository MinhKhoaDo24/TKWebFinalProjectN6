document.addEventListener('DOMContentLoaded', async () => {
	const params = new URLSearchParams(window.location.search);
	const slugParam = params.get('slug');
	const idParam = params.get('id') ? Number(params.get('id')) : null;

	const dataPath = 'data/movies.json';

	function formatDate(iso) {
		try {
			const d = new Date(iso);
			if (isNaN(d)) return iso;
			return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
		} catch (e) {
			return iso;
		}
	}

	function safeText(text) {
		return text == null ? '—' : text;
	}

	try {
		const res = await fetch(dataPath);
		if (!res.ok) throw new Error('Failed to fetch movies.json');
		const movies = await res.json();

		let movie = null;
		if (idParam) movie = movies.find(m => m.id === idParam);
		if (!movie && slugParam) movie = movies.find(m => m.slug === slugParam || m.slug === decodeURIComponent(slugParam));
		if (!movie) movie = movies.find(m => m.slug === 'mua-do' || m.title === 'Mưa Đỏ') || movies[0];

		if (!movie) {
			document.body.innerHTML = '<p>Không tìm thấy dữ liệu phim.</p>';
			return;
		}

		// Banner and poster
		const bannerBg = document.getElementById('banner-bg');
		if (bannerBg && movie.landscape_poster_url) {
			bannerBg.style.backgroundImage = `url('${movie.landscape_poster_url}')`;
		}

		const posterImg = document.getElementById('poster-img');
		if (posterImg && movie.poster_url) posterImg.src = movie.poster_url;

		// Basic info
		const titleEl = document.getElementById('movie-title');
		if (titleEl) titleEl.textContent = movie.title || movie.original_title || '—';

		const ageBadge = document.getElementById('age-badge');
		if (ageBadge) ageBadge.textContent = (movie.details && movie.details.age_rating) ? movie.details.age_rating : '—';

		const durationEl = document.getElementById('duration');
		if (durationEl) {
			const mins = movie.details && movie.details.duration_minutes;
			durationEl.textContent = mins ? `${mins} phút` : '—';
		}

		const releaseEl = document.getElementById('release-date');
		if (releaseEl) releaseEl.textContent = movie.release_date ? formatDate(movie.release_date) : '—';

		const directorEl = document.getElementById('director');
		if (directorEl) directorEl.textContent = (movie.credits && movie.credits.director) ? movie.credits.director : '—';

		const countryEl = document.getElementById('country');
		if (countryEl) countryEl.textContent = movie.details && movie.details.country ? movie.details.country : '—';

		const producerEl = document.getElementById('producer');
		if (producerEl) producerEl.textContent = movie.details && movie.details.producer ? movie.details.producer : '—';

		const genresEl = document.getElementById('genres');
		if (genresEl) genresEl.textContent = Array.isArray(movie.genres) ? movie.genres.join(', ') : safeText(movie.genres);

		const voteAvgEl = document.getElementById('vote-average');
		if (voteAvgEl) voteAvgEl.textContent = (movie.vote_average != null) ? movie.vote_average : '—';

		// Synopsis
		const synopsisEl = document.getElementById('synopsis');
		if (synopsisEl) {
			if (movie.description) {
				// allow HTML minimal formatting
				synopsisEl.innerHTML = `<p>${movie.description}</p>`;
			} else {
				synopsisEl.textContent = 'Nội dung chưa có.';
			}
		}

		// Actors
		const actorList = document.getElementById('actor-list');
		if (actorList) {
			actorList.innerHTML = '';
			const cast = movie.credits && movie.credits.cast ? movie.credits.cast : [];
			if (cast.length === 0) {
				actorList.innerHTML = '<p>Diễn viên chưa được cập nhật.</p>';
			} else {
				cast.forEach(name => {
					const card = document.createElement('div');
					card.className = 'actor-card';

					const img = document.createElement('img');
					img.src = 'https://placehold.co/80x120/CCCCCC/000?text=Actor';
					img.alt = name;

					const info = document.createElement('div');
					info.className = 'actor-info';
					info.innerHTML = `<h4>${name}</h4><p>—</p>`;

					card.appendChild(img);
					card.appendChild(info);
					actorList.appendChild(card);
				});
			}
		}

		// Play trailer
		const playBtn = document.getElementById('play-btn');
		if (playBtn) {
			playBtn.addEventListener('click', () => {
				if (movie.trailer_url) {
					window.open(movie.trailer_url, '_blank');
				}
			});
		}

		// Booking button: go to booking page with movie id or slug
		const bookingBtn = document.getElementById('btn-booking');
		if (bookingBtn) {
			bookingBtn.addEventListener('click', () => {
				const target = `booking.html?slug=${encodeURIComponent(movie.slug || movie.id)}`;
				window.location.href = target;
			});
		}

	} catch (err) {
		console.error('Error loading movie data', err);
		document.body.insertAdjacentHTML('beforeend', '<p>Không thể tải dữ liệu phim. Vui lòng chạy trang trên server (ví dụ: `python -m http.server`).</p>');
	}
});