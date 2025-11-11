// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Ihwanudin
// KELAS: WPH REP
// TANGGAL: 11 November
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 detik dalam milidetik
const DAYS_IN_WEEK = 7;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()

const userProfile = {
  name: 'Ihwanudin',
  joinDate: new Date(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Method untuk update statistik user menggunakan filter()
  updateStats: function (habits) {
    this.totalHabits = habits.length;
    // Filter habits yang sudah selesai minggu ini
    const completed = habits.filter((habit) => habit.isCompletedThisWeek());
    this.completedThisWeek = completed.length;
  },

  // Method untuk menghitung berapa hari user sudah bergabung
  getDaysJoined: function () {
    const today = new Date();
    const diffTime = Math.abs(today - this.joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
};

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()

class Habit {
  constructor(name, targetFrequency) {
    this.id = Date.now() + Math.random(); // ID unik untuk setiap habit
    this.name = name;
    this.targetFrequency = targetFrequency; // Target penyelesaian per minggu
    this.completions = []; // Array untuk menyimpan tanggal penyelesaian
    this.createdAt = new Date();
  }

  // Method untuk menandai habit sebagai selesai hari ini
  markComplete() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam ke 00:00:00

    // Cek apakah sudah diselesaikan hari ini menggunakan find()
    const alreadyCompleted = this.completions.find((dateStr) => {
      const completionDate = new Date(dateStr);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === today.getTime();
    });

    // Jika belum diselesaikan hari ini, tambahkan ke array completions
    if (!alreadyCompleted) {
      this.completions.push(today.toISOString());
      return true;
    }
    return false;
  }

  // Method untuk menghitung jumlah penyelesaian minggu ini menggunakan filter()
  getThisWeekCompletions() {
    const today = new Date();
    const weekStart = new Date(today);
    // Hitung hari pertama minggu ini (Minggu)
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Filter completions yang ada di minggu ini
    const thisWeekCompletions = this.completions.filter((dateStr) => {
      const completionDate = new Date(dateStr);
      return completionDate >= weekStart;
    });

    return thisWeekCompletions.length;
  }

  // Method untuk mengecek apakah habit sudah selesai minggu ini
  isCompletedThisWeek() {
    return this.getThisWeekCompletions() >= this.targetFrequency;
  }

  // Method untuk menghitung persentase progress
  getProgressPercentage() {
    const completed = this.getThisWeekCompletions();
    const percentage = Math.round((completed / this.targetFrequency) * 100);
    return Math.min(percentage, 100); // Maksimal 100%
  }

  // Method untuk mendapatkan status habit (Aktif/Selesai)
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }

  // Method untuk membuat progress bar ASCII
  getProgressBar() {
    const percentage = this.getProgressPercentage();
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;

    const filled = '█'.repeat(filledBlocks);
    const empty = '░'.repeat(emptyBlocks);

    return `${filled}${empty} ${percentage}%`;
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// - Constructor
// - Method addHabit(name, frequency)
// - Method completeHabit(habitIndex)
// - Method deleteHabit(habitIndex)
// - Method displayProfile()
// - Method displayHabits(filter)
// - Method displayHabitsWithWhile()
// - Method displayHabitsWithFor()
// - Method displayStats()
// - Method startReminder()
// - Method showReminder()
// - Method stopReminder()
// - Method saveToFile()
// - Method loadFromFile()
// - Method clearAllData()

class HabitTracker {
  constructor() {
    this.habits = []; // Array untuk menyimpan semua habits
    this.reminderTimer = null; // Timer untuk reminder otomatis
    this.loadFromFile(); // Load data dari file saat inisialisasi
  }

  // ========== CRUD OPERATIONS ==========

  // Method untuk menambah habit baru
  addHabit(name, frequency) {
    // Nullish coalescing operator untuk default values
    const habitName = name ?? 'Habit Baru';
    const targetFreq = frequency ?? DAYS_IN_WEEK;

    const newHabit = new Habit(habitName, targetFreq);
    this.habits.push(newHabit);
    this.saveToFile();

    return newHabit;
  }

  // Method untuk menandai habit selesai berdasarkan index
  completeHabit(habitIndex) {
    // Nullish coalescing untuk handle index yang tidak valid
    const habit = this.habits[habitIndex - 1] ?? null;

    if (habit) {
      const success = habit.markComplete();
      if (success) {
        this.saveToFile();
        userProfile.updateStats(this.habits);
        return true;
      }
    }
    return false;
  }

  // Method untuk menghapus habit berdasarkan index
  deleteHabit(habitIndex) {
    if (habitIndex > 0 && habitIndex <= this.habits.length) {
      this.habits.splice(habitIndex - 1, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  // ========== DISPLAY METHODS ==========

  // Method untuk menampilkan profil user
  displayProfile() {
    console.log('\n==================================================');
    console.log('                  PROFIL PENGGUNA                 ');
    console.log('==================================================');
    console.log(`Nama          : ${userProfile.name}`);
    console.log(
      `Bergabung     : ${userProfile.joinDate.toLocaleDateString('id-ID')}`
    );
    console.log(`Hari Bergabung: ${userProfile.getDaysJoined()} hari`);

    // Update statistik sebelum ditampilkan
    userProfile.updateStats(this.habits);
    console.log(`Total Habits  : ${userProfile.totalHabits}`);
    console.log(
      `Selesai       : ${userProfile.completedThisWeek} habits minggu ini`
    );
    console.log('==================================================\n');
  }

  // Method untuk menampilkan habits dengan filter tertentu
  displayHabits(filter) {
    let habitsToShow = this.habits;
    let title = 'SEMUA KEBIASAAN';

    // Gunakan filter() untuk menyaring habits berdasarkan tipe
    if (filter === 'active') {
      habitsToShow = this.habits.filter((h) => !h.isCompletedThisWeek());
      title = 'KEBIASAAN AKTIF (Belum Selesai)';
    } else if (filter === 'completed') {
      habitsToShow = this.habits.filter((h) => h.isCompletedThisWeek());
      title = 'KEBIASAAN SELESAI (Target Tercapai)';
    }

    console.log('\n==================================================');
    console.log(title);
    console.log('==================================================');

    if (habitsToShow.length === 0) {
      console.log('Tidak ada kebiasaan dalam kategori ini.');
    } else {
      // forEach untuk iterasi dan menampilkan setiap habit
      habitsToShow.forEach((habit) => {
        const actualIndex = this.habits.indexOf(habit) + 1;
        console.log(`\n${actualIndex}. [${habit.getStatus()}] ${habit.name}`);
        console.log(`   Target       : ${habit.targetFrequency}x/minggu`);
        console.log(
          `   Progress     : ${habit.getThisWeekCompletions()}/${
            habit.targetFrequency
          } (${habit.getProgressPercentage()}%)`
        );
        console.log(`   Progress Bar : ${habit.getProgressBar()}`);
      });
    }

    console.log('==================================================\n');
  }

  // Method untuk demo while loop - tampilkan habits menggunakan while
  displayHabitsWithWhile() {
    console.log('\n==================================================');
    console.log('        DEMO WHILE LOOP - LIST HABITS            ');
    console.log('==================================================');

    if (this.habits.length === 0) {
      console.log('Tidak ada habits untuk ditampilkan.');
    } else {
      let i = 0;
      // While loop untuk iterasi
      while (i < this.habits.length) {
        const habit = this.habits[i];
        console.log(
          `${i + 1}. ${
            habit.name
          } - [${habit.getStatus()}] - ${habit.getProgressPercentage()}%`
        );
        i++;
      }
    }

    console.log('==================================================\n');
  }

  // Method untuk demo for loop - tampilkan habits menggunakan for
  displayHabitsWithFor() {
    console.log('\n==================================================');
    console.log('         DEMO FOR LOOP - LIST HABITS             ');
    console.log('==================================================');

    if (this.habits.length === 0) {
      console.log('Tidak ada habits untuk ditampilkan.');
    } else {
      // For loop untuk iterasi
      for (let i = 0; i < this.habits.length; i++) {
        const habit = this.habits[i];
        console.log(`${i + 1}. ${habit.name}`);
        console.log(`   Status: ${habit.getStatus()}`);
        console.log(`   Progress: ${habit.getProgressBar()}`);
      }
    }

    console.log('==================================================\n');
  }

  // Method untuk menampilkan statistik menggunakan array methods
  displayStats() {
    console.log('\n==================================================');
    console.log('            STATISTIK KEBIASAAN                  ');
    console.log('==================================================');

    // Total habits
    console.log(`Total Kebiasaan      : ${this.habits.length}`);

    // Gunakan filter() untuk active habits
    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    console.log(`Kebiasaan Aktif      : ${activeHabits.length}`);

    // Gunakan filter() untuk completed habits
    const completedHabits = this.habits.filter((h) => h.isCompletedThisWeek());
    console.log(`Kebiasaan Selesai    : ${completedHabits.length}`);

    if (this.habits.length > 0) {
      // Gunakan map() untuk mendapatkan semua persentase
      const percentages = this.habits.map((h) => h.getProgressPercentage());

      // Hitung rata-rata progress
      const avgProgress =
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      console.log(`Rata-rata Progress   : ${avgProgress.toFixed(1)}%`);

      // Gunakan map() untuk mendapatkan nama habits
      const habitNames = this.habits.map((h) => h.name);
      console.log(`\nDaftar Habits:`);
      habitNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });

      // Find habit dengan progress tertinggi
      const bestHabit = this.habits.reduce((best, current) => {
        return current.getProgressPercentage() > best.getProgressPercentage()
          ? current
          : best;
      });
      console.log(
        `\nHabit Terbaik        : ${
          bestHabit.name
        } (${bestHabit.getProgressPercentage()}%)`
      );

      // Find habit dengan progress terendah
      const worstHabit = this.habits.reduce((worst, current) => {
        return current.getProgressPercentage() < worst.getProgressPercentage()
          ? current
          : worst;
      });
      console.log(
        `Perlu Ditingkatkan   : ${
          worstHabit.name
        } (${worstHabit.getProgressPercentage()}%)`
      );
    }

    console.log('==================================================\n');
  }

  // ========== REMINDER SYSTEM ==========

  // Method untuk memulai reminder timer menggunakan setInterval
  startReminder() {
    // Stop existing reminder jika ada
    this.stopReminder();

    // Set interval untuk menampilkan reminder setiap 10 detik
    this.reminderTimer = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);

    console.log('✓ Reminder otomatis diaktifkan (setiap 10 detik)\n');
  }

  // Method untuk menampilkan reminder habit yang belum selesai
  showReminder() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter habits yang belum diselesaikan hari ini
    const incompleteToday = this.habits.filter((habit) => {
      // Cek apakah sudah diselesaikan hari ini menggunakan find()
      const completedToday = habit.completions.find((dateStr) => {
        const completionDate = new Date(dateStr);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === today.getTime();
      });

      return !completedToday && !habit.isCompletedThisWeek();
    });

    if (incompleteToday.length > 0) {
      // Pilih habit random untuk reminder
      const randomIndex = Math.floor(Math.random() * incompleteToday.length);
      const randomHabit = incompleteToday[randomIndex];

      console.log('\n==================================================');
      console.log(`⏰ REMINDER: Jangan lupa "${randomHabit.name}"!`);
      console.log(
        `   Progress: ${randomHabit.getProgressPercentage()}% (${randomHabit.getThisWeekCompletions()}/${
          randomHabit.targetFrequency
        })`
      );
      console.log('==================================================\n');
    }
  }

  // Method untuk menghentikan reminder timer
  stopReminder() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

  // ========== FILE OPERATIONS ==========

  // Method untuk menyimpan data ke file JSON
  saveToFile() {
    try {
      const data = {
        userProfile: {
          name: userProfile.name,
          joinDate: userProfile.joinDate,
          totalHabits: userProfile.totalHabits,
          completedThisWeek: userProfile.completedThisWeek,
        },
        habits: this.habits,
      };

      // JSON.stringify untuk convert object ke string JSON
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData);
    } catch (error) {
      console.error('❌ Error menyimpan data:', error.message);
    }
  }

  // Method untuk memuat data dari file JSON
  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        // Baca file JSON
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');

        // JSON.parse untuk convert string JSON ke object
        const data = JSON.parse(jsonData);

        // Load user profile dengan nullish coalescing
        userProfile.name = data.userProfile?.name ?? 'Ihwanudin';
        userProfile.joinDate = new Date(
          data.userProfile?.joinDate ?? new Date()
        );
        userProfile.totalHabits = data.userProfile?.totalHabits ?? 0;
        userProfile.completedThisWeek =
          data.userProfile?.completedThisWeek ?? 0;

        // Load habits - restore dari plain object ke Habit class
        this.habits = (data.habits || []).map((h) => {
          const habit = new Habit(h.name, h.targetFrequency);
          habit.id = h.id;
          habit.completions = h.completions || [];
          habit.createdAt = new Date(h.createdAt);
          return habit;
        });

        console.log('✓ Data berhasil dimuat dari file\n');
      }
    } catch (error) {
      console.error('❌ Error memuat data:', error.message);
      this.habits = [];
    }
  }

  // Method untuk menghapus semua data
  clearAllData() {
    this.habits = [];
    this.saveToFile();
    console.log('✓ Semua data berhasil dihapus!\n');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)

