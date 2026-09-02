# PRD: Next-Gen Aesthetic QR Code Customizer & Generator

**Versi:** 2.1 (Multi-Device Responsive Edition)  
**Status:** Approved Draft  
**Dibuat oleh:** Hafid (Upgraded by Antigravity AI)  
**Tanggal Update:** 2 September 2026  

---

## 1. Overview

**Aesthetic QR Code Customizer & Generator** adalah platform web modern client-side yang memungkinkan pengguna membuat QR Code dengan tingkat kustomisasi visual tinggi. Aplikasi ini tidak hanya menghasilkan QR Code standar, tetapi juga memberikan kebebasan penuh dalam menambahkan **logo/gambar di tengah**, **efek gradien warna**, **variasi bentuk titik (dots) dan sudut (eyes)**, **frame/border menarik dengan Call-to-Action (CTA)**, serta **preset desain siap pakai**.

Aplikasi ini didesain secara **Fully Responsive & Adaptive** khusus untuk memberikan pengalaman pembuat QR Code yang seamless di semua perangkat, mulai dari **Handphone (iOS & Android)**, **Tablet**, hingga **Desktop Monitor Ultra-wide**.

Project ini dirancang sebagai **Fase 1** (Visual Customization Engine) yang responsif, cepat, tanpa login, dan privacy-first, sebelum melanjutkannya ke **Fase 2** (WebAR Interactive Experience).

---

## 2. Latar Belakang & Masalah

Kebanyakan QR Generator gratis di pasaran memiliki kelemahan:
1. **Desain Kaku & Membosankan:** Kebanyakan hanya menyediakan kotak hitam-putih standar tanpa estetika visual.
2. **Keterbatasan Logo:** Memasang logo sering kali merusak scannability (keterbacaan QR) karena tidak ada pengaturan *safe margin* atau *error correction level* otomatis.
3. **Fitur Kustomisasi Berbayar / Terkunci:** Pilihan warna gradien, bentuk dot unik, dan frame CTA sering kali dikunci di balik paywall.
4. **Tidak Mobile-Friendly:** Kebanyakan web QR generator di HP memiliki form yang berantakan, preview tertutup keyboard, dan tombol ekspor yang terpotong.
5. **Watermark & Iklan Mengganggu:** Platform gratisan sering menyelipkan watermark atau iklan yang merusak citra branding pengguna.
6. **Privasi Berisiko:** Banyak platform menyimpan data pengguna dan tautan ke server mereka (QR dinamis pihak ketiga yang bisa mati sewaktu-waktu).

**Solusi Kita:** Sebuah platform web yang gratis, 100% client-side (tanpa backend/privacy safe), responsif sempurna di Handphone & Desktop, serba guna, dan mampu menghasilkan QR Code visual kelas profesional hanya dalam hitungan detik.

---

## 3. Goals & Key Objectives

- **Visual Excellence & Customization:** Pengguna dapat mengkustomisasi logo di tengah, warna gradien, bentuk dot & eye, background, hingga frame CTA.
- **Cross-Device Responsive Design:** Tampilan adaptif sempurna di layar HP (Touch-optimized Bottom Sheet), Tablet, dan Desktop (2-Column Sticky Preview).
- **Real-Time Live Preview & Scannability Validator:** Setiap perubahan parameter langsung dirender < 100ms disertai indikator otomatis scannability (tingkat keamanan pemindaian).
- **Multi-Input Support:** Mendukung URL/Teks, Wi-Fi Quick Connect, vCard (Kartu Nama), WhatsApp, dan Media Sosial.
- **High-Resolution Multi-Format Export:** Ekspor hasil ke format PNG (hingga resolusi 4K), SVG (vector print-ready), dan PDF flyer template.
- **Zero Friction & Native Mobile Share:** Tanpa registrasi/login, tanpa watermark, 100% client-side, serta mendukung Web Share API untuk HP.

---

## 4. Non-Goals (Out of Scope untuk Fase 1)

- **Fase 2 (AR Integration):** Pengalaman pemindaian QR yang langsung membuka objek 3D/WebAR (`model-viewer`).
- **Dynamic QR & Analytics:** Pelacakan statistik scan dan pengubahan URL secara dinamis via cloud database (disimpan untuk iterasi mendatang).
- **User Account System:** Penyimpanan riwayat QR secara cloud-synced (saat ini disimpan di LocalStorage browser saja).

---

## 5. Fitur Utama & Kustomisasi Visual

