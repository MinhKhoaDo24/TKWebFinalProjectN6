$(document).ready(function () {
    
    // --- KHAI BÁO BIẾN TOÀN CỤC ---
    let globalMoviesData = [];
    let heroSliderInterval;

    // ===========================================
    // 1. COMPONENT LOADING & UI LOGIC
    // ===========================================

    // A. Load Sidebar
    $("#sidebar-container").load("components/sidebar.html");

    // B. Load Header & Gắn sự kiện
    $("#navbar-container").load("components/header.html", function() {
        $("#toggle-sidebar-btn").click(function() {
            const sidebarContainer = $("#sidebar-container");
            const overlay = $("#sidebar-overlay");
            if ($(window).width() < 768) {
                sidebarContainer.toggleClass("-translate-x-full");
                overlay.toggleClass("hidden");
            } else {
                sidebarContainer.toggleClass("mini-sidebar");
                if (sidebarContainer.hasClass("mini-sidebar")) {
                     sidebarContainer.css("width", "100px");
                } else {
                     sidebarContainer.css("width", "18rem");
                }
            }
        });

        if (globalMoviesData.length > 0) {
            populateGenres(globalMoviesData);
            populateCountries(globalMoviesData);
        }
    });

    // C. [MỚI] Load Footer
    $("#footer-container").load("components/footer.html");

    // D. Đóng menu mobile
    $("#sidebar-overlay").click(function() {
        $("#sidebar-container").addClass("-translate-x-full");
        $(this).addClass("hidden");
    });


    // ===========================================
    // 2. DATA FETCHING (LẤY DỮ LIỆU)
    // ===========================================

    fetch('./data/movies.json')
    .then(res => res.json())
    .then(data => {
        globalMoviesData = data; 

        // 2.1. Render Hero Slider
        const heroMovies = data.slice(0, 5); 
        renderHeroSlider(heroMovies);

        // 2.2. Render Các danh sách phim
        renderCarouselRow("#section-now-showing", "Đang Chiếu", data.filter(m => m.status === 'Đang Chiếu'));
        renderCarouselRow("#section-coming-soon", "Sắp Chiếu", data.filter(m => m.status === 'Sắp Chiếu'));
        
        // 2.3. Render Phim Theo Quốc Gia
        const filterByCountry = (keyword) => {
            return data.filter(m => m.details && m.details.country && m.details.country.toLowerCase().includes(keyword.toLowerCase()));
        };
        renderCarouselRow("#section-vietnam", "Phim Việt Nam", filterByCountry("Việt Nam"));
        renderCarouselRow("#section-us", "Phim Âu Mỹ", filterByCountry("Mỹ"));
        renderCarouselRow("#section-korea", "Phim Hàn Quốc", filterByCountry("Hàn Quốc"));

        // 2.4. Render Top Rated
        renderTopRated(data);

        // 2.5. Render Dropdown
        if ($("#header-genres-list").length > 0) {
            populateGenres(data);
            populateCountries(data);
        }
    })
    .catch(err => {
        console.error("Lỗi:", err);
    });


    // ===========================================
    // 3. RENDER FUNCTIONS
    // ===========================================

    // --- A. HERO SLIDER ---
    const renderHeroSlider = (movies) => {
        if (!movies || movies.length === 0) return;
        const container = $("#hero-section");
        container.removeClass("animate-pulse bg-[#1e1e1e]");

        let slidesHtml = '';
        let dotsHtml = '';

        movies.forEach((m, index) => {
            const img = m.landscape_poster_url && !m.landscape_poster_url.includes('placehold') ? m.landscape_poster_url : m.poster_url;
            const activeClass = index === 0 ? 'active opacity-100 z-10' : 'opacity-0 z-0';
            const activeDotClass = index === 0 ? 'bg-primary w-6' : 'bg-white/30 w-1.5 hover:bg-white';
            const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';
            const duration = m.details.duration_minutes ? `${Math.floor(m.details.duration_minutes / 60)}h ${m.details.duration_minutes % 60}m` : '';

            slidesHtml += `
                <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${activeClass}" data-index="${index}">
                    <img src="${img}" class="absolute w-full h-full object-cover object-top">
                    <div class="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 via-40% to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                    <div class="hero-content absolute bottom-12 left-6 md:top-auto md:bottom-16 md:left-12 max-w-xl z-20 pr-4 flex flex-col justify-end h-full md:h-auto pb-4 md:pb-0">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg shadow-purple-500/20">${m.genres[0]}</span>
                            <div class="flex items-center text-yellow-400 text-xs gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm"><i class="fa-solid fa-star"></i><span class="font-bold text-white">${m.vote_average}</span></div>
                            <span class="text-xs text-gray-400 font-medium border border-white/20 px-1.5 rounded">${m.details.age_rating}</span>
                        </div>
                        <h2 class="text-3xl md:text-5xl font-bold mb-3 text-white leading-tight drop-shadow-lg font-[Outfit]">${m.title}</h2>
                        <div class="flex items-center gap-3 text-gray-400 text-xs md:text-sm mb-4 font-medium"><span class="text-white">${year}</span><span class="w-1 h-1 bg-gray-500 rounded-full"></span><span>${duration}</span><span class="w-1 h-1 bg-gray-500 rounded-full"></span><span class="uppercase border border-gray-600 px-1 rounded text-[10px]">HD</span></div>
                        <p class="text-gray-300 line-clamp-2 mb-6 text-sm leading-relaxed drop-shadow-md font-light max-w-lg">${m.description}</p>
                        <div class="flex items-center gap-3">
                            <button class="bg-white text-black pl-5 pr-6 py-2.5 rounded-full font-bold hover:scale-105 transition shadow-lg shadow-white/10 flex items-center gap-2 group/btn text-sm">
                                <div class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover/btn:bg-purple-600 transition"><i class="fa-solid fa-play text-[10px] ml-0.5"></i></div>Xem Phim
                            </button>
                            <button class="btn-watch-trailer bg-white/5 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/10 hover:border-white/40 transition flex items-center gap-2 text-sm group/trailer" data-trailer="${m.trailer_url}">
                                <i class="fa-brands fa-youtube text-red-500 text-lg group-hover/trailer:scale-110 transition"></i>Trailer
                            </button>
                            <button class="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition" title="Thêm vào danh sách"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>`;
            dotsHtml += `<button class="hero-dot h-1.5 rounded-full transition-all duration-300 ${activeDotClass}" data-index="${index}"></button>`;
        });

        container.html(`<div class="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl group border border-white/5 bg-[#121212]">${slidesHtml}<div class="absolute bottom-8 right-8 z-30 flex space-x-1.5">${dotsHtml}</div></div>`);

        let currentIndex = 0;
        const showSlide = (index) => {
            const slides = container.find('.hero-slide');
            const dots = container.find('.hero-dot');
            slides.removeClass('active opacity-100 z-10').addClass('opacity-0 z-0');
            dots.removeClass('bg-primary w-6').addClass('bg-white/30 w-1.5');
            $(slides[index]).removeClass('opacity-0 z-0').addClass('active opacity-100 z-10');
            $(dots[index]).removeClass('bg-white/30 w-1.5').addClass('bg-primary w-6');
            currentIndex = index;
        };
        const startAutoPlay = () => {
            if(heroSliderInterval) clearInterval(heroSliderInterval);
            heroSliderInterval = setInterval(() => showSlide((currentIndex + 1) % movies.length), 6000);
        };
        container.find('.hero-dot').click(function() { clearInterval(heroSliderInterval); showSlide($(this).data('index')); startAutoPlay(); });
        container.hover(() => clearInterval(heroSliderInterval), startAutoPlay);
        startAutoPlay();
    };

    // --- B. RENDER GENRES & COUNTRIES ---
    const populateGenres = (movies) => {
        const allGenres = movies.flatMap(movie => movie.genres);
        const uniqueGenres = [...new Set(allGenres)].sort();
        let html = '';
        uniqueGenres.forEach(genre => html += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${genre}</a>`);
        $("#header-genres-list").html(html);
    };
    const populateCountries = (movies) => {
        const allCountries = [];
        movies.forEach(m => {
            if(m.details && m.details.country) {
                const splitCountries = m.details.country.split(/[,-]/).map(s => s.trim());
                allCountries.push(...splitCountries);
            }
        });
        const uniqueCountries = [...new Set(allCountries)].sort();
        let html = '';
        uniqueCountries.forEach(c => { if(c) html += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${c}</a>`; });
        $("#header-countries-list").html(html);
    };

    // --- C. RENDER CAROUSEL ROW ---
    const renderCarouselRow = (id, title, movies) => {
        if(!movies || movies.length === 0) return;
        const scrollId = `scroll-${id.replace('#', '')}`;
        let cardsHtml = '';
        movies.forEach(m => {
            cardsHtml += `
                <div class="snap-start w-[140px] md:w-[150px] lg:w-[calc(25%-16px)] flex-shrink-0 cursor-pointer group/card transition-all duration-300">
                    <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                        <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20">
                            <div class="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><i class="fa-solid fa-play text-white text-lg ml-1"></i></div>
                        </div>
                    </div>
                    <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition">${m.title}</h4>
                    <p class="text-sm text-gray-500 mt-1">${m.genres[0]}</p>
                </div>`;
        });
        const html = `
            <div class="relative group/slider mb-10">
                <div class="flex justify-between items-end mb-4 px-1">
                    <h3 class="text-xl font-bold flex items-center"><span class="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>${title}</h3>
                    <div class="flex gap-2 opacity-50 group-hover/slider:opacity-100 transition-opacity duration-300">
                        <button onclick="document.getElementById('${scrollId}').scrollBy({left: -300, behavior: 'smooth'})" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <button onclick="document.getElementById('${scrollId}').scrollBy({left: 300, behavior: 'smooth'})" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
                <div class="relative">
                    <div id="${scrollId}" class="flex space-x-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory md:snap-none py-4 px-1">${cardsHtml}</div>
                </div>
            </div>`;
        $(id).html(html);
    };

    // --- D. RENDER TOP RATED ---
    const renderTopRated = (movies) => {
         let html = "";
         movies.sort((a,b) => b.vote_average - a.vote_average).slice(0, 10).forEach((m, i) => {
             let rankClass = i===0 ? "rank-1 font-black" : (i===1 ? "rank-2 font-bold" : (i===2 ? "rank-3 font-bold" : "text-gray-600 font-bold text-lg"));
             html += `
                <div class="top-rated-item flex items-center gap-4 p-3 rounded-2xl cursor-pointer group bg-[#1e1e1e]/50 border border-white/5 relative overflow-hidden">
                    <span class="${rankClass} w-8 text-center italic z-10">${i+1}</span>
                    <div class="relative w-12 h-16 flex-shrink-0 z-10">
                        <img src="${m.poster_url}" class="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <div class="flex-1 min-w-0 z-10">
                        <h4 class="text-sm font-bold truncate text-gray-200 group-hover:text-white transition-colors">${m.title}</h4>
                        <div class="flex items-center mt-1.5 gap-2"><span class="flex items-center gap-1 text-[10px] font-bold text-black bg-yellow-400 px-1.5 py-0.5 rounded"><i class="fa-solid fa-star text-[8px]"></i> ${m.vote_average}</span><span class="text-[10px] text-gray-500 truncate border border-white/10 px-1.5 py-0.5 rounded">${m.genres[0]}</span></div>
                    </div>
                    <div class="absolute right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 z-10"><i class="fa-solid fa-play text-[10px]"></i></div>
                </div>`;
         });
         $("#top-rated-list").html(html);
    };

    // --- 4. TRAILER POPUP ---
    const getYoutubeId = (url) => { if(!url) return null; const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (match && match[2].length === 11) ? match[2] : null; }
    $(document).on('click', '.btn-watch-trailer', function() {
        const trailerUrl = $(this).data('trailer');
        const videoId = getYoutubeId(trailerUrl);
        if (videoId) { $("#trailer-iframe").attr('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`); $("#trailer-modal").removeClass('hidden').animate({ opacity: 1 }, 200); $("#trailer-content").removeClass('scale-95').addClass('scale-100'); } else { alert("Trailer không khả dụng!"); }
    });
    const closeTrailer = () => { $("#trailer-modal").animate({ opacity: 0 }, 200, function() { $(this).addClass('hidden'); $("#trailer-iframe").attr('src', ''); $("#trailer-content").removeClass('scale-100').addClass('scale-95'); }); };
    $("#close-trailer").click(closeTrailer); $("#trailer-modal").click(function(e) { if (e.target === this) closeTrailer(); });
});