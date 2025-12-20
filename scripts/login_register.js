$(document).ready(function() {
    
    // Key lưu trữ
    const DB_KEY = 'cine_users'; 

    // ==================================================
    // 1. HÀM CẬP NHẬT TRẠNG THÁI (ĐỒNG BỘ CẢ 2 NƠI)
    // ==================================================
    window.checkLoginStatus = function() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const username = localStorage.getItem("username") || "Member";

        // --- A. CẬP NHẬT HEADER ---
        if ($("#guest-action-container").length > 0) {
            if (isLoggedIn) {
                $("#guest-action-container").addClass("hidden");
                $("#user-profile").removeClass("hidden").addClass("flex");
                $("#username-display").text(username);
            } else {
                $("#guest-action-container").removeClass("hidden");
                $("#user-profile").addClass("hidden").removeClass("flex");
            }
        }

        // --- B. CẬP NHẬT SIDEBAR (MỚI) ---
        if ($("#sidebar-guest-view").length > 0) {
            if (isLoggedIn) {
                // Đăng nhập -> Ẩn nút Login cũ, Hiện Profile mới
                $("#sidebar-guest-view").addClass("hidden");
                $("#sidebar-user-view").removeClass("hidden");
                $("#sidebar-username-text").text(username);
            } else {
                // Chưa đăng nhập -> Hiện nút Login cũ
                $("#sidebar-guest-view").removeClass("hidden");
                $("#sidebar-user-view").addClass("hidden");
            }
        }
    };

    // Hàm bắt buộc đăng nhập (Tiện ích)
    window.requireLogin = function() {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            if (confirm("Bạn cần đăng nhập để sử dụng tính năng này!\nĐến trang đăng nhập ngay?")) {
                window.location.href = "login.html";
            }
            return false;
        }
        return true;
    };

    // ==================================================
    // 2. XỬ LÝ ĐĂNG KÝ
    // ==================================================
    $("#register-form").on("submit", function(e) {
        e.preventDefault();
        
        const username = $("#reg-username").val().trim();
        const email = $("#reg-email").val().trim();
        const password = $("#reg-password").val().trim();
        const confirmPass = $("#reg-confirm").val().trim();

        if (username.length < 3) { alert("Tên quá ngắn!"); return; }
        if (password.length < 6) { alert("Mật khẩu quá ngắn!"); return; }
        if (password !== confirmPass) { alert("Mật khẩu không khớp!"); return; }

        let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
        if (users.some(u => u.username === username)) {
            alert("Tên đăng nhập đã tồn tại!");
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem(DB_KEY, JSON.stringify(users));

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "login.html";
    });

    // ==================================================
    // 3. XỬ LÝ ĐĂNG NHẬP
    // ==================================================
    $("#login-form").on("submit", function(e) {
        e.preventDefault();

        const inputUser = $("#login-username").val().trim();
        const inputPass = $("#login-password").val().trim();

        let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
        const validUser = users.find(u => 
            (u.username === inputUser || u.email === inputUser) && u.password === inputPass
        );

        if (validUser) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", validUser.username);
            
            alert("Đăng nhập thành công! Chào mừng " + validUser.username);
            window.location.href = "index.html";
        } else {
            alert("Sai tên đăng nhập hoặc mật khẩu!");
        }
    });

    // ==================================================
    // 4. XỬ LÝ ĐĂNG XUẤT (CHUNG CHO CẢ 2 NÚT)
    // ==================================================
    function handleLogout(e) {
        e.preventDefault();
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            
            alert("Đã đăng xuất.");
            window.location.reload(); // Tải lại trang để reset giao diện
        }
    }

    // Gán sự kiện cho Header
    $(document).on("click", "#btn-logout", handleLogout);
    
    // Gán sự kiện cho Sidebar
    $(document).on("click", "#btn-sidebar-logout", handleLogout);

    // Toggle menu dropdown (Header)
    $(document).on("click", "#btn-member-menu", function(e) {
        e.stopPropagation();
        $("#guest-dropdown").toggleClass("hidden");
    });
    $(document).click(function() { $("#guest-dropdown").addClass("hidden"); });
});