### 5.1 Kustomisasi Logo & Gambar Tengah (Central Image Engine)
- **Upload Image:** Mendukung format PNG, JPG, SVG, dan WEBP (Mendukung kamera HP & Photo Library langsung).
- **Logo Shape Masking:** Pilihan potong gambar logo menjadi **Circle (Lingkaran)**, **Rounded Square**, **Square**, atau **Shield/Badge shape**.
- **Logo Sizing & Margin:** Slider persentase ukuran logo (10% hingga 30% dari total QR) dengan *safe-margin padding* otomatis agar tidak menutupi pola titik krusial.
- **Logo Styling & Effects:**
  - Background halo / padding warna di belakang logo (mencegah tabrakan warna logo dengan QR dots).
  - Border ring & drop shadow pada logo.
  - Opsi transparansi logo & logo opacity.
- **Auto Error Correction Level:** Otomatis menaikkan ECC ke level **H (High - 30% recovery)** saat logo diunggah.

### 5.2 Color & Gradient Styling Engine
- **Single Color vs Gradient:** Mendukung warna solid maupun gradien (Linear & Radial) untuk pola QR (foreground).
- **Gradient Controls:** Pilihan warna asal (*start color*), warna akhir (*stop color*), dan sudut gradien (angle 0° - 360°).
- **Independent Eye Coloring:** Pengaturan warna terpisah untuk Outer Eye Frame, Inner Eye Ball, dan Body Dots.
- **Background Customization:** Solid color, Gradient background, Transparan, dan Background Image Overlay.

### 5.3 Shape & Pattern Engine
- **Dot Styles:** Standard Square, Smooth Dots, Rounded Square, Extra-Rounded / Fluid, Classy / Diamond, Star.
- **Outer Eye Frame Styles:** Square, Rounded, Circle, Leaf, Hexagon.
- **Inner Eye Ball Styles:** Square, Circle, Diamond, Leaf.

### 5.4 Custom Frame & Call-to-Action (CTA) Cards
- **Pre-made Framing Options:** Bottom Banner ("SCAN ME", "SCAN TO CONNECT"), Top & Bottom Dual Frame, Circular Frame.
- **Frame Typography & Color:** Kustomisasi teks CTA, pilihan font (Inter, Montserrat, Outfit, Poppins), warna frame, dan warna teks.

### 5.5 Input Templates (Multi-Data Generator)
- **Link / URL / Text:** Input teks bebas atau tautan web.
- **Wi-Fi Network:** Input SSID, Password, dan Tipe Enkripsi (WPA/WPA2/WEP/Open).
- **vCard (Digital Business Card):** Nama Lengkap, Telepon, Email, Perusahaan, Jabatan, & Link Portofolio.
- **WhatsApp Quick Chat:** Nomor telepon & pesan draf otomatis.
- **Social Media Hub:** Tautan langsung ke Instagram, YouTube, TikTok, LinkedIn.

### 5.6 Preset Design Gallery (1-Click Styling)
- **Curated Templates:** Cyberpunk Neon, Minimalist Elegant, Pastel Delight, Corporate Professional, Spotify/Social Vibe.

### 5.7 Scannability Validator (Real-Time Safety Check)
- Indikator visual instan (Shield Icon: Green = Safe, Yellow = Caution, Red = Low Contrast / Risk).

---

### 5.8 Device Responsiveness & Adaptive UX Specs (New)

#### A. Handphone / Mobile Experience (< 768px - iOS & Android)
1. **Compact Sticky Live Header / Collapsible Preview:**
   - QR Canvas tetap terlihat kecil di bagian atas layar HP atau disembunyikan secara cerdas saat user mengetik teks panjang, sehingga tidak memakan ruang layar.
2. **Thumb-Friendly Bottom Sheet Customizer:**
   - Panel pengeditan warna, logo, dan bentuk disajikan dalam bentuk **Bottom Sheet / Drawer** yang bisa digeser naik-turun dengan jari (swipe-to-close).
   - Target sentuh (*touch target size*) minimal **44px x 44px** untuk menghindari salah tekan di layar HP.
3. **Floating Quick Preview & Export Bar:**
   - Tombol melayang (FAB) di bagian bawah layar HP untuk langsung memunculkan preview penuh (*Full-screen Modal*) dan tombol ekspor satu sentuhan.
4. **Native Mobile Share Integration:**
   - Menggunakan Web Share API (`navigator.share`) di HP untuk membagikan file QR secara langsung ke WhatsApp, Telegram, Instagram Story, atau Simpan ke Galeri Foto HP.

#### B. Desktop Experience (>= 1024px / Large Screens)
1. **2-Column Split-Screen Studio:**
   - **Kolom Kiri (Scrollable Control Panel):** Panel tab accordion lengkap untuk input data, upload logo, gradien, bentuk dot, dan frame CTA.
   - **Kolom Kanan (Sticky Preview Card):** Preview QR Code besar yang selalu mengikuti posisi scroll (sticky viewport) beserta indikator Scannability Safety Shield dan pilihan resolusi ekspor (PNG 4K, SVG, PDF).
2. **Drag & Drop File Upload:**
   - Pengguna desktop dapat drag-and-drop file gambar logo secara langsung ke area logo canvas.
