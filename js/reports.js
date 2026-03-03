base_dir = "/mnt/kimi/output/phytosanitary-system"

# 11. js/reports.js - التقارير
reports_js = '''// نظام التقارير والإحصائيات
const CERTS_KEY = 'phytosanitary_certificates';

// الحصول على الشهادات
function getCertificates() {
    return JSON.parse(localStorage.getItem(CERTS_KEY) || '[]');
}

// تغيير نوع التقرير
function changeReportType() {
    const type = document.getElementById('reportType').value;
    
    // إخفاء جميع الفلاتر
    document.getElementById('dayFilter').style.display = 'none';
    document.getElementById('monthFilter').style.display = 'none';
    document.getElementById('yearFilter').style.display = 'none';
    document.getElementById('customFilter').style.display = 'none';
    
    // إظهار الفلتر المناسب
    switch(type) {
        case 'daily':
            document.getElementById('dayFilter').style.display = 'flex';
            document.getElementById('reportDate').valueAsDate = new Date();
            break;
        case 'monthly':
            document.getElementById('monthFilter').style.display = 'flex';
            const now = new Date();
            document.getElementById('reportMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            break;
        case 'yearly':
            document.getElementById('yearFilter').style.display = 'flex';
            break;
        case 'custom':
            document.getElementById('customFilter').style.display = 'flex';
            break;
    }
}

// إنشاء التقرير
function generateReport() {
    const type = document.getElementById('reportType').value;
    let filteredCerts = [];
    const allCerts = getCertificates();
    
    switch(type) {
        case 'daily':
            const date = document.getElementById('reportDate').value;
            filteredCerts = allCerts.filter(c => {
                const certDate = new Date(c.createdAt).toISOString().split('T')[0];
                return certDate === date;
            });
            break;
            
        case 'monthly':
            const monthVal = document.getElementById('reportMonth').value; // YYYY-MM
            if (monthVal) {
                const [year, month] = monthVal.split('-');
                filteredCerts = allCerts.filter(c => {
                    const d = new Date(c.createdAt);
                    return d.getFullYear() == year && (d.getMonth() + 1) == month;
                });
            }
            break;
            
        case 'yearly':
            const year = document.getElementById('reportYear').value;
            filteredCerts = allCerts.filter(c => {
                return new Date(c.createdAt).getFullYear() == year;
            });
            break;
            
        case 'custom':
            const from = document.getElementById('dateFrom').value;
            const to = document.getElementById('dateTo').value;
            if (from && to) {
                filteredCerts = allCerts.filter(c => {
                    const certDate = new Date(c.createdAt);
                    return certDate >= new Date(from) && certDate <= new Date(to);
                });
            }
            break;
    }
    
    updateSummary(filteredCerts);
    updateCharts(filteredCerts, type);
    updateTable(filteredCerts);
}

// تحديث الملخص
function updateSummary(certs) {
    const totalCerts = certs.length;
    const totalProducts = certs.reduce((sum, c) => sum + c.products.length, 0);
    const totalPackages = certs.reduce((sum, c) => {
        return sum + c.products.reduce((pSum, p) => pSum + (parseInt(p.packages) || 0), 0);
    }, 0);
    const countries = [...new Set(certs.map(c => c.country))];
    
    document.getElementById('totalCount').textContent = totalCerts;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalPackages').textContent = totalPackages;
    document.getElementById('countriesCount').textContent = countries.length;
}

// تحديث الرسوم البيانية
function updateCharts(certs, type) {
    // تدمير الرسوم السابقة إن وجدت
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.destroy();
    });
    
    // رسم الشهادات حسب اليوم/الشهر
    const timeData = getTimeData(certs, type);
    const ctx1 = document.getElementById('dailyChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: timeData.labels,
                datasets: [{
                    label: 'عدد الشهادات',
                    data: timeData.data,
                    borderColor: '#1b5e20',
                    backgroundColor: 'rgba(27, 94, 32, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
    
    // رسم الدول
    const countryData = getCountryData(certs);
    const ctx2 = document.getElementById('countriesChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: countryData.labels,
                datasets: [{
                    label: 'عدد الشهادات',
                    data: countryData.data,
                    backgroundColor: ['#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a', '#81c784', '#a5d6a7']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
    
    // رسم المنتجات
    const productData = getProductData(certs);
    const ctx3 = document.getElementById('productsChart');
    if (ctx3) {
        new Chart(ctx3, {
            type: 'pie',
            data: {
                labels: productData.labels,
                datasets: [{
                    data: productData.data,
                    backgroundColor: ['#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } }
                }
            }
        });
    }
    
    // رسم الأغراض
    const purposeData = getPurposeData(certs);
    const ctx4 = document.getElementById('purposeChart');
    if (ctx4) {
        new Chart(ctx4, {
            type: 'doughnut',
            data: {
                labels: purposeData.labels,
                datasets: [{
                    data: purposeData.data,
                    backgroundColor: ['#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// الحصول على بيانات الوقت
function getTimeData(certs, type) {
    const counts = {};
    
    certs.forEach(cert => {
        const date = new Date(cert.createdAt);
        let key;
        
        if (type === 'daily') {
            key = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        } else if (type === 'monthly') {
            key = date.getDate() + '';
        } else {
            key = date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
        }
        
        counts[key] = (counts[key] || 0) + 1;
    });
    
    // ترتيب حسب الوقت
    const sorted = Object.entries(counts).sort((a, b) => {
        if (type === 'daily') return a[0].localeCompare(b[0]);
        return parseInt(a[0]) - parseInt(b[0]);
    });
    
    return {
        labels: sorted.map(x => x[0]),
        data: sorted.map(x => x[1])
    };
}

// الحصول على بيانات الدول
function getCountryData(certs) {
    const counts = {};
    certs.forEach(cert => {
        counts[cert.country] = (counts[cert.country] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
        labels: sorted.map(x => x[0]),
        data: sorted.map(x => x[1])
    };
}

// الحصول على بيانات المنتجات
function getProductData(certs) {
    const counts = {};
    certs.forEach(cert => {
        cert.products.forEach(p => {
            counts[p.name] = (counts[p.name] || 0) + 1;
        });
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
        labels: sorted.map(x => x[0]),
        data: sorted.map(x => x[1])
    };
}

// الحصول على بيانات الأغراض
function getPurposeData(certs) {
    const counts = {};
    certs.forEach(cert => {
        counts[cert.purpose] = (counts[cert.purpose] || 0) + 1;
    });
    
    return {
        labels: Object.keys(counts),
        data: Object.values(counts)
    };
}

// تحديث الجدول
function updateTable(certs) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    
    if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد بيانات للعرض</td></tr>';
        return;
    }
    
    tbody.innerHTML = certs.map(cert => {
        const totalPackages = cert.products.reduce((sum, p) => sum + (parseInt(p.packages) || 0), 0);
        return `
            <tr>
                <td>${cert.serialNo}</td>
                <td>${new Date(cert.createdAt).toLocaleDateString('ar-SA')}</td>
                <td>${cert.exporterName}</td>
                <td>${cert.importerName}</td>
                <td>${cert.country}</td>
                <td>${cert.products.length}</td>
                <td>${totalPackages}</td>
            </tr>
        `;
    }).join('');
}

// تصدير التقرير
function exportReport() {
    const type = document.getElementById('reportType').value;
    const certs = getCertificates();
    
    // إنشاء CSV
    let csv = 'رقم الشهادة,التاريخ,المصدر,المستورد,الدولة,عدد المنتجات,الطرود\\n';
    
    certs.forEach(cert => {
        const totalPackages = cert.products.reduce((sum, p) => sum + (parseInt(p.packages) || 0), 0);
        csv += `${cert.serialNo},${new Date(cert.createdAt).toLocaleDateString('ar-SA')},${cert.exporterName},${cert.importerName},${cert.country},${cert.products.length},${totalPackages}\\n`;
    });
    
    // تحميل الملف
    const blob = new Blob([\\ufeff + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_الشهادات_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.reports-content')) {
        changeReportType();
        generateReport();
    }
});