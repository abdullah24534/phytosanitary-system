base_dir = "/mnt/kimi/output/phytosanitary-system"

# 8. js/certificates.js - إدارة الشهادات
cert_js = '''// نظام إدارة الشهادات
const CERTS_KEY = 'phytosanitary_certificates';

// توليد رقم تسلسلي
function generateSerial() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `PS-${year}-${random}`;
}

// توليد كود تحقق
function generateVerifyCode() {
    return Math.floor(Math.random() * 900000) + 100000;
}

// تهيئة النموذج
function initCertificateForm() {
    const serialEl = document.getElementById('serialNo');
    const verifyEl = document.getElementById('verifyCode');
    
    if (serialEl && verifyEl) {
        serialEl.value = generateSerial();
        verifyEl.value = generateVerifyCode();
    }
}

// إضافة منتج جديد
function addProduct() {
    const tbody = document.getElementById('productsBody');
    const rowCount = tbody.rows.length + 1;
    
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="product-name" placeholder="اسم السلعة" required></td>
        <td><input type="text" class="product-class" placeholder="الفئة" required></td>
        <td><input type="text" class="product-qty" placeholder="الكمية" required></td>
        <td><input type="number" class="product-packages" placeholder="عدد الطرود" required></td>
        <td><button type="button" class="btn-remove" onclick="removeProduct(this)">❌</button></td>
    `;
    
    updateProductNumbers();
}

// حذف منتج
function removeProduct(btn) {
    const tbody = document.getElementById('productsBody');
    if (tbody.rows.length > 1) {
        btn.closest('tr').remove();
        updateProductNumbers();
    } else {
        alert('يجب الاحتفاظ بمنتج واحد على الأقل');
    }
}

// تحديث أرقام المنتجات
function updateProductNumbers() {
    const tbody = document.getElementById('productsBody');
    Array.from(tbody.rows).forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// جمع بيانات المنتجات
function collectProducts() {
    const products = [];
    const tbody = document.getElementById('productsBody');
    
    Array.from(tbody.rows).forEach(row => {
        products.push({
            name: row.querySelector('.product-name').value,
            class: row.querySelector('.product-class').value,
            quantity: row.querySelector('.product-qty').value,
            packages: parseInt(row.querySelector('.product-packages').value) || 0
        });
    });
    
    return products;
}

// حساب الإجماليات
function calculateTotals(products) {
    const totalPackages = products.reduce((sum, p) => sum + p.packages, 0);
    const totalQty = products.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
    return { totalPackages, totalQty };
}

// معاينة الشهادة
function previewCertificate() {
    const formData = collectFormData();
    
    // تحديث المعاينة
    document.getElementById('previewSerial').textContent = formData.serialNo;
    document.getElementById('previewVerify').textContent = formData.verifyCode;
    document.getElementById('previewCountry').textContent = formData.country;
    document.getElementById('previewImporter').textContent = `${formData.importerName} - ${formData.importerAddress}`;
    document.getElementById('previewExporter').textContent = `${formData.exporterName} - ${formData.exporterAddress}`;
    document.getElementById('previewEntry').textContent = formData.entryPoint;
    document.getElementById('previewOrigin').textContent = formData.originCountry;
    document.getElementById('previewPurpose').textContent = formData.purpose;
    document.getElementById('previewConveyance').textContent = formData.conveyance;
    document.getElementById('previewDate').textContent = new Date().toLocaleDateString('ar-SA');
    
    // تحديث المنتجات
    const products = collectProducts();
    const previewBody = document.getElementById('previewProducts');
    previewBody.innerHTML = products.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td>${p.class}</td>
            <td>${p.quantity}</td>
            <td>${p.packages}</td>
        </tr>
    `).join('');
    
    // تحديث الإجماليات
    const totals = calculateTotals(products);
    document.getElementById('previewTotalPackages').textContent = totals.totalPackages;
    document.getElementById('previewTotalQty').textContent = totals.totalQty;
    
    // إظهار الإقرار الإضافي إذا وجد
    const declSection = document.getElementById('previewDeclSection');
    const declText = document.getElementById('additionalDecl').value;
    if (declText.trim()) {
        document.getElementById('previewDecl').textContent = declText;
        declSection.style.display = 'block';
    } else {
        declSection.style.display = 'none';
    }
    
    // إنشاء QR Code
    generateQRCode(formData);
    
    // التمرير للمعاينة
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

// جمع بيانات النموذج
function collectFormData() {
    return {
        serialNo: document.getElementById('serialNo').value,
        verifyCode: document.getElementById('verifyCode').value,
        exporterName: document.getElementById('exporterName').value,
        exporterAddress: document.getElementById('exporterAddress').value,
        importerName: document.getElementById('importerName').value,
        importerAddress: document.getElementById('importerAddress').value,
        country: document.getElementById('country').value,
        entryPoint: document.getElementById('entryPoint').value,
        originCountry: document.getElementById('originCountry').value,
        purpose: document.getElementById('purpose').value,
        conveyance: document.getElementById('conveyance').value,
        additionalDecl: document.getElementById('additionalDecl').value,
        products: collectProducts()
    };
}

// إنشاء QR Code
function generateQRCode(data) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    const qrData = JSON.stringify({
        serial: data.serialNo,
        code: data.verifyCode,
        url: window.location.origin + '/verify.html'
    });
    
    new QRCode(qrContainer, {
        text: qrData,
        width: 100,
        height: 100,
        colorDark: '#1b5e20',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

// حفظ الشهادة
function saveCertificate() {
    const formData = collectFormData();
    
    // التحقق من البيانات
    if (!formData.exporterName || !formData.importerName || !formData.country) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    if (formData.products.length === 0) {
        alert('يرجى إضافة منتج واحد على الأقل');
        return;
    }
    
    // إنشاء كائن الشهادة
    const certificate = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // حفظ في التخزين المحلي
    let certificates = JSON.parse(localStorage.getItem(CERTS_KEY) || '[]');
    
    // التحقق من عدم التكرار
    const exists = certificates.find(c => c.serialNo === formData.serialNo);
    if (exists) {
        alert('رقم الشهادة موجود مسبقاً!');
        return;
    }
    
    certificates.push(certificate);
    localStorage.setItem(CERTS_KEY, JSON.stringify(certificates));
    
    alert('تم حفظ الشهادة بنجاح!');
    
    // إعادة تعيين النموذج أو الانتقال للقائمة
    if (confirm('هل تريد إنشاء شهادة جديدة؟')) {
        location.reload();
    } else {
        window.location.href = 'certificates-list.html';
    }
}

// طباعة الشهادة
function printCertificate() {
    previewCertificate();
    setTimeout(() => {
        window.print();
    }, 500);
}

// تصدير PDF
function exportPDF() {
    previewCertificate();
    const element = document.getElementById('certTemplate');
    
    const opt = {
        margin: 10,
        filename: `شهادة_${document.getElementById('serialNo').value}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('certificateForm')) {
        initCertificateForm();
    }
});
