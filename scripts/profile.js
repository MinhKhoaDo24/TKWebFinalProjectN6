document.addEventListener("DOMContentLoaded", () => {
  // Logic login của bạn đang dùng 2 key này
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username");

  // Nếu chưa đăng nhập -> đá về login
  if (!isLoggedIn || !username) {
    alert("Bạn cần đăng nhập để xem hồ sơ.");
    window.location.href = "login.html";
    return;
  }

  // Lấy user từ cine_users (mảng user bạn lưu)
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("cine_users")) || [];
  } catch (e) {
    users = [];
  }
  const user = users.find((u) => u && u.username === username);

  // Fill thông tin
  const pfName = document.getElementById("pf-name");
  const pfUsername = document.getElementById("pf-username");
  const pfEmail = document.getElementById("pf-email");
  const pfStatus = document.getElementById("pf-status");
  const pfAvatar = document.getElementById("pf-avatar");

  pfName.textContent = user?.fullName || username;
  pfUsername.textContent = username;
  pfEmail.textContent = user?.email || "—";
  pfStatus.textContent = "Đã đăng nhập";

  // Avatar: dùng chữ cái đầu username
  const firstChar = (username || "U").trim().charAt(0).toUpperCase();
  pfAvatar.src = `https://placehold.co/240x240/111/FFF?text=${encodeURIComponent(firstChar)}`;

  // Lấy lịch sử xem (nếu bạn đang lưu KEY watch_history_v1)
  const KEY = "watch_history_v1";
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    history = [];
  }

  document.getElementById("pf-watched").textContent = String(history.length);

  const recent = history[0];
  document.getElementById("pf-recent").textContent =
    recent?.title ? recent.title : "Chưa có lịch sử xem";

  // Logout
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  });
});
