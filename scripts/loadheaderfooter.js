$(document).ready(function () {
    
    // ==========================================
    // 1. CẤU HÌNH & BIẾN TOÀN CỤC
    // ==========================================
    const SLIDE_DELAY = 10000;
    let globalMoviesData = [];
    let heroSliderInterval;

    const SIDEBAR_WIDTH_MINI = "20px"; 
    const SIDEBAR_WIDTH_FULL = "10px"; 

    // ==========================================
    // 2. LOGIC YÊU THÍCH (FAVORITES)
    // ==========================================
    window.isFavorite = (id) => {
        const favs = JSON.parse(localStorage.getItem('favorites')) || [];
        return favs.includes(id);
    };

    window.toggleFavorite = (e, id) => {
        e.preventDefault(); e.stopPropagation();
        let favs = JSON.parse(localStorage.getItem('favorites')) || [];
        const btn = $(e.currentTarget);
        const icon = btn.find('i');

        if (favs.includes(id)) {
            favs = favs.filter(favId => favId !== id);
            // SỬA LỖI: Luôn giữ class 'fa-heart'
            icon.removeClass('fa-solid text-red-500').addClass('fa-regular text-white');
            btn.addClass('animate-wiggle'); setTimeout(() => btn.removeClass('animate-wiggle'), 500);
        } else {
            favs.push(id);
            // SỬA LỖI: Luôn giữ class 'fa-heart'
            icon.removeClass('fa-regular text-white').addClass('fa-solid text-red-500');
            icon.addClass('scale-125'); setTimeout(() => icon.removeClass('scale-125'), 200);
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
    };

    // ==========================================
    // 3. LOAD GIAO DIỆN
    // ==========================================
    $("#sidebar-container").load("components/sidebar.html", function(response, status, xhr) {
        if (status == "error") return;
        const path = window.location.pathname;
        const isAuthPage = path.includes('login') || path.includes('register');

        if (!isAuthPage && $(window).width() >= 1280) {
            setSidebarState("mini");
        } else {
            $("#sidebar-container").removeClass("mini-sidebar").css("width", "");
            $("main").css("padding-left", "");
        }
        
        if(isAuthPage) {
            $('#sidebar-content a').each(function() {
                if($(this).text().trim().includes('Đăng Nhập')) {
                    $(this).addClass('text-red-500 bg-white/10');
                }
            });
        }
    });

    $("#navbar-container").load("components/header.html", function() {
        if (typeof window.checkLoginStatus === 'function') window.checkLoginStatus();
        if (globalMoviesData.length > 0) {
            populateGenres(globalMoviesData);
            populateCountries(globalMoviesData);
        }
    });

    $("#footer-container").load("components/footer.html");

    // ==========================================
    // 4. XỬ LÝ SỰ KIỆN
    // ==========================================
    function setSidebarState(state) {
        const sidebar = $("#sidebar-container");
        const content = $("main"); 
        if (state === "mini") {
            sidebar.addClass("mini-sidebar").css("width", "88px");
            content.css("padding-left", SIDEBAR_WIDTH_MINI); 
        } else if (state === "full") {
            sidebar.removeClass("mini-sidebar").css("width", "280px");
            content.css("padding-left", SIDEBAR_WIDTH_FULL);
        }
    }

    $(document).on("click", "#toggle-sidebar-btn, #sidebar-toggle-btn", function() {
        const sidebar = $("#sidebar-container");
        const overlay = $("#sidebar-overlay");
        if ($(window).width() < 1280) {
            sidebar.toggleClass("-translate-x-full");
            overlay.toggleClass("hidden");
        } else {
            if (sidebar.hasClass("-translate-x-full")) {
                sidebar.removeClass("-translate-x-full");
                setSidebarState("full");
            } else {
                if (sidebar.hasClass("mini-sidebar")) setSidebarState("full");
                else setSidebarState("mini");
            }
        }
    });

    $("#sidebar-overlay").click(function() {
        $("#sidebar-container").addClass("-translate-x-full");
        $(this).addClass("hidden");
    });

    $(document).on('click', '.mobile-accordion-btn', function() {
        $(this).next().slideToggle(250);
        $(this).find('.fa-chevron-down').toggleClass('rotate-180');
        $(this).toggleClass('text-white bg-white/5');
    });

    $(document).on("click", "#btn-logout", function(e) {
        e.preventDefault();
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        alert("Đã đăng xuất thành công!");
        window.location.reload();
    });

    $(document).on('click', '.btn-play-hero-bg', function(e) {
        e.preventDefault(); e.stopPropagation();
        clearInterval(heroSliderInterval);
        const videoId = $(this).data('video-id');
        if(!videoId) { alert("Chưa có trailer!"); return; }
        const wrapper = $(this).closest('.hero-slide').find('.hero-media');
        wrapper.find('img').addClass('opacity-0');
        wrapper.append(`<div class="absolute inset-0 w-full h-full overflow-hidden z-10 rounded-[2.5rem]"><iframe class="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none md:pointer-events-auto" src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&loop=1&playlist=${videoId}" title="Trailer" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`);
    });

    // ==========================================
    // 5. FETCH DATA & RENDER
    // ==========================================
    fetch('./data/movies.json')
    .then(res => res.json())
    .then(data => {
        globalMoviesData = data; 
        if ($("#hero-section").length > 0) {
            renderHeroSlider(data.slice(0, 5));
            renderCarouselRow("#section-now-showing", "Đang Chiếu", data.filter(m => m.status === 'Đang Chiếu'));
            renderCarouselRow("#section-coming-soon", "Sắp Chiếu", data.filter(m => m.status === 'Sắp Chiếu'));
            
            const filterCountry = (kw) => data.filter(m => m.details?.country?.toLowerCase().includes(kw.toLowerCase()));
            renderCarouselRow("#section-vietnam", "Phim Việt Nam", filterCountry("Việt Nam"));
            renderCarouselRow("#section-us", "Phim Âu Mỹ", filterCountry("Mỹ"));
            renderCarouselRow("#section-korea", "Phim Hàn Quốc", filterCountry("Hàn Quốc"));

            renderTopRated(data);
        }
        if ($("#header-genres-list").length > 0) {
            populateGenres(data);
            populateCountries(data);
        }
    })
    .catch(err => {
        console.log("Info: Chưa load được data phim.");
    });

    // ==========================================
    // 6. RENDER FUNCTIONS
    // ==========================================
    
    // --- HERO SLIDER ---
    const renderHeroSlider = (movies) => {
        if (!movies.length) return;
        const container = $("#hero-section").removeClass("animate-pulse bg-[#1e1e1e]");
        let slidesHtml = '', dotsHtml = '';

        movies.forEach((m, index) => {
            const img = m.landscape_poster_url || m.poster_url;
            const activeClass = index === 0 ? 'active opacity-100 z-10' : 'opacity-0 z-0';
            const activeDotClass = index === 0 ? 'bg-primary w-6' : 'bg-white/30 w-1.5 hover:bg-white';
            const videoId = getYoutubeId(m.trailer_url);
            
            // SỬA LỖI: Thêm 'fa-heart' vào class
            const heartClass = window.isFavorite(m.id) ? 'fa-solid text-red-500' : 'fa-regular text-white';

            slidesHtml += `
                <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${activeClass}" data-index="${index}">
                    <div class="hero-media absolute w-full h-full overflow-hidden rounded-[2.5rem]"><img src="${img}" class="absolute w-full h-full object-cover object-top transition-opacity duration-500"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 via-40% to-transparent pointer-events-none rounded-[2.5rem]"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent pointer-events-none rounded-[2.5rem]"></div>
                    <div class="hero-content absolute bottom-12 left-6 md:top-auto md:bottom-16 md:left-12 max-w-xl z-20 pr-4">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold uppercase rounded shadow-lg">${m.genres[0]}</span>
                            <div class="flex items-center text-yellow-400 text-xs gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm"><i class="fa-solid fa-star"></i><span class="font-bold text-white">${m.vote_average}</span></div>
                            <span class="text-xs text-gray-400 font-medium border border-white/20 px-1.5 rounded">${m.details?.age_rating || '13+'}</span>
                        </div>
                        <h2 class="text-3xl md:text-5xl font-bold mb-3 text-white leading-tight font-[Outfit]">${m.title}</h2>
                        <p class="text-gray-300 line-clamp-2 mb-6 text-sm leading-relaxed max-w-lg">${m.description}</p>
                        <div class="flex items-center gap-3">
                            <a href="movie_detail.html?id=${m.id}" class="bg-white text-black pl-5 pr-6 py-2.5 rounded-full font-bold hover:scale-105 transition flex items-center gap-2 text-sm"><i class="fa-solid fa-play"></i> Xem Phim</a>
                            <button class="btn-play-hero-bg bg-white/5 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/10 hover:border-white/40 transition flex items-center gap-2 text-sm group/trailer" data-video-id="${videoId}"><i class="fa-brands fa-youtube text-red-500 text-lg"></i>Trailer</button>
                            <button onclick="window.toggleFavorite(event, ${m.id})" class="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition group/fav">
                                <i class="${heartClass} fa-heart text-lg transition-transform group-hover/fav:scale-110"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            dotsHtml += `<button class="hero-dot h-1.5 rounded-full transition-all duration-300 ${activeDotClass}" data-index="${index}"></button>`;
        });
        container.html(`<div class="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5 bg-[#121212]">${slidesHtml}<div class="absolute bottom-8 right-8 z-30 flex space-x-1.5">${dotsHtml}</div></div>`);
        
        // ... (Logic slide giữ nguyên) ...
        let currentIndex = 0;
        const showSlide = (index) => {
            container.find('.hero-slide').removeClass('active opacity-100 z-10').addClass('opacity-0 z-0');
            container.find('.hero-dot').removeClass('bg-primary w-6').addClass('bg-white/30 w-1.5');
            $(container.find('.hero-slide')[index]).removeClass('opacity-0 z-0').addClass('active opacity-100 z-10');
            $(container.find('.hero-dot')[index]).removeClass('bg-white/30 w-1.5').addClass('bg-primary w-6');
            currentIndex = index;
        };
        const startAutoPlay = () => { if(heroSliderInterval) clearInterval(heroSliderInterval); heroSliderInterval = setInterval(() => showSlide((currentIndex + 1) % movies.length), SLIDE_DELAY); };
        container.find('.hero-dot').click(function() { const index = $(this).data('index'); showSlide(index); startAutoPlay(); });
        container.hover(() => clearInterval(heroSliderInterval), startAutoPlay); startAutoPlay();
    };

    // --- CAROUSEL ROW ---
    const renderCarouselRow = (id, title, movies) => {
        if(!movies.length) return;
        const scrollId = `scroll-${id.replace('#', '')}`;
        let cardsHtml = '';
        
        movies.forEach(m => {
            // SỬA LỖI: Thêm 'fa-heart' vào class
            const heartClass = window.isFavorite(m.id) ? 'fa-solid text-red-500' : 'fa-regular text-white';
            const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';
            const duration = m.details?.duration_minutes ? `${m.details.duration_minutes}p` : '';

            cardsHtml += `
                <div class="snap-start w-[160px] md:w-[180px] lg:w-[calc(25%-16px)] flex-shrink-0 relative group/card">
                    <a href="movie_detail.html?id=${m.id}" class="block cursor-pointer">
                        <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                            <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><i class="fa-solid fa-play text-white text-sm ml-1"></i></div>
                            </div>
                            
                            <button onclick="window.toggleFavorite(event, ${m.id})" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition z-20 group/heart">
                                <i class="${heartClass} fa-heart text-sm group-hover/heart:scale-110 transition-transform"></i>
                            </button>

                            <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-primary/80 backdrop-blur-md rounded text-[10px] font-bold text-white shadow-lg">HD</div>
                        </div>
                        <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition mb-1" title="${m.title}">${m.title}</h4>
                        <div class="flex items-center justify-between text-xs text-gray-400">
                            <div class="flex items-center gap-2"><span>${year}</span>${duration ? `<span class="w-1 h-1 bg-gray-600 rounded-full"></span><span>${duration}</span>` : ''}</div>
                            <div class="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20"><i class="fa-solid fa-star text-[10px]"></i><span class="font-bold">${m.vote_average}</span></div>
                        </div>
                    </a>
                </div>`;
        });

        $(id).html(`
            <div class="relative group/slider mb-10">
                <div class="flex justify-between items-end mb-4 px-1">
                    <h3 class="text-xl font-bold flex items-center"><span class="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>${title}</h3>
                    <div class="flex gap-2 opacity-50 group-hover/slider:opacity-100 transition-opacity duration-300">
                        <button onclick="window.scrollCarousel('${scrollId}', -1)" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <button onclick="window.scrollCarousel('${scrollId}', 1)" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
                <div class="relative"><div id="${scrollId}" class="flex space-x-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory md:snap-none py-4 px-1">${cardsHtml}</div></div>
            </div>`);
    };

    // --- TOP RATED ---
    const renderTopRated = (movies) => {
         let html = "";
         movies.sort((a,b) => b.vote_average - a.vote_average).slice(0, 10).forEach((m, i) => {
             let rankTextStyle = "";
             if (i === 0) rankTextStyle = "text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-t from-purple-600 to-pink-400 drop-shadow-[0_4px_10px_rgba(168,85,247,0.6)] pr-2";
             else if (i === 1) rankTextStyle = "text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-t from-blue-600 to-cyan-400 drop-shadow-md pr-1";
             else if (i === 2) rankTextStyle = "text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-t from-yellow-700 to-yellow-300 drop-shadow-md pr-1";
             else rankTextStyle = "text-3xl font-bold text-gray-500 font-[Outfit]";

             // SỬA LỖI: Thêm 'fa-heart' vào class
             const heartClass = window.isFavorite(m.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-400';
             const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';

             html += `
                <div class="relative group block mb-3 pl-1">
                    <a href="movie_detail.html?id=${m.id}" class="top-rated-item flex items-center p-3 rounded-2xl cursor-pointer bg-[#1e1e1e]/50 border border-white/5 relative overflow-hidden hover:bg-white/5 transition-colors pr-14">
                        <div class="w-16 flex-shrink-0 flex justify-center items-center z-10">
                            <span class="${rankTextStyle} leading-none" style="font-family: 'Outfit', sans-serif;">${i+1}</span>
                        </div>
                        <div class="relative w-12 h-16 flex-shrink-0 z-10 mx-3">
                            <img src="${m.poster_url}" class="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                        </div>
                        <div class="flex-1 min-w-0 z-10">
                            <h4 class="text-sm font-bold truncate text-gray-200 group-hover:text-white transition-colors">${m.title}</h4>
                            <div class="flex items-center mt-1.5 gap-2 text-xs text-gray-500">
                                <span>${year}</span>
                                <span class="flex items-center gap-1 text-[10px] font-bold text-black bg-yellow-400 px-1.5 py-0.5 rounded"><i class="fa-solid fa-star text-[8px]"></i> ${m.vote_average}</span>
                            </div>
                        </div>
                    </a>
                    
                    <button onclick="window.toggleFavorite(event, ${m.id})" class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:scale-110 transition z-20 bg-white/5 rounded-full hover:bg-white/10 group/heart">
                        <i class="${heartClass} fa-heart text-sm group-hover/heart:text-red-500 transition-colors"></i>
                    </button>
                </div>`;
         });
         $("#top-rated-list").html(html);
    };

    const populateGenres = (movies) => { /*...*/ const allGenres = [...new Set(movies.flatMap(m => m.genres))].sort(); let hHtml = '', sHtml = ''; allGenres.forEach(g => { hHtml += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${g}</a>`; sHtml += `<a href="#" class="block px-3 py-2.5 text-[11px] font-medium bg-[#1e1e1e] border border-white/10 rounded-xl text-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 transition-all truncate shadow-sm">${g}</a>`; }); $("#header-genres-list").html(hHtml); $("#sidebar-mobile-genres").html(sHtml); };
    const populateCountries = (movies) => { /*...*/ const allC = []; movies.forEach(m => { if(m.details?.country) allC.push(...m.details.country.split(/[,-]/).map(s => s.trim())); }); const uniqueC = [...new Set(allC)].sort(); let hHtml = '', sHtml = ''; uniqueC.forEach(c => { hHtml += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${c}</a>`; sHtml += `<a href="#" class="block px-3 py-2.5 text-[11px] font-medium bg-[#1e1e1e] border border-white/10 rounded-xl text-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 transition-all truncate shadow-sm">${c}</a>`; }); $("#header-countries-list").html(hHtml); $("#sidebar-mobile-countries").html(sHtml); };
    const getYoutubeId = (url) => { if(!url) return null; const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (match && match[2].length === 11) ? match[2] : null; };
});

window.scrollCarousel = (id, direction) => {
    const container = document.getElementById(id);
    if (container) container.scrollBy({ left: direction * (container.clientWidth * 0.95), behavior: 'smooth' });
};  