function insertBanner() {
    const target = document.getElementById("banner-hero");
    if (!target) return;

    target.innerHTML = `
        <div class="my-6 w-full overflow-hidden rounded-lg shadow-md group">
            <a href="../price.html">
                <img src="../assets/banner.png" 
                     class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
                     alt="Promotion Banner">
            </a>
        </div>
    `;
};
insertBanner();