$(document).ready(function () {
    
    // --- 1. LOGIC KIỂM TRA ĐĂNG NHẬP ---
    window.checkLoginStatus = function() {
        // Lấy dữ liệu từ bộ nhớ
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const username = localStorage.getItem("username") || "Thành viên"; // Lấy tên, nếu không có thì mặc định
        
        if ($("#guest-action-container").length === 0) return;

        if (isLoggedIn) {
            // Ẩn nút khách
            $("#guest-action-container").addClass("hidden");
            
            // Hiện Profile
            $("#user-profile").removeClass("hidden").addClass("flex");
            
            // CẬP NHẬT TÊN NGƯỜI DÙNG VÀO HEADER
            $("#username-display").text(username);
        } else {
            // Chưa đăng nhập -> Hiện nút khách, Ẩn profile
            $("#user-profile").addClass("hidden").removeClass("flex");
            $("#guest-action-container").removeClass("hidden");
        }
    };

    // --- 2. CÁC SỰ KIỆN NÚT BẤM (HEADER) ---

    // Nút mở menu Thành Viên
    $(document).on("click", "#btn-member-menu", function(e) {
        e.stopPropagation();
        $("#guest-dropdown").toggleClass("hidden");
    });

    // Nút Đăng Xuất
    $(document).on("click", "#btn-logout", function(e) {
        e.stopPropagation();
        if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // Xóa thông tin khỏi bộ nhớ
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("username");
            
            // Cập nhật lại giao diện
            window.checkLoginStatus();
        }
    });

    // Đóng menu khi click ra ngoài
    $(document).click(function() {
        if (!$("#guest-dropdown").hasClass("hidden")) {
            $("#guest-dropdown").addClass("hidden");
        }
    });

});