let allBooks = [];
let categories = {};

const categoryIcons = {
    Fiksi: "📖",
    "Non-Fiksi": "📚",
    Pendidikan: "🎓",
    Sejarah: "📜",
    Agama: "🕌",
    Sains: "🔬",
    Teknologi: "💻",
    Kesehatan: "🏥",
    Ekonomi: "💰",
    Hukum: "⚖️",
    Bahasa: "🗣️",
    Seni: "🎨",
    Olahraga: "⚽",
    Biografi: "👤",
    Referensi: "📋",
    "Anak-anak": "🧸",
    Remaja: "🌟",
    Dewasa: "👨‍💼",
    Umum: "📄",
};

const API_URL = "http://localhost:3000";

function getCategoryIcon(category) {
    return categoryIcons[category] || "📚";
}

function normalizeCategory(category) {
    if (!category) return "Umum";
    return (
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    );
}

async function fetchBooks() {
    try {
        const res = await fetch(
            `${API_URL}/books`
        );
        const data = await res.json();

        allBooks = data;
        processCategories();
        updateStats();
        renderFilterTabs();
        showCategory("all");
    } catch (err) {
        console.error("Gagal mengambil data buku:", err);
        document.getElementById("booksSection").innerHTML =
            '<div class="error-message">❌ Gagal mengambil data buku. Silakan coba lagi nanti.</div>';
    }
}

function processCategories() {
    categories = { all: allBooks };

    allBooks.forEach((book) => {
        const category = normalizeCategory(book.kategori);
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(book);
    });
}

function updateStats() {
    const totalBooks = allBooks.length;
    const totalCategories = Object.keys(categories).length - 1; // -1 karena 'all' bukan kategori
    const availableBooks = allBooks.filter((book) => book.stok > 0).length;

    document.getElementById("totalBooks").textContent = totalBooks;
    document.getElementById("totalCategories").textContent =
        totalCategories;
    document.getElementById("availableBooks").textContent = availableBooks;
}

function renderFilterTabs() {
    const filterTabs = document.getElementById("filterTabs");
    filterTabs.innerHTML =
        '<div class="filter-tab active" data-category="all">Semua Buku</div>';

    Object.keys(categories).forEach((category) => {
        if (category !== "all") {
            const tab = document.createElement("div");
            tab.className = "filter-tab";
            tab.dataset.category = category;
            tab.textContent = `${getCategoryIcon(category)} ${category}`;
            tab.onclick = () => showCategory(category);
            filterTabs.appendChild(tab);
        }
    });

    // Event listener untuk tab "Semua Buku"
    filterTabs.firstChild.onclick = () => showCategory("all");
}

function showCategory(selectedCategory) {
    // Update active tab
    document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.dataset.category === selectedCategory) {
            tab.classList.add("active");
        }
    });

    // Render books for selected category
    const booksSection = document.getElementById("booksSection");
    const books = categories[selectedCategory] || [];

    if (books.length === 0) {
        booksSection.innerHTML = `
            <div class="empty-category">
              ${getCategoryIcon(
            selectedCategory
        )} Belum ada buku dalam kategori ${selectedCategory === "all" ? "ini" : selectedCategory
            }
            </div>
          `;
        return;
    }

    const title =
        selectedCategory === "all"
            ? "Semua Koleksi Buku"
            : `Kategori ${selectedCategory}`;
    const icon =
        selectedCategory === "all" ? "📚" : getCategoryIcon(selectedCategory);

    booksSection.innerHTML = `
    <div class="category-section active">
        <h3 class="category-title" data-icon="${icon}">${title}</h3>
        <div class="books-card-grid" id="currentGrid"></div>
    </div>
    `;

    const grid = document.getElementById("currentGrid");

    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.animationDelay = `${index * 0.1}s`;

        const badgeClass =
            book.stok > 0 ? "book-stock-badge" : "book-stock-badge out";
        const badgeText = book.stok > 0 ? `Stok: ${book.stok}` : "Stok Habis";
        const categoryBadge =
            selectedCategory === "all"
                ? `<div class="category-badge">${normalizeCategory(
                    book.kategori
                )}</div>`
                : "";

        card.innerHTML = `
    <div class="book-img-wrap">
        ${categoryBadge}
        <img src="${book.link_gambar
            }" alt="cover" class="book-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWRjIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzFhMjM3ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+8J+TmjwvdGV4dD4KPC9zdmc+'" />
    </div>
    <div class="book-info">
        <h3 class="book-title">${book.judul}</h3>
        <div class="book-meta">
            <span>Penulis: <b>${book.penulis ? book.penulis : "-"
            }</b></span>
            <span>Penerbit: ${book.penerbit ? book.penerbit : "-"}</span>
            <span>Tahun: ${book.tahun_terbit ? book.tahun_terbit : "-"
            }</span>
        </div>
        <span class="${badgeClass}">${badgeText}</span>
    </div>
    `;
        grid.appendChild(card);
    });
}

