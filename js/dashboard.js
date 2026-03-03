base_dir = "/mnt/kimi/output/phytosanitary-system"

# 9. js/dashboard.js - لوحة التحكم
dashboard_js = '''// لوحة التحكم والإحصائيات
const CERTS_KEY = 'phytosanitary_certificates';

// الحصول على الشهادات
function getCertificates() {
    return JSON.parse(localStorage.getItem(CERTS_KEY) || '[]');
}

// تحديث الإحصائيات
function updateStats() {
    const certs = getCertificates();
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // إجمالي الشهادات
    document.getElementById('totalCerts').textContent = certs.length;
    
    // شهادات اليوم
    const todayCerts = certs.filter(c => new Date(c.createdAt).toDateString() === today);
    document.getElementById('todayCerts').textContent = todayCerts.length;
    
    // شهادات الشهر
    const monthCerts = certs.filter(c => {
        const date = new Date(c.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    document.getElementById('monthCerts').textContent = monthCerts.length;
    
    // عدد الدول
    const countries = [...new Set(certs.map(c => c.country))];
    document.getElementById('totalCountries').textContent = countries.length;
}

// تحديث آخر الشهادات
function updateRecentTable() {
    const certs = getCertificates();
    const recent = certs.slice(-5).reverse(); // آخر 5 شهادات
    
    const tbody = document.getElementById('recentTableBody');
    if (!tbody) return;
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد شهادات مسجلة</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(cert => `
        <tr>
            <td><strong>${cert.serialNo}</strong></td>
            <td>${new Date(cert.createdAt).toLocaleDateString('ar-SA')}</td>
            <td>${cert.exporterName}</td>
            <td>${cert.importerName}</td>
            <td>${cert.country}</td>
            <td><span class="status-badge status-active">نشطة</span></td>
            <td>
                <button onclick="viewCertificate('${cert.id}')" class="btn-icon">👁️</button>
                <button onclick="printCert('${cert.id}')" class="btn-icon">🖨️</button>
            </td>
        </tr>
    `).join('');
}

// عرض الشهادة
function viewCertificate(id) {
    window.location.href = `view.html?id=${id}`;
}

// طباعة شهادة
function printCert(id) {
    const certs = getCertificates();
    const cert = certs.find(c => c.id == id);
    if (cert) {
        // فتح نافذة الطباعة مع البيانات
        const printWindow = window.open('', '_blank');
        printWindow.document.write(generatePrintHTML(cert));
        printWindow.document.close();
        printWindow.print();
    }
}

// إنشاء HTML للطباعة
function generatePrintHTML(cert) {
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>شهادة ${cert.serialNo}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .cert-template { border: 3px solid #1b5e20; padding: 30px; max-width: 800px; margin: 0 auto; }
                .cert-header { text-align: center; border-bottom: 2px solid #1b5e20; padding-bottom: 20px; margin-bottom: 20px; }
                .cert-title { color: #1b5e20; font-size: 24px; margin: 10px 0; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #333; padding: 10px; text-align: center; }
                th { background: #f0f0f0; }
            </style>
        </head>
        <body>
            <div class="cert-template">
                <div class="cert-header">
                    <h2>وزارة الثروة الزراعية والسمكية وموارد المياه</h2>
                    <h3>المديرية العامة - محافظة البريمي</h3>
                    <h1 class="cert-title">شهادة الصحة النباتية</h1>
                    <p>رقم الشهادة: ${cert.serialNo}</p>
                </div>
                <div class="cert-body">
                    <div class="info-row"><span class="label">المصدر:</span> ${cert.exporterName}</div>
                    <div class="info-row"><span class="label">المستورد:</span> ${cert.importerName}</div>
                    <div class="info-row"><span class="label">الدولة:</span> ${cert.country}</div>
                    <table>
                        <tr><th>المنتج</th><th>الفئة</th><th>الكمية</th><th>الطرود</th></tr>
                        ${cert.products.map(p => `<tr><td>${p.name}</td><td>${p.class}</td><td>${p.quantity}</td><td>${p.packages}</td></tr>`).join('')}
                    </table>
                </div>
            </div>
        </body>
        </html>
    `;
}

// الرسوم البيانية
function initCharts() {
    const certs = getCertificates();
    
    // بيانات الشهادات الشهرية
    const monthlyData = getMonthlyData(certs);
    const ctx1 = document.getElementById('monthlyChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'عدد الشهادات',
                    data: monthlyData.data,
                    backgroundColor: '#1b5e20',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
    
    // بيانات الدول
    const countryData = getCountryData(certs);
    const ctx2 = document.getElementById('countriesChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: countryData.labels,
                datasets: [{
                    data: countryData.data,
                    backgroundColor: ['#1b5e20', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// الحصول على البيانات الشهرية
function getMonthlyData(certs) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data = new Array(12).fill(0);
    
    certs.forEach(cert => {
        const month = new Date(cert.createdAt).getMonth();
        data[month]++;
    });
    
    return { labels: months, data };
}

// الحصول على بيانات الدول
function getCountryData(certs) {
    const counts = {};
    certs.forEach(cert => {
        counts[cert.country] = (counts[cert.country] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
        labels: sorted.map(x => x[0]),
        data: sorted.map(x => x[1])
    };
}

// نافذة التحقق
function verifyCertificate() {
    document.getElementById('verifyModal').style.display = 'block';
}

function closeVerifyModal() {
    document.getElementById('verifyModal').style.display = 'none';
}

function performVerification() {
    const serial = document.getElementById('verifySerial').value;
    const code = document.getElementById('verifyCode').value;
    const resultEl = document.getElementById('verifyResult');
    
    if (!serial || !code) {
        resultEl.innerHTML = '<p style="color:red;">يرجى إدخال جميع البيانات</p>';
        return;
    }
    
    const certs = getCertificates();
    const cert = certs.find(c => c.serialNo === serial && c.verifyCode === code);
    
    if (cert) {
        resultEl.innerHTML = `
            <div style="background:#e8f5e9; padding:15px; border-radius:8px; margin-top:10px;">
                <h4 style="color:#2e7d32;">✅ الشهادة صحيحة</h4>
                <p><strong>المصدر:</strong> ${cert.exporterName}</p>
                <p><strong>المستورد:</strong> ${cert.importerName}</p>
                <p><strong>التاريخ:</strong> ${new Date(cert.createdAt).toLocaleDateString('ar-SA')}</p>
            </div>
        `;
    } else {
        resultEl.innerHTML = '<p style="color:red;">❌ لم يتم العثور على الشهادة - البيانات غير صحيحة</p>';
    }
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard-content')) {
        updateStats();
        updateRecentTable();
        initCharts();
    }
});

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('verifyModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
