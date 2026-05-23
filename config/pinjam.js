// const API_URL = "http://localhost:3000";
const API_URL = "https://lunchbox-overripe-heroism.ngrok-free.dev";

const form = document.getElementById("pinjamForm");
const message = document.getElementById("message");
const bookDetailDiv = document.getElementById("bookDetail");
const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

// CORS bypass (ngrok)
const isVercel = window.location.hostname.includes('vercel.app');

function getFetchHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(isVercel ? { "ngrok-skip-browser-warning": "true" } : {})
  };
}

function getToken() {
  return localStorage.getItem("adminToken");
}

if (!id_buku) {
  message.style.color = "red";
  message.textContent = "ID buku tidak valid";
  form.style.display = "none";
}

async function requireAdminSession() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  const res = await fetch(
    `${API_URL}/admin/books`,

    {
      method: "GET",
      headers: getFetchHeaders({ Authorization: "Bearer " + token }),
    }
  );
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
}

(async function () {
  await requireAdminSession();
  loadBook();
})();

async function loadBook() {
  try {
    const token = getToken();
    const res = await fetch(
      `${API_URL}/admin/books/${id_buku}`,
      {
        headers: getFetchHeaders({ Authorization: "Bearer " + token }),
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    bookDetailDiv.innerHTML = `
      <p><strong>${data.judul || "-"}</strong> oleh ${data.penulis || "-"}<br/>
      Penerbit: ${data.penerbit || "-"}, Tahun: ${data.tahun_terbit || "-"}<br/>
      Stok tersedia: ${data.stok || 0}</p>
    `;

    if (data.stok <= 0) {
      form.style.display = "none";
      message.style.color = "red";
      message.textContent = "Stok habis. Tidak bisa dipinjam.";
    }
  } catch (err) {
    console.error(err);
    bookDetailDiv.innerHTML = `<p style="color:red">${err.message || "Gagal memuat data buku"
      }</p>`;
    form.style.display = "none";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();

  const peminjaman = {
    id_buku,
    nama_peminjam: document.getElementById("nama_peminjam").value.trim(),
    alamat_peminjam: document.getElementById("alamat_peminjam").value.trim(),
    tanggal_peminjaman: document.getElementById("tanggal_pinjam").value,
  };

  if (!peminjaman.nama_peminjam) {
    message.style.color = "red";
    message.textContent = "Nama peminjam wajib diisi";
    return;
  }
  if (!peminjaman.alamat_peminjam) {
    message.style.color = "red";
    message.textContent = "Alamat peminjam wajib diisi";
    return;
  }

  try {
    const res = await fetch(
      `${API_URL}/admin/pinjam`,
      {
        method: "POST",
        headers: getFetchHeaders({
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        }),
        body: JSON.stringify(peminjaman),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Peminjaman berhasil dicatat!";
      form.reset();

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Gagal meminjam buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server";
  }
});
