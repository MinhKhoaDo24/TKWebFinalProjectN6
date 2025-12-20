// scripts/search.js

window.initSearch = async function() {
    const searchInput = $("#header-search-input");
    const resultsDropdown = $("#search-results-dropdown");
    const resultsList = $("#search-results-list");
    const noResults = $("#search-no-results");

    if (!searchInput.length) return;

    // 1. Tải dữ liệu movies.json nếu chưa có
    if (!window.globalMoviesData || window.globalMoviesData.length === 0) {
        try {
            const response = await fetch('../data/movies.json'); // Điều chỉnh đường dẫn cho đúng
            window.globalMoviesData = await response.json();
        } catch (error) {
            console.error("Không thể tải dữ liệu phim:", error);
            return;
        }
    }

    // 2. Lắng nghe sự kiện nhập liệu
    searchInput.on("input", function() {
        const keyword = $(this).val().trim().toLowerCase();
        
        if (keyword.length < 1) {
            resultsDropdown.addClass("hidden");
            return;
        }

        const movies = window.globalMoviesData || [];
        
        // Lọc phim theo tiêu đề tiếng Việt hoặc tên gốc
        const filtered = movies.filter(movie => 
            movie.title.toLowerCase().includes(keyword) || 
            (movie.original_title && movie.original_title.toLowerCase().includes(keyword))
        ).slice(0, 6);

        resultsList.empty();
        
        if (filtered.length > 0) {
            noResults.addClass("hidden");
            resultsDropdown.removeClass("hidden");
            
            filtered.forEach(movie => {
                const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
                const itemHtml = `
                    <a href="movie_detail.html?id=${movie.id}" class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group">
                        <img src="${movie.poster_url}" class="w-10 h-14 object-cover rounded-lg shadow-md" />
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">${movie.title}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                <span class="bg-yellow-400/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">
                                    <i class="fa-solid fa-star text-[8px]"></i> ${movie.vote_average}
                                </span>
                                <span>${year}</span>
                                <span class="truncate">• ${movie.genres[0]}</span>
                            </div>
                        </div>
                    </a>`;
                resultsList.append(itemHtml);
            });
            
            // Nút "Xem tất cả"
            resultsList.append(`
                <div class="pt-2 mt-2 border-t border-white/5">
                    <a href="movie_list.html?search=${encodeURIComponent(keyword)}" class="block w-full text-center py-2 text-xs text-purple-500 font-bold hover:text-purple-400 uppercase tracking-wider transition-colors">
                        Xem tất cả kết quả cho "${keyword}"
                    </a>
                </div>
            `);
        } else {
            noResults.removeClass("hidden");
            resultsDropdown.removeClass("hidden");
        }
    });

    // 3. Đóng dropdown khi click ra ngoài
    $(document).on("click", function(e) {
        if (!$(e.target).closest('.relative').has(searchInput).length) {
            resultsDropdown.addClass("hidden");
        }
    });
};