$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const genre = params.get('genre');
    const country = params.get('country');
    const type = params.get('type');
    const search = params.get('search');

    let allFilteredMovies = []; 
    let currentPage = 1;
    const itemsPerPage = 12; 

    const movieGrid = $("#movie-grid");
    const listTitle = $("#list-title");
    const listCount = $("#list-count");
    const paginationContainer = $("#pagination-container");

    fetch('./data/movies.json')
        .then(res => res.json())
        .then(data => {
            let titleText = "Tất Cả Phim";
            
            if (genre) {
                allFilteredMovies = data.filter(m => m.genres.includes(genre));
                titleText = `Thể Loại: ${genre}`;
            } else if (country) {
                allFilteredMovies = data.filter(m => m.details?.country?.includes(country));
                titleText = `Quốc Gia: ${country}`;
            } else if (search) {
                allFilteredMovies = data.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
                titleText = `Kết quả cho: "${search}"`;
            } else if (type === 'trending') {
                allFilteredMovies = data.sort((a, b) => b.vote_average - a.vote_average);
                titleText = "Phim Thịnh Hành";
            } else {
                allFilteredMovies = data;
            }

            listTitle.html(`<span class="w-1.5 h-8 bg-purple-500 rounded-full mr-4"></span>${titleText}`);
            listCount.text(`Tìm thấy ${allFilteredMovies.length} bộ phim phù hợp`);

            renderPage(1);
        });

    function renderPage(page) {
        currentPage = page;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const moviesToShow = allFilteredMovies.slice(startIndex, endIndex);

        if (moviesToShow.length === 0) {
            movieGrid.html('<div class="col-span-full text-center py-20 text-gray-500">Không tìm thấy phim nào.</div>');
            paginationContainer.html('');
            return;
        }

        let html = '';
        moviesToShow.forEach(m => {
            const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';
            // Kiểm tra trạng thái yêu thích ban đầu
            const isFav = typeof window.isFavorite === 'function' && window.isFavorite(m.id);
            const heartClass = isFav ? 'fa-solid text-red-500' : 'fa-regular text-white';

            html += `
                <div class="group/card relative" data-movie-id="${m.id}">
                    <a href="movie_detail.html?id=${m.id}" class="block">
                        <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                            <img src="${m.poster_url}" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500">
                            
                            <button onclick="window.toggleFavorite(event, ${m.id})" 
                                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all z-20 group/heart shadow-lg" 
                                title="Thêm vào yêu thích">
                                <i class="${heartClass} fa-heart transition-colors"></i>
                            </button>

                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition bg-black/40">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-xl"><i class="fa-solid fa-play text-white"></i></div>
                            </div>
                        </div>
                        <h4 class="font-bold truncate text-sm text-gray-200 group-hover:text-purple-400 transition">${m.title}</h4>
                        <div class="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                            <span>${year}</span>
                            <span class="text-yellow-500"><i class="fa-solid fa-star mr-1"></i>${m.vote_average}</span>
                        </div>
                    </a>
                </div>`;
        });
        movieGrid.html(html);
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderPagination() {
        const totalPages = Math.ceil(allFilteredMovies.length / itemsPerPage);
        if (totalPages <= 1) { paginationContainer.html(''); return; }
        let paginationHtml = '';
        paginationHtml += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-purple-600 disabled:opacity-20 transition-all"><i class="fa-solid fa-chevron-left text-xs"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button onclick="changePage(${i})" class="w-10 h-10 rounded-xl font-bold text-sm transition-all border ${currentPage === i ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">${i}</button>`;
        }
        paginationHtml += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-purple-600 disabled:opacity-20 transition-all"><i class="fa-solid fa-chevron-right text-xs"></i></button>`;
        paginationContainer.html(paginationHtml);
    }

    window.changePage = function(page) {
        const totalPages = Math.ceil(allFilteredMovies.length / itemsPerPage);
        if (page < 1 || page > totalPages) return;
        renderPage(page);
    };
});