3. **Keyboard Shortcuts:**
   - `Ctrl + S` / `Cmd + S` untuk ekspor cepat, `Ctrl + Z` untuk membatalkan perubahan gaya.

#### C. Tablet Experience (768px - 1023px)
1. **Adaptive Grid Layout:**
   - Layout 2-kolom ringkas atau stacked grid dengan sidebar collapsible untuk memaksimalkan ruang kerja pada iPad / Tablet Android baik dalam mode Portrait maupun Landscape.

---

## 6. Output & Export Features

- **PNG Export:** Pilihan resolusi tinggi (512px, 1024px, 2048px, hingga 4096px Ultra HD).
- **SVG Export:** Format vektor berbasis SVG yang scalable murni tanpa pixelated untuk pencetakan spanduk/kemasan.
- **PDF Printable Card:** Ekspor layout QR siap cetak lengkap dengan border potong.
- **Instant Copy & Web Share:** Copy image to clipboard di Desktop, Native Share di Handphone.

---

## 7. User Stories & Matrix

| # | Sebagai... | Saya ingin... | Supaya... |
|---|-----------|----------------|-----------|
| 1 | Mobile User (HP) | mengubah desain QR via Bottom Sheet yang ramah sentuhan jari | bisa mengedit QR dengan nyaman hanya menggunakan satu tangan di HP |
| 2 | Mobile User (HP) | langsung membagikan hasil QR via tombol Native Share HP | QR bisa dikirim langsung ke WhatsApp atau disimpan di Galeri HP |
| 3 | Desktop Designer | melihat live preview besar yang sticky di sebelah panel kontrol | perubahan warna/logo terlihat instan tanpa perlu scroll atas-bawah |
| 4 | Creator / Designer | menambahkan logo brand di tengah QR dengan border halus | QR terlihat profesional & sesuai identitas brand |
| 5 | Marketer | memberikan warna gradien menarik dan frame "SCAN ME" | meningkatkan *conversion rate* (jumlah orang yang scan) |
| 6 | Print Designer | mengekspor hasil ke format SVG vektor resolusi tinggi | gambar QR tidak pecah saat dicetak di baliho/kemasan |

---

## 8. Non-Functional Requirements & Responsive Standards

- **Performance & Adaptive Rendering:**
  - Rendering Canvas real-time < 100ms.
  - On low-end mobile devices, WebGL Shader canvas background otomatis menyesuaikan pixel ratio (`pixelRatio = 1`) untuk menjaga performa tetap lancar 60fps tanpa membuat HP panas atau boros baterai.
- **Responsive Breakpoints:**
  - `Mobile Small`: 320px - 479px
  - `Mobile Large`: 480px - 767px
  - `Tablet`: 768px - 1023px
  - `Desktop`: 1024px - 1439px
  - `Ultra-wide`: >= 1440px
- **Modern Aesthetic UI:** Dark/Light Glassmorphism dengan animasi mikro yang responsif.
- **Privacy & Security:** 100% Client-Side. Tidak ada data pengguna yang dikirim ke server.

---

## 9. Tech Stack Recommendation

- **Framework:** Next.js (App Router, React 19) / Vite + React.
- **QR Core Engine:** `qr-code-styling` + HTML5 Canvas API.
- **Styling & Responsive UI:** Tailwind CSS dengan responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`).
- **Icons & Mobile Drawers:** Lucide React Icons + Vaul / Framer Motion (untuk smooth mobile bottom sheets).
- **Export & Share Helper:** `file-saver`, Web Share API (`navigator.share`).

---

## 10. Revised Milestones & Action Plan

| Tahap | Focus / Deliverables |
|-------|----------------------|
| **Phase 1: Foundation & Core Responsive Layout** | Setup Next.js/Vite project, integrasi split desktop layout & mobile drawer layout dasar. |
| **Phase 2: Advanced Logo & Shape Engine** | Upload logo dari HP/Desktop, shape mask, margin adjustment, auto ECC level H, dot & eye styling. |
| **Phase 3: Color, Gradient & Frame Engine** | Linear/Radial gradient picker, independent eye colors, custom CTA frame banner. |
| **Phase 4: Responsive Bottom Sheet & Presets** | Integrasi Mobile Bottom Sheet UI untuk HP, real-time contrast validator, 6+ preset 1-click gallery. |
| **Phase 5: Native Share, High-Res Export & Polish** | Web Share API (HP), PNG 4K export, SVG vector export, dark/light liquid glass theme polish. |

---

## 11. Success Metrics

- Pengalaman pengguna 100% lancar dan tidak ada elemen UI yang terpotong/overflow baik di iPhone, Android, Tablet, maupun Desktop Monitor.
- Waktu dari buka web di HP hingga dapat file/share QR < 30 detik.
- Scannability rate 100% pada kamera HP iOS dan Android.
