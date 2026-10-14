let MODEL_URL = "./model/";

let dataAbsensi =
    JSON.parse(localStorage.getItem("absensi")) || [];

let model;
let video;

let suaraTerakhir = "";
let historyTerakhir = "";

let faceDetection;
let wajahTerdeteksi = false;

let hasilDeteksi = "";

function generateIDWaktu() {

    const now = new Date();

    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const tanggal = String(now.getDate()).padStart(2, "0");

    const jam = String(now.getHours()).padStart(2, "0");
    const menit = String(now.getMinutes()).padStart(2, "0");
    const detik = String(now.getSeconds()).padStart(2, "0");

    return `${hari}${tanggal}${bulan}${tahun}-${jam}${menit}${detik}`;
}

// =====================
// INIT SISTEM
// =====================
async function init() {

    try {

        console.log("Memulai sistem...");

        await tf.setBackend("cpu");
        await tf.ready();

        console.log("Backend:", tf.getBackend());

        // =====================
        // LOAD MODEL
        // =====================
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        console.log("Model berhasil dimuat");

        // =====================
        // VIDEO
        // =====================
        video = document.getElementById("video");

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        video.width = 320;
        video.height = 320;

        console.log("Video berhasil dimainkan");

        // =====================
        // STATUS UI
        // =====================
        document.getElementById("statusLamp").style.background = "green";
        document.getElementById("statusText").innerHTML = "Sistem Aktif";

        // =====================
        // FACE DETECTION
        // =====================
        faceDetection = new FaceDetection({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            }
        });

        faceDetection.setOptions({
            model: "short",
            minDetectionConfidence: 0.5
        });

        faceDetection.onResults(onFaceResults);

        // =====================
        // START LOOP (AMAN)
        // =====================
        await new Promise(r => setTimeout(r, 1000));

        loop();

    } catch (error) {
        console.log(error);
        alert("ERROR:\n" + error);
    }
}


// =====================
// LOOP UTAMA
// =====================
async function loop() {

    try {

        await predict();

        if (faceDetection) {
            await faceDetection.send({ image: video });
        }

    } catch (e) {
        console.log(e);
    }

    requestAnimationFrame(loop);
}


// =====================
// PREDICT MASKER
// =====================
async function predict() {

    if (!model) return;

    try {

        const prediction = await model.predict(video);

        let hasil = "";
        let nilai = 0;

        for (let i = 0; i < prediction.length; i++) {

            if (prediction[i].probability > nilai) {
                nilai = prediction[i].probability;
                hasil = prediction[i].className;
            }
        }

        hasilDeteksi = hasil;

        // =====================
        // TAMPILKAN HASIL
        // =====================
        document.getElementById("hasil").innerHTML =
            hasil + "<br>" + Math.round(nilai * 100) + "%";

        // =====================
        // FACE STATUS
        // =====================
        document.getElementById("faceStatus").innerHTML =
            wajahTerdeteksi ? "😊 Wajah Terdeteksi" : "❌ Tidak Ada Wajah";

        // =====================
        // SUARA
        // =====================
        if (hasil !== suaraTerakhir) {

            let suara = new SpeechSynthesisUtterance();

            suara.text =
                (hasil === "Memakai Masker")
                    ? "Masker terdeteksi"
                    : "Masker tidak terdeteksi";

            speechSynthesis.speak(suara);
            suaraTerakhir = hasil;
        }

    } catch (error) {
        console.log("Predict Error:", error);
    }
}


// =====================
// FACE RESULT
// =====================
async function onFaceResults(results) {

    wajahTerdeteksi =
        results.detections &&
        results.detections.length > 0;
}