// Function untuk menanyakan pertanyaan dan mengembalikan Promise
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// TODO: Buat function displayMenu()

// Function untuk menampilkan menu utama
function displayMenu() {
  console.log('\n==================================================');
  console.log('          HABIT TRACKER - MAIN MENU              ');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('==================================================');
}

// TODO: Buat async function handleMenu(tracker)

// Function async untuk handle menu user dengan switch-case
async function handleMenu(tracker) {
  let running = true;

  // While loop untuk keep aplikasi running
  while (running) {
    displayMenu();
    const choice = await askQuestion('Pilih menu (0-9): ');

    // Switch case untuk handle setiap pilihan menu
    switch (choice) {
      case '1':
        // Menu 1: Lihat Profil
        tracker.displayProfile();
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '2':
        // Menu 2: Lihat Semua Kebiasaan
        tracker.displayHabits('all');
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '3':
        // Menu 3: Lihat Kebiasaan Aktif
        tracker.displayHabits('active');
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '4':
        // Menu 4: Lihat Kebiasaan Selesai
        tracker.displayHabits('completed');
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '5':
        // Menu 5: Tambah Kebiasaan Baru
        console.log('\n=== TAMBAH KEBIASAAN BARU ===');
        const habitName = await askQuestion('Nama kebiasaan: ');
        const frequency = await askQuestion(
          `Target per minggu (1-${DAYS_IN_WEEK}): `
        );

        const targetFreq = parseInt(frequency) || DAYS_IN_WEEK;

        // Validasi input
        if (targetFreq < 1 || targetFreq > DAYS_IN_WEEK) {
          console.log(`❌ Target harus antara 1-${DAYS_IN_WEEK}!`);
        } else {
          const newHabit = tracker.addHabit(habitName, targetFreq);
          console.log(`✓ Kebiasaan "${newHabit.name}" berhasil ditambahkan!`);
        }
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '6':
        // Menu 6: Tandai Kebiasaan Selesai
        tracker.displayHabits('all');
        const completeIndex = await askQuestion(
          'Pilih nomor habit yang selesai: '
        );

        const index = parseInt(completeIndex);
        if (tracker.completeHabit(index)) {
          console.log('✓ Habit berhasil ditandai selesai hari ini!');
        } else {
          console.log(
            '❌ Habit sudah diselesaikan hari ini atau nomor tidak valid.'
          );
        }
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '7':
        // Menu 7: Hapus Kebiasaan
        tracker.displayHabits('all');
        const deleteIndex = await askQuestion(
          'Pilih nomor habit yang akan dihapus: '
        );

        const delIndex = parseInt(deleteIndex);
        if (tracker.deleteHabit(delIndex)) {
          console.log('✓ Habit berhasil dihapus!');
        } else {
          console.log('❌ Nomor tidak valid.');
        }
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '8':
        // Menu 8: Lihat Statistik
        tracker.displayStats();
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '9':
        // Menu 9: Demo Loop
        console.log('\n=== DEMO WHILE & FOR LOOP ===\n');
        tracker.displayHabitsWithWhile();
        await askQuestion('Tekan Enter untuk melihat for loop...');
        tracker.displayHabitsWithFor();
        await askQuestion('Tekan Enter untuk melanjutkan...');
        break;

      case '0':
        // Menu 0: Keluar
        console.log('\n==================================================');
        console.log('   Terima kasih telah menggunakan Habit Tracker!  ');
        console.log('        Semangat mencapai tujuan Anda! 💪         ');
        console.log('==================================================\n');
        tracker.stopReminder();
        running = false;
        rl.close();
        break;

      default:
        console.log('❌ Pilihan tidak valid. Silakan pilih 0-9.');
        await askQuestion('Tekan Enter untuk melanjutkan...');
    }
  }
}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()

