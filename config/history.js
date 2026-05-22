// const API_URL = "http://localhost:3000";
const API_URL = "https://lunchbox-overripe-heroism.ngrok-free.dev";

const tableBody = document.getElementById("historyTableBody");

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
    `${API_URL}/admin/history`,
    { method: "GET", headers: { Authorization: "Bearer " + token } }
  );
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res.json();
}

async function fetchHistory() {
  try {
    const data = await requireAdminSession();
    renderHistory(data);
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="error">
          Gagal mengambil riwayat peminjaman. Silakan login ulang.
        </td>
      </tr>
    `;
  }
}

async function kembalikan(id) {
  if (confirm("Yakin ingin mengembalikan buku ini?")) {
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/admin/history/${id}`,
        {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (res.ok) {
        alert("Buku berhasil dikembalikan.");
        fetchHistory();
      } else {
        alert("❌ " + (data.error || "Gagal mengembalikan buku."));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server.");
    }
  }
}

function renderHistory(data) {
  tableBody.innerHTML = "";
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="8" class="error">Belum ada riwayat peminjaman.</td></tr>';
    return;
  }
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
     <td>
        <img src="${item.link_gambar || ""}" alt="cover" class="book-img"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjVmNWRjIi8+PHRleHQgeD0iMTUiIHk9IjIwIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjEwIj7wn5ObPC90ZXh0Pjwvc3ZnPg=='" />
      </td>
      <td>${item.judul || "-"}</td>
      <td>${item.nama_peminjam || "-"}</td>
      <td>${item.alamat_peminjam || "-"}</td>
      <td>${item.tanggal_peminjaman || "-"}</td>
      <td>${item.tanggal_pengembalian || "-"}</td>
      <td>${item.status || "-"}</td>
      <td>
        ${item.status === "Dipinjam"
        ? `<button onclick="kembalikan(${item.id})">Kembalikan</button>`
        : "-"
      }
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.kembalikan = kembalikan;
document.addEventListener("DOMContentLoaded", fetchHistory);
