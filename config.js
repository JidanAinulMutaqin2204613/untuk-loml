// ============================================================
//  KONFIGURASI — cukup edit file ini aja ✏️
//  Yang ada tanda ⚠️ wajib kamu ganti.
// ============================================================
window.CONFIG = {
  nama: "loml",
  pengirim: "aku", // ⚠️ nama/panggilan kamu, muncul di tanda tangan surat

  // Web terkunci (layar countdown) sampai waktu ini — pakai jam lokal HP dia
  bukaPada: "2026-10-07T00:00:00",

  // ⚠️ Tanggal jadian asli (format TAHUN-BULAN-TANGGAL).
  // Dipakai buat penghitung "hari bersama" + jawaban kuis no.1
  tanggalJadian: "2025-10-01T00:00:00",

  jumlahLilin: 3,

  // Opsional: taruh lagu kalian di assets/lagu.mp3 (diputar di surat).
  // Kalau file-nya gak ada, gapapa — web tetap jalan.
  lagu: "assets/lagu.mp3",

  // ---------- LV.1 Kuis gerbang ----------
  // jawaban: daftar jawaban yang diterima (huruf besar/kecil, spasi & tanda baca diabaikan)
  // "BEBAS" = jawaban apa pun dianggap benar (asal tidak kosong)
  // "TANGGAL_JADIAN" = otomatis menerima 1-10, 01/10, 1 oktober 2025, dst.
  // pesanBenar (opsional) = pesan khusus saat jawaban benar
  kuis: [
    {
      tanya: "Tanggal berapa kita pertama kali ketemu? 📅",
      jawaban: "BEBAS",
      pesanBenar: "BENAR! ✓\nApa pun tanggalnya, hari itu tetap jadi hari favoritku ♥",
    },
    {
      tanya: "Aku biasa manggil kamu apa? 💬",
      jawaban: ["loml", "love of my life", "sayang", "sayangku", "babe", "my baby", "bb"],
      petunjuk: "4 huruf. Singkatan. Artinya kamu segalanya.",
    },
    {
      tanya: "Di mana kencan pertama kita? 📍",
      jawaban: ["taman supratman", "sekolah"], // ⚠️ GANTI, boleh lebih dari satu: ["mall a", "mal a"]
      petunjuk: "malu-malu kamu teh",
    },
  ],

  pesanSalah: [
    "Yakin kamu pacarku? 🤨",
    "Hmm... mencurigakan. Coba lagi.",
    "Salah! Aku pura-pura gak liat ya 🙈",
    "AKSES DITOLAK. Penyusup terdeteksi 🚨",
    "Masa lupa sih... 🥲",
    "Ehem. Sekali lagi, sayang.",
  ],

  // ---------- LV.3 Galeri ----------
  // Taruh foto di folder assets/foto/ dengan nama yang sama persis.
  // Bisa tambah/kurangi baris sesukamu.
  foto: [
    { src: "assets/foto/1.jpeg", caption: "Foto pertama kita 📷" },
    { src: "assets/foto/2.jpeg", caption: "Kita waktu ngedate ke curug pertama kali" },
    { src: "assets/foto/3.jpeg", caption: "Kencan favoritku" },
    { src: "assets/foto/4.jpeg", caption: "Muka bangun tidurmu (maaf 🙏)" },
    { src: "assets/foto/5.jpeg", caption: "Liburan kita ✈️" },
    { src: "assets/foto/6.jpeg", caption: "Ini kita, setahun kemudian ♥" },
  ],

  // ---------- LV.4 Kupon gosok ----------
  kupon: [
    { emoji: "🍜", teks: "Bebas pilih tempat makan, aku yang bayar" },
    { emoji: "💆", teks: "Pijat 30 menit, tanpa protes" },
    { emoji: "🏆", teks: "1x menang debat otomatis" },
    { emoji: "🎬", teks: "Movie date, kamu pilih filmnya (aku gak boleh tidur)" },
  ],

  // ---------- LV.5 Surat ----------
  // Satu string = satu paragraf. {nama} & {pengirim} otomatis diganti.
  surat: [
    "Hai {nama},",
    "Selamat ulang tahun! 🎂 Hari ini semua orang merayakan hari lahirmu, dan aku merayakan betapa beruntungnya aku punya kamu.",
    "Udah setahun kita bareng. Setahun penuh tawa, chat panjang sampai ketiduran, debat soal mau makan apa, dan banyak momen kecil yang diam-diam jadi favoritku.",
    "Makasih udah sabar sama aku, udah jadi tempat pulang paling nyaman, dan udah jadi kamu — versi yang paling aku sayang.",
    "Semoga di umur yang baru kamu makin bahagia, makin sehat, dan semua yang kamu semogakan pelan-pelan jadi nyata. Aku bakal ada di sana, nyemangatin dari barisan paling depan.",
    "Level berikutnya: kita berdua. Siap main bareng lagi? ♥",
  ],
};
