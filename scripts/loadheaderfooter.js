// FILE: js/main.js

$(document).ready(function () {
    
    // =========================================
    // 1. KẾT NỐI GIAO DIỆN (LOAD COMPONENTS)
    // =========================================

    // A. Load Sidebar vào khung bên trái
    $("#sidebar-container").load("components/sidebar.html");

    // B. Load Header vào khung bên trên & Gắn sự kiện nút bấm
    // Lưu ý: Phải đợi Header load xong mới tìm được nút #toggle-sidebar-btn
    $("#navbar-container").load("components/header.html", function() {
        
        // --- LOGIC BẬT/TẮT SIDEBAR ---
        $("#toggle-sidebar-btn").click(function() {
            const sidebarContainer = $("#sidebar-container");
            const overlay = $("#sidebar-overlay");
            
            // Trường hợp 1: Mobile (Màn hình nhỏ < 768px)
            if ($(window).width() < 768) {
                // Trượt ra / Trượt vào
                sidebarContainer.toggleClass("-translate-x-full");
                overlay.toggleClass("hidden");
            } 
            // Trường hợp 2: Desktop (Màn hình lớn)
            else {
                // Thêm/Xóa class 'mini-sidebar' để CSS xử lý việc ẩn chữ
                sidebarContainer.toggleClass("mini-sidebar");
                
                // Xử lý độ rộng của khung chứa (Container)
                if (sidebarContainer.hasClass("mini-sidebar")) {
                     // Thu nhỏ lại vừa khít icon (khoảng 88px - 100px)
                     sidebarContainer.css("width", "100px"); 
                } else {
                     // Mở rộng ra kích thước ban đầu (w-72 ~ 18rem)
                     sidebarContainer.css("width", "18rem"); 
                }
            }
        });
    });

    // C. Xử lý đóng menu khi click vào vùng tối (Overlay) trên Mobile
    $("#sidebar-overlay").click(function() {
        $("#sidebar-container").addClass("-translate-x-full");
        $(this).addClass("hidden");
    });


    // =========================================
    // 2. LẤY DỮ LIỆU PHIM (DATA FETCHING)
    // =========================================

    fetch('./data/movies.json')
    .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy file data/movies.json");
        return res.json();
    })
    .then(data => {
        // Lấy phim ID=8 (Captain America) làm banner, nếu không có lấy phim đầu tiên
        const hero = data.find(m => m.id === 8) || data[0];
        
        // Vẽ giao diện
        renderHero(hero);
        renderRow("#section-now-showing", "Đang Chiếu", data.filter(m => m.status === 'now_showing'));
        renderRow("#section-coming-soon", "Sắp Chiếu", data.filter(m => m.status === 'coming_soon'));
        renderTopRated(data);
    })
    .catch(err => {
        console.error("Lỗi:", err);
        // Hiển thị thông báo nếu không chạy server
        $("#hero-section").html(`
            <div class="h-64 flex items-center justify-center text-red-400 bg-gray-800 rounded-2xl border border-red-500/30">
                <p>⚠️ Lỗi: Hãy chạy bằng <b>Live Server</b> để tải được dữ liệu JSON.</p>
            </div>
        `);
    });

    // =========================================
    // 3. CÁC HÀM VẼ HTML (RENDER FUNCTIONS)
    // =========================================
    
    // Vẽ Banner chính
    const renderHero = (m) => {
        if(!m) return;
        const img = m.landscape_poster_url && !m.landscape_poster_url.includes('placehold') ? m.landscape_poster_url : m.poster_url;
        
        $("#hero-section").removeClass("animate-pulse bg-[#1e1e1e] h-[450px]").html(`
            <div class="relative w-full h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer">
                <img src="${img}" class="absolute w-full h-full object-cover transition duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/60"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent"></div>
                
                <div class="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-lg z-10 pr-4">
                    <span class="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-3 inline-block">Spotlight</span>
                    <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight drop-shadow-lg">${m.title}</h2>
                    <p class="text-gray-300 line-clamp-2 mb-6 text-sm leading-relaxed">${m.description}</p>
                    <div class="flex gap-4">
                        <button class="bg-white text-black px-6 py-3 md:px-8 md:py-3.5 rounded-2xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 text-sm md:text-base">
                            <i class="fa-solid fa-play"></i> Xem Ngay
                        </button>
                        <button class="bg-white/10 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition flex items-center gap-2 border border-white/10">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).hide().fadeIn(500);
    };

    // Vẽ danh sách phim ngang
    const renderRow = (id, title, movies) => {
        if(!movies.length) return;
        let html = `<h3 class="text-lg md:text-xl font-bold mb-4 flex items-center text-white"><span class="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>${title}</h3><div class="flex space-x-4 md:space-x-5 overflow-x-auto hide-scroll pb-4 scroll-smooth">`;
        movies.forEach(m => {
            html += `
                <div class="w-[140px] md:w-[160px] flex-shrink-0 cursor-pointer group">
                    <div class="h-[210px] md:h-[240px] rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                        <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100">
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <div class="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><i class="fa-solid fa-play text-white ml-1"></i></div>
                        </div>
                    </div>
                    <h4 class="font-bold truncate text-sm text-gray-200 group-hover:text-purple-400 transition">${m.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">${m.genres[0]}</p>
                </div>`;
        });
        html += `</div>`;
        $(id).html(html);
    };

    // Vẽ danh sách Top Rated bên phải
    const renderTopRated = (movies) => {
         let html = "";
         // Sắp xếp theo điểm vote và lấy 5 phim đầu
         movies.sort((a,b) => b.vote_average - a.vote_average).slice(0,5).forEach((m, i) => {
             let colorClass = "text-gray-500";
             if(i===0) colorClass = "text-yellow-400 scale-110"; 
             if(i===1) colorClass = "text-gray-300";
             if(i===2) colorClass = "text-orange-400";

             html += `
                <div class="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition border border-transparent hover:border-white/5 group">
                    <span class="font-bold ${colorClass} text-xl w-6 text-center italic transition-transform">${i+1}</span>
                    <img src="${m.poster_url}" class="w-12 h-16 rounded-lg object-cover bg-gray-800 shadow-md">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold truncate text-white group-hover:text-purple-400 transition">${m.title}</h4>
                        <div class="flex items-center mt-1 space-x-2">
                            <div class="flex text-yellow-500 text-[10px]">
                                <i class="fa-solid fa-star"></i>
                            </div>
                            <span class="text-xs text-gray-400 font-bold">${m.vote_average}</span>
                        </div>
                    </div>
                </div>
             `
         });
         $("#top-rated-list").html(html);
    }
});