document
    .getElementById("searchInput")
    .addEventListener("input", function () {
        const q = this.value.trim().toLowerCase();
        let filtered = allBooks;
        if (q) {
            filtered = allBooks.filter(
                (b) =>
                    (b.judul && b.judul.toLowerCase().includes(q)) ||
                    (b.penulis && b.penulis.toLowerCase().includes(q)) ||
                    (b.penerbit && b.penerbit.toLowerCase().includes(q))
            );
        }
        // Jika ada kategori aktif selain 'all', filter juga berdasarkan kategori
        let selectedCategory = "all";
        const activeTab = document.querySelector(".filter-tab.active");
        if (activeTab && activeTab.dataset.category) {
            selectedCategory = activeTab.dataset.category;
        }
        let booksToShow = filtered;
        if (selectedCategory !== "all") {
            booksToShow = filtered.filter(
                (b) =>
                    (b.kategori || "").toLowerCase() ===
                    selectedCategory.toLowerCase()
            );
        }
        // Render ulang
        showCategoryWithBooks(selectedCategory, booksToShow);
    });

// Helper untuk render kategori dengan data custom
function showCategoryWithBooks(selectedCategory, books) {
    // Update active tab
    document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.dataset.category === selectedCategory) {
            tab.classList.add("active");
        }
    });
    // Render books for selected category
    const booksSection = document.getElementById("booksSection");
    if (books.length === 0) {
        booksSection.innerHTML = `
            <div class="empty-category">
              📚 Tidak ditemukan buku sesuai pencarian/kategori
            </div>
          `;
        return;
    }
    const title =
        selectedCategory === "all"
            ? "Semua Koleksi Buku"
            : `Kategori ${selectedCategory}`;
    const icon =
        selectedCategory === "all" ? "📚" : getCategoryIcon(selectedCategory);
    booksSection.innerHTML = `
    <div class="category-section active">
        <h3 class="category-title" data-icon="${icon}">${title}</h3>
        <div class="books-card-grid" id="currentGrid"></div>
    </div>
    `;
    const grid = document.getElementById("currentGrid");
    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.animationDelay = `${index * 0.1}s`;
        const badgeClass =
            book.stok > 0 ? "book-stock-badge" : "book-stock-badge out";
        const badgeText = book.stok > 0 ? `Stok: ${book.stok}` : "Stok Habis";
        const categoryBadge =
            selectedCategory === "all"
                ? `<div class="category-badge">${normalizeCategory(
                    book.kategori
                )}</div>`
                : "";
        card.innerHTML = `
    <div class="book-img-wrap">
        ${categoryBadge}
        <img src="${book.link_gambar
            }" alt="cover" class="book-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWRjIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzFhMjM3ZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+8J+TmjwvdGV4dD4KPC9zdmc+'" />
    </div>
    <div class="book-info">
        <h3 class="book-title">${book.judul}</h3>
        <div class="book-meta">
            <span>Penulis: <b>${book.penulis ? book.penulis : "-"
            }</b></span>
            <span>Penerbit: ${book.penerbit ? book.penerbit : "-"}</span>
            <span>Tahun: ${book.tahun_terbit ? book.tahun_terbit : "-"
            }</span>
        </div>
        <span class="${badgeClass}">${badgeText}</span>
    </div>
    `;
        grid.appendChild(card);
    });
}

// Panggil fungsi saat halaman dimuat
fetchBooks();