// =====================
// CAPTURE & ABSENSI
// =====================
function captureWajah() {

    const nama =
        document.getElementById("namaInput").value;

    if (!nama) {
        alert("Masukkan nama dulu!");
        return;
    }

    const canvas = document.getElementById("snapshot");
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    document.getElementById("preview").src = imageData;

    // ambil status bersih (tanpa persen)
    const hasilText = document.getElementById("hasil").innerText || "";
    const statusMasker = hasilText.split("\n")[0].trim();

    const now = new Date();

    const waktu = now.toLocaleTimeString();
    const waktuFull = now.toISOString();

    const item = document.createElement("li");

    // =====================
    // SIMPAN DATA ABSENSI
    // =====================
    dataAbsensi.push({
        id: generateID(),
        nama: nama,
        status: statusMasker,
        waktu: waktu,
        waktuFull: now.toISOString(),
        tanggalKey: now.toDateString(), // ⭐ INI PENTING
        foto: imageData
    });
    localStorage.setItem(
        "absensi",
        JSON.stringify(dataAbsensi)
    );

    renderChart();

    renderHistoryGrouped();

    renderCalendar();

    const list = document.getElementById("historyList");

    const li = document.createElement("li");
    li.innerHTML = `${nama} - ${statusMasker} - ${waktu}`;

    list.prepend(li);

    // =====================
    // TAMBAH KE TABEL
    // =====================
    const table = document.getElementById("absensiTable");
    const row = table.insertRow();

    row.insertCell(0).innerHTML = nama;
    row.insertCell(1).innerHTML = statusMasker;
    row.insertCell(2).innerHTML = waktu;

    alert("Absensi berhasil disimpan!");
}


// =====================
// LOAD TABEL SAAT BUKA
// =====================
function loadTabelAbsensi() {
    renderTabel(dataAbsensi);
}


// =====================
// AUTO LOAD
// =====================
window.onload = function () {

    dataAbsensi = JSON.parse(localStorage.getItem("absensi")) || []

    loadTabelAbsensi();
    applyAllFilters();

    renderHistoryGrouped();
    renderCalendar();
    renderChart();
};

