# Ayam Geprek Mamank - Frontend

Aplikasi web frontend untuk pemesanan Ayam Geprek Mamank, dibangun menggunakan **Next.js** dan **Tailwind CSS**.

## 🚀 Fitur Utama

*   **Menu Digital:** Menampilkan daftar menu makanan dan minuman.
*   **Keranjang Belanja:** Manajemen item pesanan sebelum checkout.
*   **Checkout Otomatis:** Integrasi pembayaran online menggunakan **Pakasir**.
*   **Cek Status Pesanan:** Halaman detail pesanan dengan update status realtime dan tombol cek pembayaran manual.
*   **Admin Dashboard:** Panel admin untuk mengelola menu, kategori, dan melihat laporan penjualan.

## 🛠️ Teknologi

*   [Next.js 14](https://nextjs.org/) (App Router)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React](https://lucide.dev/) (Icons)
*   [Framer Motion](https://www.framer.com/motion/) (Animations)

## 📦 Instalasi & Menjalankan

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Konfigurasi Environment:**
    Buat file `.env` di root folder frontend dan isi dengan:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3001/api"
    ```
    *Sesuaikan URL jika backend berjalan di port berbeda.*

3.  **Jalankan Server Development:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📂 Struktur Folder

*   `src/app`: Halaman-halaman website (App Router).
    *   `(user)`: Halaman publik (Menu, Pesanan).
    *   `admin`: Halaman khusus admin (Login, Dashboard).
*   `src/components`: Komponen UI yang dapat digunakan kembali (Navbar, CartSidebar, dll).
*   `src/context`: State management global (CartContext).
*   `src/lib`: Konfigurasi dan utility functions.

## 💳 Alur Pembayaran (Pakasir)

1.  User memilih menu dan masuk ke keranjang.
2.  Saat checkout, user otomatis diarahkan ke halaman pembayaran **Pakasir**.
3.  Setelah bayar, user kembali ke halaman detail pesanan.
4.  User bisa menekan tombol **"Cek Status Pembayaran"** untuk memverifikasi pembayaran secara instan.
