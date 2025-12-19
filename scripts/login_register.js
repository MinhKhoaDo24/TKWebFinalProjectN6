$(document).ready(function() {
    
    // Key để lưu danh sách tài khoản trong LocalStorage
    const DB_KEY = 'cine_users'; 

    // ==================================================
    // 1. CÁC HÀM DÙNG CHUNG (GLOBAL)
    // ==================================================

    // Hàm kiểm tra và cập nhật giao diện Header
    window.checkLoginStatus = function() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const username = localStorage.getItem("username") || "Member";

        // Nếu header chưa load xong thì bỏ qua
        if ($("#guest-action-container").length === 0) return;

        if (isLoggedIn) {
            $("#guest-action-container").addClass("hidden");
            $("#user-profile").removeClass("hidden").addClass("flex");
            $("#username-display").text(username);
        } else {
            $("#guest-action-container").removeClass("hidden");
            $("#user-profile").addClass("hidden").removeClass("flex");
        }
    };

    // Hàm bắt buộc đăng nhập (dùng cho các nút chức năng)
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
    // 2. XỬ LÝ ĐĂNG KÝ (REGISTER)
    // ==================================================
    $("#register-form").on("submit", function(e) {
        e.preventDefault();
        
        const username = $("#reg-username").val().trim();
        const email = $("#reg-email").val().trim();
        const password = $("#reg-password").val().trim();
        const confirmPass = $("#reg-confirm").val().trim();

        // Validate cơ bản
        if (username.length < 3) { alert("Tên đăng nhập quá ngắn!"); return; }
        if (password.length < 6) { alert("Mật khẩu phải từ 6 ký tự trở lên!"); return; }
        if (password !== confirmPass) { alert("Mật khẩu nhập lại không khớp!"); return; }

        // Lấy danh sách user từ LocalStorage
        let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];

        // Kiểm tra trùng lặp
        if (users.some(u => u.username === username)) {
            alert("Tên đăng nhập này đã tồn tại!");
            return;
        }

        // Lưu tài khoản mới
        users.push({ username, email, password });
        localStorage.setItem(DB_KEY, JSON.stringify(users));

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "login.html";
    });

    // ==================================================
    // 3. XỬ LÝ ĐĂNG NHẬP (LOGIN)
    // ==================================================
    $("#login-form").on("submit", function(e) {
        e.preventDefault();

        const inputUser = $("#login-username").val().trim();
        const inputPass = $("#login-password").val().trim();

        // Lấy danh sách user
        let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];

        // Tìm user khớp cả tên và mật khẩu
        const validUser = users.find(u => 
            (u.username === inputUser || u.email === inputUser) && u.password === inputPass
        );

        if (validUser) {
            // Đăng nhập thành công
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", validUser.username);
            
            alert("Đăng nhập thành công! Chào mừng " + validUser.username);
            window.location.href = "index.html";
        } else {
            // Đăng nhập thất bại
            alert("Sai tên đăng nhập hoặc mật khẩu! Vui lòng kiểm tra lại.");
        }
    });

    // ==================================================
    // 4. XỬ LÝ ĐĂNG XUẤT (LOGOUT)
    // ==================================================
    $(document).on("click", "#btn-logout", function(e) {
        e.preventDefault();
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            // localStorage.removeItem("favorites"); // Có thể bỏ comment nếu muốn xóa cả list yêu thích
            
            alert("Đã đăng xuất.");
            window.location.reload(); // Tải lại trang để cập nhật giao diện
        }
    });

    // ==================================================
    // 5. CÁC TIỆN ÍCH KHÁC
    // ==================================================
    // Toggle menu khách trên header
    $(document).on("click", "#btn-member-menu", function(e) {
        e.stopPropagation();
        $("#guest-dropdown").toggleClass("hidden");
    });
    $(document).click(function() { $("#guest-dropdown").addClass("hidden"); });
});