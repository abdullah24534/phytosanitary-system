base_dir = "/mnt/kimi/output/phytosanitary-system"

# إنشاء auth.js كامل ونظيف
auth_clean = '''// نظام المصادقة
(function() {
    // تهيئة المستخدم الافتراضي
    if (!localStorage.getItem('phytosanitary_users')) {
        localStorage.setItem('phytosanitary_users', JSON.stringify([{
            username: 'admin',
            password: 'admin123',
            name: 'مدير النظام',
            role: 'admin'
        }]));
    }

    // دالة تبديل كلمة المرور
    window.togglePassword = function() {
        var pass = document.getElementById('password');
        if (pass.type === 'password') {
            pass.type = 'text';
        } else {
            pass.type = 'password';
        }
    };

    // معالجة تسجيل الدخول
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                var username = document.getElementById('username').value;
                var password = document.getElementById('password').value;
                var errorEl = document.getElementById('errorMessage');
                
                var users = JSON.parse(localStorage.getItem('phytosanitary_users'));
                var user = users.find(function(u) {
                    return u.username === username && u.password === password;
                });
                
                if (user) {
                    localStorage.setItem('phytosanitary_auth', JSON.stringify({
                        username: user.username,
                        name: user.name,
                        role: user.role
                    }));
                    
                    errorEl.textContent = 'تم تسجيل الدخول بنجاح!';
                    errorEl.style.color = 'green';
                    
                    setTimeout(function() {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    errorEl.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                    errorEl.style.color = 'red';
                }
            });
        }
        
        // التحقق من الصلاحيات في الصفحات الأخرى
        var protectedPages = ['dashboard.html', 'certificate.html', 'certificates-list.html', 'reports.html'];
        var currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.indexOf(currentPage) !== -1) {
            if (!localStorage.getItem('phytosanitary_auth')) {
                window.location.href = 'index.html';
            }
        }
        
        // عرض اسم المستخدم
        var usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            var auth = localStorage.getItem('phytosanitary_auth');
            if (auth) {
                var user = JSON.parse(auth);
                usernameDisplay.textContent = user.name;
            }
        }
    });
})();'''

with open(f"{base_dir}/js/auth.js", "w", encoding="utf-8") as f:
    f.write(auth_clean)

print("✅ تم إنشاء auth.js نظيف")
print("🔄 جرب الآن فتح index.html")
