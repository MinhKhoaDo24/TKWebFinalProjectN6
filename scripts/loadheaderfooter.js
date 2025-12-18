$(document).ready(function () {
    
    // --- CẤU HÌNH ---
    const SLIDE_DELAY = 20000;
    let globalMoviesData = [];
    let heroSliderInterval;

    // --- LOAD GIAO DIỆN ---
    $("#sidebar-container").load("components/sidebar.html", function() {
        if ($(window).width() >= 768) {
            $("#sidebar-container").addClass("mini-sidebar");
            $("#sidebar-container").css("width", "100px");
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

    // --- SỰ KIỆN ---
    $(document).on("click", "#toggle-sidebar-btn", function() {
        const sidebar = $("#sidebar-container");
        const overlay = $("#sidebar-overlay");
        if ($(window).width() < 768) {
            sidebar.toggleClass("-translate-x-full");
            overlay.toggleClass("hidden");
        } else {
            sidebar.toggleClass("mini-sidebar");
            sidebar.css("width", sidebar.hasClass("mini-sidebar") ? "100px" : "18rem");
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

    // --- VIDEO PLAYER LOGIC (BANNER) ---
    $(document).on('click', '.btn-play-hero-bg', function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        clearInterval(heroSliderInterval);
        const videoId = $(this).data('video-id');
        if(!videoId) { alert("Chưa có trailer!"); return; }

        const wrapper = $(this).closest('.hero-slide').find('.hero-media');
        wrapper.find('img').addClass('opacity-0');
        
        const iframeHtml = `
            <div class="absolute inset-0 w-full h-full overflow-hidden z-10 rounded-[2.5rem]">
                <iframe class="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none md:pointer-events-auto"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&loop=1&playlist=${videoId}" 
                    title="Trailer" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                </iframe>
            </div>`;
        wrapper.append(iframeHtml);
    });

    // --- FETCH DATA ---
    fetch('./data/movies.json')
    .then(res => res.json())
    .then(data => {
        globalMoviesData = data; 
        renderHeroSlider(data.slice(0, 5));
        renderCarouselRow("#section-now-showing", "Đang Chiếu", data.filter(m => m.status === 'Đang Chiếu'));
        renderCarouselRow("#section-coming-soon", "Sắp Chiếu", data.filter(m => m.status === 'Sắp Chiếu'));
        
        const filterCountry = (kw) => data.filter(m => m.details?.country?.toLowerCase().includes(kw.toLowerCase()));
        renderCarouselRow("#section-vietnam", "Phim Việt Nam", filterCountry("Việt Nam"));
        renderCarouselRow("#section-us", "Phim Âu Mỹ", filterCountry("Mỹ"));
        renderCarouselRow("#section-korea", "Phim Hàn Quốc", filterCountry("Hàn Quốc"));

        renderTopRated(data);

        if ($("#header-genres-list").length > 0) {
            populateGenres(data);
            populateCountries(data);
        }
    })
    .catch(err => {
        console.error("Lỗi:", err);
    });

    // --- RENDER FUNCTIONS ---
    const renderHeroSlider = (movies) => {
        if (!movies.length) return;
        const container = $("#hero-section").removeClass("animate-pulse bg-[#1e1e1e]");
        let slidesHtml = '', dotsHtml = '';

        movies.forEach((m, index) => {
            const img = m.landscape_poster_url || m.poster_url;
            const activeClass = index === 0 ? 'active opacity-100 z-10' : 'opacity-0 z-0';
            const activeDotClass = index === 0 ? 'bg-primary w-6' : 'bg-white/30 w-1.5 hover:bg-white';
            const videoId = getYoutubeId(m.trailer_url);

            slidesHtml += `
                <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${activeClass}" data-index="${index}">
                    <div class="hero-media absolute w-full h-full overflow-hidden rounded-[2.5rem]">
                        <img src="${img}" class="absolute w-full h-full object-cover object-top transition-opacity duration-500">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 via-40% to-transparent pointer-events-none rounded-[2.5rem]"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent pointer-events-none rounded-[2.5rem]"></div>
                    
                    <div class="hero-content absolute bottom-12 left-6 md:top-auto md:bottom-16 md:left-12 max-w-xl z-20 pr-4 flex flex-col justify-end h-full md:h-auto pb-4 md:pb-0">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg shadow-purple-500/20">${m.genres[0]}</span>
                            <div class="flex items-center text-yellow-400 text-xs gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm"><i class="fa-solid fa-star"></i><span class="font-bold text-white">${m.vote_average}</span></div>
                            <span class="text-xs text-gray-400 font-medium border border-white/20 px-1.5 rounded">${m.details.age_rating}</span>
                        </div>
                        <h2 class="text-3xl md:text-5xl font-bold mb-3 text-white leading-tight drop-shadow-lg font-[Outfit]">${m.title}</h2>
                        <p class="text-gray-300 line-clamp-2 mb-6 text-sm leading-relaxed drop-shadow-md font-light max-w-lg">${m.description}</p>
                        
                        <div class="flex items-center gap-3">
                            <a href="movie_detail.html?id=${m.id}" class="bg-white text-black pl-5 pr-6 py-2.5 rounded-full font-bold hover:scale-105 transition shadow-lg flex items-center gap-2 group/btn text-sm">
                                <div class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover/btn:bg-purple-600 transition"><i class="fa-solid fa-play text-[10px] ml-0.5"></i></div>Xem Phim
                            </a>
                            <button class="btn-play-hero-bg bg-white/5 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/10 hover:border-white/40 transition flex items-center gap-2 text-sm group/trailer" data-video-id="${videoId}">
                                <i class="fa-brands fa-youtube text-red-500 text-lg group-hover/trailer:scale-110 transition"></i>Trailer
                            </button>
                        </div>
                    </div>
                </div>`;
            dotsHtml += `<button class="hero-dot h-1.5 rounded-full transition-all duration-300 ${activeDotClass}" data-index="${index}"></button>`;
        });

        container.html(`<div class="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5 bg-[#121212]">${slidesHtml}<div class="absolute bottom-8 right-8 z-30 flex space-x-1.5">${dotsHtml}</div></div>`);
        
        let currentIndex = 0;
        const showSlide = (index) => {
            $('.hero-media iframe').parent().remove(); $('.hero-media img').removeClass('opacity-0');
            container.find('.hero-slide').removeClass('active opacity-100 z-10').addClass('opacity-0 z-0');
            container.find('.hero-dot').removeClass('bg-primary w-6').addClass('bg-white/30 w-1.5');
            $(container.find('.hero-slide')[index]).removeClass('opacity-0 z-0').addClass('active opacity-100 z-10');
            $(container.find('.hero-dot')[index]).removeClass('bg-white/30 w-1.5').addClass('bg-primary w-6');
            currentIndex = index;
        };
        const startAutoPlay = () => {
            if(heroSliderInterval) clearInterval(heroSliderInterval);
            heroSliderInterval = setInterval(() => showSlide((currentIndex + 1) % movies.length), SLIDE_DELAY);
        };
        container.hover(() => clearInterval(heroSliderInterval), startAutoPlay);
        startAutoPlay();
    };

    const renderCarouselRow = (id, title, movies) => {
        if(!movies.length) return;
        const scrollId = `scroll-${id.replace('#', '')}`;
        let cardsHtml = '';
        movies.forEach(m => {
            // BAO THẺ A ĐỂ CHUYỂN SANG TRANG CHI TIẾT
            cardsHtml += `
                <a href="movie_detail.html?id=${m.id}" class="snap-start w-[140px] md:w-[150px] lg:w-[calc(25%-16px)] flex-shrink-0 cursor-pointer group/card transition-all duration-300 block">
                    <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                        <img src="${m.poster_url}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/20"><div class="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><i class="fa-solid fa-play text-white text-lg ml-1"></i></div></div>
                    </div>
                    <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition">${m.title}</h4>
                    <p class="text-sm text-gray-500 mt-1">${m.genres[0]}</p>
                </a>`;
        });

        const html = `
            <div class="relative group/slider mb-10">
                <div class="flex justify-between items-end mb-4 px-1">
                    <h3 class="text-xl font-bold flex items-center"><span class="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>${title}</h3>
                    <div class="flex gap-2 opacity-50 group-hover/slider:opacity-100 transition-opacity duration-300">
                        <button onclick="window.scrollCarousel('${scrollId}', -1)" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <button onclick="window.scrollCarousel('${scrollId}', 1)" class="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition cursor-pointer"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
                <div class="relative"><div id="${scrollId}" class="flex space-x-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory md:snap-none py-4 px-1">${cardsHtml}</div></div>
            </div>`;
        $(id).html(html);
    };

    window.scrollCarousel = (id, direction) => {
        const container = document.getElementById(id);
        if (container) container.scrollBy({ left: direction * (container.clientWidth * 0.95), behavior: 'smooth' });
    };

    const renderTopRated = (movies) => {
         let html = "";
         movies.sort((a,b) => b.vote_average - a.vote_average).slice(0, 10).forEach((m, i) => {
             let rankClass = i===0 ? "rank-1 font-black" : (i===1 ? "rank-2 font-bold" : (i===2 ? "rank-3 font-bold" : "text-gray-600 font-bold text-lg"));
             // BAO THẺ A CHO TOP RATED
             html += `
                <a href="movie_detail.html?id=${m.id}" class="top-rated-item flex items-center gap-4 p-3 rounded-2xl cursor-pointer group bg-[#1e1e1e]/50 border border-white/5 relative overflow-hidden block">
                    <span class="${rankClass} w-8 text-center italic z-10">${i+1}</span>
                    <div class="relative w-12 h-16 flex-shrink-0 z-10"><img src="${m.poster_url}" class="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"></div>
                    <div class="flex-1 min-w-0 z-10"><h4 class="text-sm font-bold truncate text-gray-200 group-hover:text-white transition-colors">${m.title}</h4><div class="flex items-center mt-1.5 gap-2"><span class="flex items-center gap-1 text-[10px] font-bold text-black bg-yellow-400 px-1.5 py-0.5 rounded"><i class="fa-solid fa-star text-[8px]"></i> ${m.vote_average}</span><span class="text-[10px] text-gray-500 truncate border border-white/10 px-1.5 py-0.5 rounded">${m.genres[0]}</span></div></div>
                    <div class="absolute right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 z-10"><i class="fa-solid fa-play text-[10px]"></i></div>
                </a>`;
         });
         $("#top-rated-list").html(html);
    };

    const populateGenres = (movies) => {
        const allGenres = [...new Set(movies.flatMap(movie => movie.genres))].sort();
        let headerHtml = '', sidebarHtml = '';
        allGenres.forEach(g => {
            headerHtml += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${g}</a>`;
            sidebarHtml += `<a href="#" class="block px-3 py-2.5 text-[11px] font-medium bg-[#1e1e1e] border border-white/10 rounded-xl text-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 transition-all truncate shadow-sm">${g}</a>`;
        });
        $("#header-genres-list").html(headerHtml);
        $("#sidebar-mobile-genres").html(sidebarHtml);
    };

    const populateCountries = (movies) => {
        const allCountries = []; movies.forEach(m => { if(m.details && m.details.country) allCountries.push(...m.details.country.split(/[,-]/).map(s => s.trim())); }); const uniqueCountries = [...new Set(allCountries)].sort();
        let headerHtml = '', sidebarHtml = '';
        uniqueCountries.forEach(c => {
            headerHtml += `<a href="#" class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors truncate">${c}</a>`;
            sidebarHtml += `<a href="#" class="block px-3 py-2.5 text-[11px] font-medium bg-[#1e1e1e] border border-white/10 rounded-xl text-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 transition-all truncate shadow-sm">${c}</a>`;
        });
        $("#header-countries-list").html(headerHtml);
        $("#sidebar-mobile-countries").html(sidebarHtml);
    };

    const getYoutubeId = (url) => { if(!url) return null; const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (match && match[2].length === 11) ? match[2] : null; };
});