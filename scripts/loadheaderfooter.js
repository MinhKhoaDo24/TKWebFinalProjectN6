$(document).ready(function () {
    
    // ===========================================
    // 1. COMPONENT LOADING & UI LOGIC
    // ===========================================

    // Load Sidebar
    $("#sidebar-container").load("components/sidebar.html");

    // Load Header & Gắn sự kiện nút Toggle
    $("#navbar-container").load("components/header.html", function() {
        
        $("#toggle-sidebar-btn").click(function() {
            const sidebarContainer = $("#sidebar-container");
            const overlay = $("#sidebar-overlay");
            
            // Logic cho Mobile (< 768px)
            if ($(window).width() < 768) {
                sidebarContainer.toggleClass("-translate-x-full");
                overlay.toggleClass("hidden");
            } 
            // Logic cho Desktop (>= 768px)
            else {
                sidebarContainer.toggleClass("mini-sidebar");
                
                // Thu nhỏ container chứa để main content tự giãn ra
                if (sidebarContainer.hasClass("mini-sidebar")) {
                     sidebarContainer.css("width", "100px"); // Thu nhỏ còn 100px
                } else {
                     sidebarContainer.css("width", "18rem"); // Mở rộng 18rem (~288px)
                }
            }
        });
    });

    // Sự kiện đóng menu mobile khi bấm ra ngoài
    $("#sidebar-overlay").click(function() {
        $("#sidebar-container").addClass("-translate-x-full");
        $(this).addClass("hidden");
    });


    // ===========================================
    // 2. DATA FETCHING & RENDERING
    // ===========================================

    fetch('./data/movies.json')
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        // Lấy banner (ưu tiên ID=8)
        const hero = data.find(m => m.id === 8) || data[0];
        renderHero(hero);
        
        // --- SỬA LỖI Ở ĐÂY: Dùng đúng từ khóa trong JSON ---
        const phimDangChieu = data.filter(m => m.status === 'Đang Chiếu');
        const phimSapChieu = data.filter(m => m.status === 'Sắp Chiếu');

        // Vẽ danh sách phim (Carousel)
        renderCarouselRow("#section-now-showing", "Đang Chiếu", phimDangChieu);
        renderCarouselRow("#section-coming-soon", "Sắp Chiếu", phimSapChieu);
        
        // Vẽ Top Rated
        renderTopRated(data);
    })
    .catch(err => {
        console.error("Lỗi:", err);
        $("#hero-section").html("<div class='p-8 text-red-500 bg-gray-800 rounded-xl text-center'>Vui lòng chạy Live Server để tải dữ liệu phim.</div>");
    });


    // ===========================================
    // 3. RENDER FUNCTIONS
    // ===========================================

    const renderHero = (m) => {
        if(!m) return;
        const img = m.landscape_poster_url && !m.landscape_poster_url.includes('placehold') ? m.landscape_poster_url : m.poster_url;
        
        $("#hero-section").removeClass("animate-pulse bg-[#1e1e1e]").html(`
            <div class="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer">
                <img src="${img}" class="absolute w-full h-full object-cover transition duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/50"></div>
                <div class="absolute bottom-10 left-10 max-w-lg z-10">
                    <span class="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-3 inline-block">Spotlight</span>
                    <h2 class="text-5xl font-bold mb-4 text-white leading-tight drop-shadow-xl">${m.title}</h2>
                    <p class="text-gray-300 line-clamp-2 mb-6 text-sm drop-shadow-md">${m.description}</p>
                    <button class="bg-white text-black px-8 py-3.5 rounded-2xl font-bold hover:scale-105 transition flex items-center gap-2">
                        <i class="fa-solid fa-play"></i> Xem Ngay
                    </button>
                </div>
            </div>
        `).hide().fadeIn(500);
    };

    // Hàm vẽ Carousel (Kèm nút bấm)
    const renderCarouselRow = (id, title, movies) => {
        if(!movies || movies.length === 0) return; // Kiểm tra kỹ hơn
        const scrollId = `scroll-${id.replace('#', '')}`;

        let cardsHtml = '';
        movies.forEach(m => {
            cardsHtml += `
                <div class="snap-start w-[160px] flex-shrink-0 cursor-pointer group/card">
                    <div class="h-[240px] rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                        <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20">
                            <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><i class="fa-solid fa-play text-white ml-1"></i></div>
                        </div>
                    </div>
                    <h4 class="font-bold truncate text-sm text-gray-200 group-hover/card:text-purple-400 transition">${m.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">${m.genres[0]}</p>
                </div>`;
        });

        const html = `
            <div class="relative group/slider">
                <div class="flex justify-between items-end mb-4 px-1">
                    <h3 class="text-xl font-bold flex items-center"><span class="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>${title}</h3>
                    <div class="flex gap-2">
                        <button onclick="document.getElementById('${scrollId}').scrollBy({left: -300, behavior: 'smooth'})" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <button onclick="document.getElementById('${scrollId}').scrollBy({left: 300, behavior: 'smooth'})" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
                <div class="relative">
                    <button onclick="document.getElementById('${scrollId}').scrollBy({left: -800, behavior: 'smooth'})" class="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 flex items-center justify-start pl-2 hover:w-20 cursor-pointer">
                        <i class="fa-solid fa-chevron-left text-3xl text-white/80 hover:text-white"></i>
                    </button>

                    <div id="${scrollId}" class="flex space-x-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory md:snap-none py-4 px-1">
                        ${cardsHtml}
                    </div>

                    <button onclick="document.getElementById('${scrollId}').scrollBy({left: 800, behavior: 'smooth'})" class="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 flex items-center justify-end pr-2 hover:w-20 cursor-pointer">
                        <i class="fa-solid fa-chevron-right text-3xl text-white/80 hover:text-white"></i>
                    </button>
                </div>
            </div>
        `;
        $(id).html(html);
    };

    const renderTopRated = (movies) => {
         let html = "";
         movies.sort((a,b) => b.vote_average - a.vote_average).slice(0,5).forEach((m, i) => {
             let rankStyle = "text-gray-600 font-bold text-xl";
             if(i===0) rankStyle = "text-yellow-400 font-black text-2xl drop-shadow-md";
             if(i===1) rankStyle = "text-gray-300 font-bold text-xl";
             if(i===2) rankStyle = "text-orange-400 font-bold text-xl";

             html += `
                <div class="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition border border-transparent hover:border-white/5 group">
                    <span class="${rankStyle} w-6 text-center italic">${i+1}</span>
                    <img src="${m.poster_url}" class="w-12 h-16 rounded-lg object-cover bg-gray-800 shadow-md group-hover:scale-105 transition">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold truncate text-white group-hover:text-purple-400 transition">${m.title}</h4>
                        <div class="flex items-center mt-1 space-x-1.5">
                            <i class="fa-solid fa-star text-yellow-500 text-[10px]"></i>
                            <span class="text-xs text-gray-400 font-bold">${m.vote_average}</span>
                            <span class="text-[10px] text-gray-600">• ${m.genres[0]}</span>
                        </div>
                    </div>
                </div>
             `
         });
         $("#top-rated-list").html(html);
    }
});