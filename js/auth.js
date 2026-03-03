base_dir = "/mnt/kimi/output/phytosanitary-system"

# 7. js/auth.js - نظام المصادقة
auth_js = '''// نظام المصادقة والتسجيل
const AUTH_KEY = 'phytosanitary_auth';
const USERS_KEY = 'phytosanitary_users';

// المستخدم الافتراضي
const DEFAULT_USER = {
    username: 'admin',
    password: 'admin123',
    name: 'مدير النظام',
    role: 'admin'
};

// تهيئة المستخدمين
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_USER]));
    }
}

// تسجيل الدخول
function login(username, password) {
    initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const session = {
            username: user.username,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true, user: session };
    }
    return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
}

// التحقق من تسجيل الدخول
function checkAuth() {
    const auth = localStorage.getItem(AUTH_KEY);
    if (!auth) {
        window.location.href = 'index.html';
        return false;
    }
    return JSON.parse(auth);
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

// عرض اسم المستخدم
function displayUser() {
    const auth = checkAuth();
    if (auth) {
        const usernameEl = document.getElementById('usernameDisplay');
        if (usernameEl) {
            usernameEl.textContent = auth.name;
        }
    }
}

// تبديل إظهار كلمة المرور
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        icon.textContent = '👁️';
    }
}

// معالجة نموذج تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('errorMessage');
            
            const result = login(username, password);
            
            if (result.success) {
                errorEl.textContent = '';
                errorEl.style.color = 'green';
                errorEl.textContent = 'جاري تسجيل الدخول...';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                errorEl.textContent = result.message;
                errorEl.style.color = '#f44336';
            }
        });
    }
    
    // التحقق من الصلاحيات في الصفحات المحمية
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.includes('certificate.html') ||
        window.location.pathname.includes('certificates-list.html') ||
        window.location.pathname.includes('reports.html')) {
        checkAuth();
        displayUser();
    }
    
    // عرض التاريخ الحالي
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('ar-SA', options);
    }
});
