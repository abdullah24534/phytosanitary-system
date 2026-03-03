base_dir = "/mnt/kimi/output/phytosanitary-system"

# 10. js/certificates-list.js - قائمة الشهادات
cert_list_js = '''// إدارة قائمة الشهادات
const CERTS_KEY = 'phytosanitary_certificates';
let currentPage = 1;
const itemsPerPage = 10;

// الحصول على الشهادات
function getCertificates() {
    return JSON.parse(localStorage.getItem(CERTS_KEY) || '[]');
}

// عرض الجدول
function renderTable() {
    const certs = getCertificates();
    const filtered = filterCertificates(certs);
    const paginated = paginate(filtered, currentPage);
    
    const tbody = document.getElementById('certificatesBody');
    if (!tbody) return;
    
    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">لا توجد شهادات مطابقة للبحث</td></tr>';
        updatePagination(0);
        return;
    }
    
    tbody.innerHTML = paginated.map(cert => `
        <tr>
            <td><strong style="color:#1b5e20;">${cert.serialNo}</strong></td>
            <td>${new Date(cert.createdAt).toLocaleDateString('ar-SA')}</td>
            <td>${cert.exporterName}</td>
            <td>${cert.importerName}</td>
            <td>${cert.country}</td>
            <td>${cert.products.length}</td>
            <td><span class="status-badge status-active">نشطة</span></td>
            <td>
                <button onclick="viewCertificate(${cert.id})" title="عرض">👁️</button>
                <button onclick="editCertificate(${cert.id})" title="تعديل">✏️</button>
                <button onclick="deleteCertificate(${cert.id})" title="حذف" style="color:#f44336;">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    updatePagination(filtered.length);
}

// تصفية الشهادات
function filterCertificates(certs) {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const country = document.getElementById('filterCountry')?.value || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;
    
    return certs.filter(cert => {
        // البحث النصي
        const matchesSearch = !search || 
            cert.serialNo.toLowerCase().includes(search) ||
            cert.exporterName.toLowerCase().includes(search) ||
            cert.importerName.toLowerCase().includes(search);
        
        // تصفية الدولة
        const matchesCountry = !country || cert.country === country;
        
        // تصفية التاريخ
        const certDate = new Date(cert.createdAt);
        const matchesDateFrom = !dateFrom || certDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || certDate <= new Date(dateTo);
        
        return matchesSearch && matchesCountry && matchesDateFrom && matchesDateTo;
    });
}

// ترقيم الصفحات
function paginate(items, page) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
}

// تحديث معلومات الترقيم
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').textContent = `صفحة ${currentPage} من ${totalPages || 1}`;
}

// تطبيق الفلاتر
function applyFilters() {
    currentPage = 1;
    renderTable();
}

// إعادة تعيين الفلاتر
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCountry').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    currentPage = 1;
    renderTable();
}

// التنقل بين الصفحات
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const certs = getCertificates();
    const filtered = filterCertificates(certs);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// عرض الشهادة
function viewCertificate(id) {
    const certs = getCertificates();
    const cert = certs.find(c => c.id === id);
    if (!cert) return;
    
    const modal = document.getElementById('viewModal');
    const content = document.getElementById('viewContent');
    
    content.innerHTML = `
        <div class="cert-view">
            <h2>شهادة صحية نباتية</h2>
            <div class="cert-details">
                <div class="detail-row">
                    <span class="label">رقم الشهادة:</span>
                    <span class="value">${cert.serialNo}</span>
                </div>
                <div class="detail-row">
                    <span class="label">كود التحقق:</span>
                    <span class="value">${cert.verifyCode}</span>
                </div>
                <div class="detail-row">
                    <span class="label">التاريخ:</span>
                    <span class="value">${new Date(cert.createdAt).toLocaleString('ar-SA')}</span>
                </div>
                <div class="detail-row">
                    <span class="label">المصدر:</span>
                    <span class="value">${cert.exporterName} - ${cert.exporterAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="label">المستورد:</span>
                    <span class="value">${cert.importerName} - ${cert.importerAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="label">الدولة:</span>
                    <span class="value">${cert.country}</span>
                </div>
                <div class="detail-row">
                    <span class="label">نقطة الدخول:</span>
                    <span class="value">${cert.entryPoint}</span>
                </div>
                <div class="detail-row">
                    <span class="label">الغرض:</span>
                    <span class="value">${cert.purpose}</span>
                </div>
                <div class="detail-row">
                    <span class="label">وسيلة النقل:</span>
                    <span class="value">${cert.conveyance}</span>
                </div>
            </div>
            <h3>المنتجات:</h3>
            <table class="view-products">
                <thead>
                    <tr><th>#</th><th>الاسم</th><th>الفئة</th><th>الكمية</th><th>الطرود</th></tr>
                </thead>
                <tbody>
                    ${cert.products.map((p, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${p.name}</td>
                            <td>${p.class}</td>
                            <td>${p.quantity}</td>
                            <td>${p.packages}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${cert.additionalDecl ? `
                <div class="additional-decl">
                    <h3>إقرار إضافي:</h3>
                    <p>${cert.additionalDecl}</p>
                </div>
            ` : ''}
            <div class="view-actions">
                <button onclick="printCertificate(${cert.id})" class="btn-print">🖨️ طباعة</button>
                <button onclick="downloadPDF(${cert.id})" class="btn-pdf">📄 تحميل PDF</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// تعديل الشهادة
function editCertificate(id) {
    // حفظ ID في localStorage للتحرير
    localStorage.setItem('edit_cert_id', id);
    window.location.href = 'certificate.html?edit=' + id;
}

// حذف الشهادة
function deleteCertificate(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    let certs = getCertificates();
    certs = certs.filter(c => c.id !== id);
    localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
    
    renderTable();
    alert('تم حذف الشهادة بنجاح');
}

// طباعة الشهادة
function printCertificate(id) {
    const certs = getCertificates();
    const cert = certs.find(c => c.id === id);
    if (!cert) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(cert));
    printWindow.document.close();
    printWindow.print();
}

// تحميل PDF
function downloadPDF(id) {
    // يمكن استخدام مكتبة html2pdf هنا
    alert('جاري تجهيز PDF...');
}

// إنشاء HTML للطباعة
function generatePrintHTML(cert) {
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>شهادة ${cert.serialNo}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                body { 
                    font-family: 'Cairo', Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: #f5f5f5;
                }
                .cert-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border: 3px solid #1b5e20;
                }
                .cert-header { 
                    text-align: center; 
                    border-bottom: 2px solid #1b5e20; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                }
                .cert-header h1 { color: #1b5e20; font-size: 28px; margin: 10px 0; }
                .cert-header h2 { color: #333; font-size: 20px; margin: 5px 0; }
                .cert-header h3 { color: #666; font-size: 16px; }
                .cert-numbers {
                    display: flex;
                    justify-content: space-between;
                    background: #f5f5f5;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }
                .info-section { margin-bottom: 25px; }
                .info-section h4 {
                    color: #1b5e20;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .info-row { 
                    display: flex; 
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px dotted #eee;
                }
                .info-row .label { 
                    font-weight: bold; 
                    width: 200px;
                    color: #555;
                }
                .info-row .value { flex: 1; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                }
                th, td { 
                    border: 1px solid #333; 
                    padding: 12px; 
                    text-align: center;
                }
                th { background: #1b5e20; color: white; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                @media print {
                    body { background: white; }
                    .cert-container { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="cert-container">
                <div class="cert-header">
                    <h2>وزارة الثروة الزراعية والسمكية وموارد المياه</h2>
                    <h3>المديرية العامة - محافظة البريمي</h3>
                    <h1>شهادة الصحة النباتية</h1>
                </div>
                
                <div class="cert-numbers">
                    <div><strong>رقم الشهادة:</strong> ${cert.serialNo}</div>
                    <div><strong>كود التحقق:</strong> ${cert.verifyCode}</div>
                </div>
                
                <div class="info-section">
                    <h4>معلومات الشحنة</h4>
                    <div class="info-row"><span class="label">المصدر:</span><span class="value">${cert.exporterName}</span></div>
                    <div class="info-row"><span class="label">عنوان المصدر:</span><span class="value">${cert.exporterAddress}</span></div>
                    <div class="info-row"><span class="label">المستورد:</span><span class="value">${cert.importerName}</span></div>
                    <div class="info-row"><span class="label">عنوان المستورد:</span><span class="value">${cert.importerAddress}</span></div>
                    <div class="info-row"><span class="label">الدولة المستوردة:</span><span class="value">${cert.country}</span></div>
                    <div class="info-row"><span class="label">نقطة الدخول:</span><span class="value">${cert.entryPoint}</span></div>
                    <div class="info-row"><span class="label">بلد المنشأ:</span><span class="value">${cert.originCountry}</span></div>
                    <div class="info-row"><span class="label">الغرض:</span><span class="value">${cert.purpose}</span></div>
                    <div class="info-row"><span class="label">وسيلة النقل:</span><span class="value">${cert.conveyance}</span></div>
                </div>
                
                <div class="info-section">
                    <h4>المنتجات</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم السلعة</th>
                                <th>الفئة</th>
                                <th>الكمية</th>
                                <th>عدد الطرود</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cert.products.map((p, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${p.name}</td>
                                    <td>${p.class}</td>
                                    <td>${p.quantity}</td>
                                    <td>${p.packages}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${cert.additionalDecl ? `
                    <div class="info-section">
                        <h4>إقرار إضافي</h4>
                        <p>${cert.additionalDecl}</p>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>تم إصدار هذه الشهادة إلكترونياً بواسطة نظام إدارة الشهادات الصحية النباتية</p>
                    <p>تاريخ الإصدار: ${new Date(cert.createdAt).toLocaleString('ar-SA')}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('viewModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('certificatesTable')) {
        renderTable();
    }
});
'''

with open(f"{base_dir}/js/certificates-list.js", "w", encoding="utf-8") as f:
    f.write(cert_list_js)

print("✅ تم إنشاء js/certificates-list.js")
