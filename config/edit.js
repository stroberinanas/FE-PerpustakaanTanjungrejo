// const API_URL = "http://localhost:3000";
const API_URL = "https://lunchbox-overripe-heroism.ngrok-free.dev/";
const form = document.getElementById("editForm");
const message = document.getElementById("message");
const urlParams = new URLSearchParams(window.location.search);
const id_buku = urlParams.get("id");

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
  fetchBook();
})();

async function fetchBook() {
  try {
    const token = getToken();
    const res = await fetch(
      `${API_URL}/admin/books/${id_buku}`,
      { headers: { Authorization: "Bearer " + token } }
    );

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    document.getElementById("judul").value = data.judul || "";
    document.getElementById("penulis").value = data.penulis || "";
    document.getElementById("penerbit").value = data.penerbit || "";
    document.getElementById("tahun_terbit").value = data.tahun_terbit || "";
    document.getElementById("jumlah_halaman").value = data.jumlah_halaman || "";
    document.getElementById("kategori").value = data.kategori || "";
    document.getElementById("stok").value = data.stok || "";
    document.getElementById("link_gambar").value = data.link_gambar || "";
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = err.message || "Gagal mengambil data buku";
    form.style.display = "none";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();

  const dataBuku = {
    judul: document.getElementById("judul").value.trim(),
    penulis: document.getElementById("penulis").value.trim(),
    penerbit: document.getElementById("penerbit").value.trim(),
    tahun_terbit: parseInt(document.getElementById("tahun_terbit").value) || 0,
    jumlah_halaman:
      parseInt(document.getElementById("jumlah_halaman").value) || 0,
    kategori: document.getElementById("kategori").value,
    stok: parseInt(document.getElementById("stok").value) || 0,
    link_gambar: document.getElementById("link_gambar").value.trim(),
  };

  if (!dataBuku.judul) {
    message.style.color = "red";
    message.textContent = "Judul buku wajib diisi";
    return;
  }

  try {
    const res = await fetch(
      `${API_URL}/admin/books/${id_buku}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(dataBuku),
      }
    );

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "Data buku berhasil diperbarui!";

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || " Gagal memperbarui buku";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = " Terjadi kesalahan pada server";
  }
});

fetchBook();
