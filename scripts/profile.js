document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra trạng thái đăng nhập
    const currentUsername = localStorage.getItem("username");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn || !currentUsername) {
        window.location.href = "login.html";
        return;
    }

    // 2. Hàm cập nhật giao diện (Header + Profile)
    const syncUI = (userData) => {
        // Cập nhật tất cả các vị trí có Avatar
        const avatarPath = userData.avatar || `https://placehold.co/400x400/6366f1/ffffff?text=${userData.username.charAt(0).toUpperCase()}`;
        const avatars = document.querySelectorAll("#avatar-btn, .header-avatar-img, #pf-avatar");
        avatars.forEach(img => { if(img) img.src = avatarPath; });

        // Cập nhật tên và thông tin
        const name = userData.fullName || userData.username;
        const nameFields = document.querySelectorAll("#pf-name, #username-display");
        nameFields.forEach(f => { if(f) f.textContent = name; });

        if(document.getElementById("pf-email")) document.getElementById("pf-email").textContent = userData.email || "Chưa cập nhật";
        if(document.getElementById("pf-username")) document.getElementById("pf-username").textContent = "@" + userData.username;

        // Xử lý hiện User profile trên Header, ẩn nút Guest
        const guestBox = document.getElementById("guest-action-container");
        const userBox = document.getElementById("user-profile");
        if (guestBox) guestBox.classList.add("hidden");
        if (userBox) userBox.classList.remove("hidden");
    };

    // 3. Lấy dữ liệu user từ cine_users
    const refreshData = () => {
        const users = JSON.parse(localStorage.getItem("cine_users")) || [];
        const userObj = users.find(u => u.username === currentUsername);
        if (userObj) syncUI(userObj);
    };

    // Chạy lần đầu
    refreshData();

    // 4. Xử lý up ảnh từ máy tính (FileReader)
    const fileInput = document.getElementById("avatar-input");
    if (fileInput) {
        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Giới hạn 2MB để tránh lỗi bộ nhớ LocalStorage
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá nặng (tối đa 2MB). Vui lòng chọn ảnh khác.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;

                // Lưu vào mảng users
                let users = JSON.parse(localStorage.getItem("cine_users")) || [];
                const idx = users.findIndex(u => u.username === currentUsername);

                if (idx !== -1) {
                    users[idx].avatar = base64String;
                    localStorage.setItem("cine_users", JSON.stringify(users));
                    
                    // Cập nhật UI ngay lập tức
                    syncUI(users[idx]);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // 5. Logic Đăng xuất (Cả nút ở profile và header)
    const handleLogout = () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            window.location.href = "index.html";
        }
    };

    document.getElementById("btn-logout")?.addEventListener("click", handleLogout);
    document.getElementById("btn-logout-header")?.addEventListener("click", handleLogout);
});