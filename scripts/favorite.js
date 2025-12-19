$(document).ready(function() {
    
    fetch('./data/movies.json')
    .then(res => res.json())
    .then(allMovies => {
        renderFavorites(allMovies);
    })
    .catch(err => console.error("Lỗi tải phim:", err));

    function renderFavorites(allMovies) {
        const favIds = JSON.parse(localStorage.getItem('favorites')) || [];
        const container = $("#favorites-grid");

        if (favIds.length === 0) {
            container.html(`
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-solid fa-heart-crack text-red-500 font text-2xl"></i>
                    </div>
                    <p class="text-lg">Bạn chưa có phim yêu thích nào.</p>
                    <a href="index.html" class="mt-4 px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition text-white text-sm font-bold">Khám phá ngay</a>
                </div>
            `);
            return;
        }

        // Lọc phim có id trùng với danh sách yêu thích
        const favMovies = allMovies.filter(m => favIds.includes(m.id));
        
        let html = '';
        favMovies.forEach(m => {
            html += `
                <div class="relative group/card">
                    <a href="movie_detail.html?id=${m.id}" class="block cursor-pointer">
                        <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                            <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                            
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                                    <i class="fa-solid fa-play text-white text-sm ml-1"></i>
                                </div>
                            </div>

                            <button onclick="removeFavFromPage(event, ${m.id})" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-sm flex items-center justify-center transition z-20 shadow-lg" title="Bỏ yêu thích">
                                <i class="fa-solid fa-xmark text-white text-sm"></i>
                            </button>
                        </div>
                        <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition">${m.title}</h4>
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-xs text-gray-500">${m.genres[0]}</p>
                            <span class="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold"><i class="fa-solid fa-star mr-0.5"></i>${m.vote_average}</span>
                        </div>
                    </a>
                </div>
            `;
        });
        container.html(html);
    }

    // Hàm xóa trực tiếp trên trang Favorites và reload lại list
    window.removeFavFromPage = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        
        if(confirm("Bạn có chắc muốn bỏ phim này khỏi danh sách yêu thích?")) {
            let favs = JSON.parse(localStorage.getItem('favorites')) || [];
            favs = favs.filter(favId => favId !== id);
            localStorage.setItem('favorites', JSON.stringify(favs));
            
            // Reload lại giao diện
            fetch('./data/movies.json')
            .then(res => res.json())
            .then(data => renderFavorites(data));
        }
    };
});