AI Smart Attendance System
Sistem Absensi Cerdas Berbasis Web dengan Deteksi Masker menggunakan Kecerdasan Buatan.
Deskripsi:
AI Smart Attendance System merupakan aplikasi absensi berbasis web yang mengintegrasikan kecerdasan buatan untuk mendeteksi penggunaan masker melalui kamera. Sistem ini menggabungkan klasifikasi gambar dan deteksi wajah untuk membantu proses pencatatan kehadiran yang dilengkapi dokumentasi foto.
Sistem menggunakan model *machine learning* yang dilatih melalui Teachable Machine dan dijalankan di browser menggunakan TensorFlow.js. Sementara itu, MediaPipe Face Detection digunakan untuk mendeteksi keberadaan wajah di depan kamera.
Catatan: Sistem dapat mendeteksi keberadaan wajah, tetapi belum dapat mengenali identitas seseorang secara otomatis. Nama peserta absensi dimasukkan secara manual.

Fitur Utama
- Deteksi penggunaan masker secara langsung melalui kamera.
- Deteksi keberadaan wajah menggunakan MediaPipe.
- Pencatatan kehadiran dengan dokumentasi foto.
- Notifikasi suara berdasarkan hasil deteksi masker.
- Riwayat absensi dan filter berdasarkan tanggal.
- Pencarian data absensi berdasarkan nama.
- Ekspor data absensi ke Excel.
- Visualisasi statistik kehadiran.
- Penyimpanan data absensi menggunakan LocalStorage pada browser.

Teknologi yang Digunakan

- HTML — menyusun struktur halaman web.
- CSS — mengatur tampilan dan desain antarmuka.
- JavaScript — mengelola logika aplikasi dan interaksi pengguna.
- TensorFlow.js — menjalankan model machine learning di browser.
- Teachable Machine — melatih model klasifikasi gambar.
- MediaPipe Face Detection — mendeteksi keberadaan wajah.
- Chart.js — menampilkan visualisasi statistik.
- SheetJS (XLSX) — mengekspor data absensi ke Excel.
- LocalStorage — menyimpan data absensi di browser.

Struktur Proyek
```text
smart-attendance/
├── model/
├── index.html
├── style.css
├── script.js
├── .gitignore
└── README.md
```

Folder `model/` berisi file model machine learning yang digunakan untuk melakukan klasifikasi penggunaan masker.

Cara Menjalankan Aplikasi

1. Unduh atau lakukan *clone* repository ini.
2. Buka folder proyek menggunakan Visual Studio Code.
3. Jalankan file `index.html` menggunakan server lokal, misalnya ekstensi Live Server.
4. Izinkan akses kamera ketika browser memintanya.
5. Uji fitur deteksi masker dan pencatatan absensi.

Penyimpanan Data
Data absensi disimpan menggunakan LocalStorage pada browser. Data tersebut tersimpan secara lokal dan tidak otomatis tersinkronisasi dengan perangkat atau browser lain.

Keterbatasan Sistem
- Nama peserta absensi masih dimasukkan secara manual.
- Deteksi wajah hanya mendeteksi keberadaan wajah, bukan mengenali identitas seseorang.
- Hasil klasifikasi masker dapat dipengaruhi oleh pencahayaan, kualitas kamera, dan data pelatihan model.
- Data absensi di LocalStorage bergantung pada browser yang digunakan.

Pengembang
Elfasarin27-dot

GitHub: [@elfasarin27-dot](https://github.com/elfasarin27-dot)
