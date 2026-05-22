// const API_URL = "http://localhost:3000";
const API_URL = "https://lunchbox-overripe-heroism.ngrok-free.dev/";

const form = document.getElementById("tambahForm");
const message = document.getElementById("message");
const inputJudul = document.getElementById("judul");
const inputPenulis = document.getElementById("penulis");
const inputPenerbit = document.getElementById("penerbit");
const inputTahun = document.getElementById("tahun_terbit");
const inputHalaman = document.getElementById("jumlah_halaman");
const inputKategori = document.getElementById("kategori");
const inputStok = document.getElementById("stok");
const inputGambar = document.getElementById("link_gambar");

let allBooks = [];

function getToken() {
  return localStorage.getItem("adminToken");
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
      headers: { Authorization: "Bearer " + token },
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
  fetchBooks();
})();

async function fetchBooks() {
  try {
    const token = getToken();
    const res = await fetch(
      `${API_URL}/admin/books`,
      { method: "GET", headers: { Authorization: "Bearer " + token } }
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    allBooks = data;
  } catch (err) {
    console.error("Error:", err);
    message.style.color = "red";
    message.textContent = "Gagal memuat data buku. Silakan refresh halaman.";
  }
}

inputJudul.addEventListener("input", () => {
  const inputValue = inputJudul.value.trim().toLowerCase();
  const match = allBooks.find(
    (book) => book.judul && book.judul.toLowerCase() === inputValue
  );

  if (match) {
    inputPenulis.value = match.penulis || "";
    inputPenerbit.value = match.penerbit || "";
    inputTahun.value = match.tahun_terbit || "";
    inputHalaman.value = match.jumlah_halaman || "";
    inputKategori.value = match.kategori || "";
    inputGambar.value = match.link_gambar || "";
    message.style.color = "orange";
    message.textContent = "⚠️ Judul sudah ada. Anda hanya dapat menambah stok.";
  } else {
    inputPenulis.value = "";
    inputPenerbit.value = "";
    inputTahun.value = "";
    inputHalaman.value = "";
    inputKategori.value = "";
    inputGambar.value = "";
    message.textContent = "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();

  const dataBuku = {
    judul: inputJudul.value.trim(),
    penulis: inputPenulis.value.trim(),
    penerbit: inputPenerbit.value.trim(),
    tahun_terbit: parseInt(inputTahun.value) || 0,
    jumlah_halaman: parseInt(inputHalaman.value) || 0,
    kategori: inputKategori.value,
    stok: parseInt(inputStok.value) || 0,
    link_gambar: inputGambar.value.trim(),
  };

  if (!dataBuku.judul) {
    message.style.color = "red";
    message.textContent = "Judul buku wajib diisi";
    return;
  }

  if (dataBuku.stok < 0) {
    message.style.color = "red";
    message.textContent = "Stok tidak boleh negatif";
    return;
  }

  // Cek apakah buku sudah ada berdasarkan judul
  const existingBook = allBooks.find(
    (book) =>
      book.judul && book.judul.toLowerCase() === dataBuku.judul.toLowerCase()
  );

  if (existingBook) {
    message.style.color = "red";
    message.textContent =
      "Judul sudah ada. Silakan edit buku dari dashboard untuk menambah stok.";
    return;
  }

  try {
    const res = await fetch(
      `${API_URL}/admin/books`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(dataBuku),
      }
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/login";
      return;
    }

    const result = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Buku berhasil ditambahkan!";
      form.reset();
      await fetchBooks(); // refresh data

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } else {
      message.style.color = "red";
      message.textContent = result.error || "Gagal menambah buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Terjadi kesalahan pada server";
  }
});

document.addEventListener("DOMContentLoaded", fetchBooks);
