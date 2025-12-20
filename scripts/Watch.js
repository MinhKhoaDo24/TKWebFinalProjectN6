// LOGIC LẤY DỮ LIỆU PHIM
      document.addEventListener("DOMContentLoaded", async () => {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get("id") ? Number(params.get("id")) : null;

        if (!idParam) {
          window.location.href = "index.html"; 
          return;
        }

        try {
          const res = await fetch("data/movies.json");
          const res2 = await fetch("data/actors.json");
          const movies = await res.json();
          const actors = await res2.json();
          const movie = movies.find((m) => m.id === idParam);
          const actorNames = actors.map(a => a.name);

          if (movie && actors) {
            document.title = `Xem phim: ${movie.title}`;
            
            // --- Điền dữ liệu ---
            document.getElementById("movie-title").textContent = movie.title;
            document.getElementById("movie-desc").textContent = movie.description || "Chưa có mô tả.";
            
            document.getElementById("vote-average").textContent = movie.vote_average || "0";
            document.getElementById("release-year").textContent = movie.release_date ? movie.release_date.split('-')[0] : "N/A";
            document.getElementById("duration").textContent = movie.details?.duration_minutes ? `${movie.details.duration_minutes} phút` : "N/A";
            document.getElementById("country").textContent = movie.details?.country || "Quốc tế";

            // Render Thể loại
            const genresContainer = document.getElementById("genres-list");
            if (movie.genres && movie.genres.length > 0) {
                genresContainer.innerHTML = movie.genres.map(g => 
                    `<span class="px-3 py-1 bg-[#222] text-gray-300 text-xs rounded-full border border-white/10 hover:border-primary/50 hover:text-white transition-colors cursor-default">${g}</span>`
                ).join('');
            }

            // Render Diễn viên
            const actorContainer = document.getElementById("watch-actor-list");
            if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
                actorContainer.innerHTML = movie.credits.cast.map(name => `
                    <div class="flex flex-col items-center text-center gap-3 group cursor-pointer">
                        <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 bg-[#2a2a2a]">
                            <img src="${avatar_url = actorNames.includes(name) ? actors.find(a => a.name === name).avatar_url : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random'}" 
                                 alt="${name}" 
                                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        </div>
                        <div class="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">
                            <a href="actor_detail.html?slug=${actors.find(a => a.name.toLowerCase().trim === name.toLowerCase().trim)?.slug || ''}" class="text-gray-300 hover:text-white transition-colors">${name}</a>
                        </div>
                    </div>
                `).join('');
            } else {
                actorContainer.innerHTML = '<p class="text-gray-500 text-sm italic col-span-3 text-center">Đang cập nhật diễn viên.</p>';
            }

            // Video Player
            let videoUrl = "";
            if (movie.embed_url) {
              videoUrl = movie.embed_url;
            } else if (movie.trailer_url) {
              const videoId = movie.trailer_url.split("v=")[1];
              videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
            }
            const iframe = document.getElementById("video-frame");
            if(iframe) iframe.src = videoUrl;
            
          } else {
            alert("Không tìm thấy dữ liệu phim!");
            window.location.href = "index.html";
          }
        } catch (err) {
          console.error(err);
        }
      });