function renderTabel(data) {

    const table = document.getElementById("absensiTable");

    table.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Foto</th>
        </tr>
    `;

    data.forEach((item) => {

        const row = table.insertRow();

        row.insertCell(0).innerHTML = item.id;
        row.insertCell(1).innerHTML = item.nama;
        row.insertCell(2).innerHTML = item.status;
        row.insertCell(3).innerHTML = item.waktu;

        const cellFoto = row.insertCell(4);

        const img = document.createElement("img");
        img.src = item.foto;
        img.width = 60;
        img.style.borderRadius = "8px";
        img.style.cursor = "pointer";

        // ⭐ TAMBAHAN ZOOM CLICK
        img.onclick = function () {
            openModal(item.foto);
        };

        cellFoto.appendChild(img);
    });
}

function filterData() {

    applyAllFilters();
}

function searchData() {

    const keyword = document.getElementById("searchInput").value.toLowerCase();

    let data = dataAbsensi;

    // kalau ada keyword, filter nama
    if (keyword) {
        data = dataAbsensi.filter(item =>
            item.nama.toLowerCase().includes(keyword)
        );
    }

    renderTabel(data);
}

function applyAllFilters() {

    const filter = document.getElementById("filterAbsensi").value;
    const keyword = document.getElementById("searchInput").value.toLowerCase();

    let data = dataAbsensi;

    // =====================
    // FILTER HARI INI
    // =====================
    if (filter === "today") {

        const today = new Date().toDateString();

        data = data.filter(item => {
            return new Date(item.waktuFull).toDateString() === today;
        });
    }

    // =====================
    // SEARCH NAMA
    // =====================
    if (keyword) {
        data = data.filter(item =>
            item.nama.toLowerCase().includes(keyword)
        );
    }

    renderTabel(data);
}

function exportExcel() {

    if (dataAbsensi.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }

    // siapkan data
    const data = dataAbsensi.map(item => ({
        ID: item.id,
        Nama: item.nama,
        Status: item.status,
        Waktu: item.waktu
    }));

    // buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

    // download file
    XLSX.writeFile(workbook, "data-absensi.xlsx");
}

function generateID() {

    const hariNama = [
        "Minggu", "Senin", "Selasa",
        "Rabu", "Kamis", "Jumat", "Sabtu"
    ];

    const now = new Date();

    const hari = hariNama[now.getDay()];
    const tanggal = String(now.getDate()).padStart(2, "0");
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const tahun = now.getFullYear();

    const jam = String(now.getHours()).padStart(2, "0");
    const menit = String(now.getMinutes()).padStart(2, "0");
    const detik = String(now.getSeconds()).padStart(2, "0");

    return `${hari}${tanggal}${bulan}${tahun}-${jam}${menit}${detik}`;
}

function groupByDate(data) {

    const grouped = {};

    data.forEach(item => {

        const key = item.tanggalKey;

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(item);
    });

    return grouped;
}

function renderHistoryGrouped() {

    const container = document.getElementById("historyList");

    container.innerHTML = "";

    const grouped = groupByDate(dataAbsensi);

    const keys = Object.keys(grouped).reverse(); // terbaru di atas

    keys.forEach(date => {

        // header tanggal
        const header = document.createElement("h3");
        header.innerText = "📅 " + date;
        header.style.marginTop = "15px";

        container.appendChild(header);

        // isi data per hari
        grouped[date].forEach(item => {

            const li = document.createElement("li");

            li.innerHTML = `
                ${item.nama} - ${item.status} - ${item.waktu}
            `;

            container.appendChild(li);
        });
    });
}

function getUniqueDates(data) {

    const dates = data.map(item => item.tanggalKey);

    return [...new Set(dates)].reverse(); // unik + terbaru di atas
}

function renderCalendar() {

    const container = document.getElementById("calendarFilter");

    container.innerHTML = "";

    // tombol semua hari
    const allBtn = document.createElement("button");
    allBtn.innerText = "Semua Hari";

    allBtn.onclick = () => {
        renderHistoryGrouped();
    };

    container.appendChild(allBtn);

    // tombol tiap tanggal
    const dates = getUniqueDates(dataAbsensi);

    dates.forEach(date => {

        const btn = document.createElement("button");
        btn.innerText = date;

        btn.onclick = () => {
            filterByDate(date);
        };

        container.appendChild(btn);
    });
}

function filterByDate(date) {

    const container = document.getElementById("historyList");

    container.innerHTML = "";

    const filtered = dataAbsensi.filter(item => item.tanggalKey === date);

    // header
    const header = document.createElement("h3");
    header.innerText = "📅 " + date;
    container.appendChild(header);

    // isi data
    filtered.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${item.nama} - ${item.status} - ${item.waktu}
        `;

        container.appendChild(li);
    });
}

function getChartData() {

    const grouped = {};

    dataAbsensi.forEach(item => {

        const date = item.tanggalKey;

        if (!grouped[date]) {
            grouped[date] = 0;
        }

        grouped[date]++;
    });

    const labels = Object.keys(grouped).sort();
    const values = labels.map(date => grouped[date]);

    return { labels, values };
}

let chartInstance = null;

function renderChart() {

    const ctx = document.getElementById("absensiChart");

    const data = getChartData();

    // kalau chart sudah ada, hapus dulu (biar tidak double)
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Jumlah Absensi",
                data: data.values,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function openModal(src) {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");

    modal.style.display = "block";
    modalImg.src = src;
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}

document.addEventListener("click", function (e) {

    const modal = document.getElementById("imageModal");

    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function resetData() {
    const confirmReset = confirm("Yakin mau hapus semua data absensi?");

    if (!confirmReset) return;

    localStorage.removeItem("absensi");
    dataAbsensi = [];

    renderTabel([]);
    renderChart();
    renderHistoryGrouped();
    renderCalendar();

    alert("Data berhasil direset!");
}