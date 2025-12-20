// scripts/search.js

window.initSearch = function() {
    const searchInput = $("#header-search-input");
    const resultsDropdown = $("#search-results-dropdown");
    const resultsList = $("#search-results-list");
    const noResults = $("#search-no-results");

    if (!searchInput.length) return; // Kiểm tra nếu không có ô input thì dừng

    searchInput.on("input", function() {
        const keyword = $(this).val().trim().toLowerCase();
        
        if (keyword.length < 2) {
            resultsDropdown.addClass("hidden");
            return;
        }

        // Lấy dữ liệu từ biến toàn cục đã được load ở loadheaderfooter.js
        if (!window.globalMoviesData || window.globalMoviesData.length === 0) return;

        const filtered = window.globalMoviesData.filter(movie => 
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
                    <a href="movie_detail.html?id=${movie.id}" class="search-result-item flex items-center gap-3 p-2 rounded-xl mb-1 hover:bg-white/5 transition-all">
                        <img src="${movie.poster_url}" class="w-10 h-14 object-cover rounded-lg shadow-md" />
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-white truncate">${movie.title}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                <span class="bg-yellow-400/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">
                                    <i class="fa-solid fa-star text-[8px]"></i> ${movie.vote_average}
                                </span>
                                <span>${year}</span>
                            </div>
                        </div>
                    </a>`;
                resultsList.append(itemHtml);
            });
            
            resultsList.append(`
                <div class="pt-2 mt-2 border-t border-white/5">
                    <a href="movie_list.html?search=${encodeURIComponent(keyword)}" class="block w-full text-center py-2 text-xs text-primary font-bold hover:underline uppercase tracking-wider">
                        Xem tất cả kết quả
                    </a>
                </div>
            `);
        } else {
            noResults.removeClass("hidden");
            resultsDropdown.removeClass("hidden");
        }
    });

    // Đóng dropdown khi click ra ngoài
    $(document).on("click", function(e) {
        if (!$(e.target).closest('#header-search-input, #search-results-dropdown').length) {
            resultsDropdown.addClass("hidden");
        }
    });
};