async function main() {
  // Clear console dan tampilkan banner
  console.clear();
  console.log('==================================================');
  console.log('     🎯 HABIT TRACKER CLI - CHALLENGE 3 🎯      ');
  console.log('==================================================');
  console.log('   Kelola kebiasaan harian Anda dengan mudah!    ');
  console.log('==================================================');
  console.log('   NAMA   : Ihwanudin                            ');
  console.log('   KELAS  : WPH REP                              ');
  console.log('   TANGGAL: 11 November 2025                     ');
  console.log('==================================================\n');

  // Buat instance HabitTracker
  const tracker = new HabitTracker();

  // Tanyakan apakah ingin menambah data demo
  const addDemo = await askQuestion('Tambah data demo? (y/n): ');

  if (addDemo.toLowerCase() === 'y') {
    // Tambah habits demo
    tracker.addHabit('Minum Air 8 Gelas', 7);
    tracker.addHabit('Olahraga 30 Menit', 5);
    tracker.addHabit('Baca Buku 30 Menit', 5);
    tracker.addHabit('Meditasi 10 Menit', 7);
    tracker.addHabit('Menulis Jurnal', 3);

    // Complete beberapa habits untuk demo
    tracker.completeHabit(1);
    tracker.completeHabit(2);
    tracker.completeHabit(3);
    tracker.completeHabit(4);

    console.log('✓ Data demo berhasil ditambahkan!\n');
  }

  // Start reminder otomatis
  tracker.startReminder();

  // Jalankan aplikasi
  await handleMenu(tracker);
}

// TODO: Jalankan main() dengan error handling
main().catch((error) => {
  console.error('❌ Error:', error);
  rl.close();
});
