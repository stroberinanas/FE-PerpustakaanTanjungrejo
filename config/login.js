// const API_URL = "http://localhost:3000";
const API_URL = "https://lunchbox-overripe-heroism.ngrok-free.dev/";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");
  message.style.color = "#c62828";
  message.textContent = "";

  if (!username || !password) {
    message.textContent = "Username dan password wajib diisi.";
    return;
  }


  try {
    const res = await fetch(
      `${API_URL}/admin/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );
    const data = await res.json();

    console.log("Response:", data);

    if (res.ok && data.token) {
      console.log("Menyimpan token:", data.token);

      localStorage.setItem("adminToken", data.token);

      console.log(
        "Isi localStorage:",
        localStorage.getItem("adminToken")
      );

      window.location.href = "/dashboard";
    } else {
      message.textContent = data.error || "Login gagal.";
    }
  } catch (err) {
    console.error("Login error:", err);
    message.textContent = "Terjadi kesalahan koneksi.";
  }
});
