# Deploy Key Setup Guide

## المفتاح العام (استخدمه على GitHub)

قم بالذهاب إلى: `Settings > Deploy keys > Add deploy key`

رابط مباشر:
https://github.com/userphone101112-droid/gova1/settings/keys

---

## خطوات الاستخدام:

### 1. إنشاء مفتاح SSH (إذا لم يكن لديك):
```bash
# قم بتشغيل هذا الأمر في مجلد المشروع
ssh-keygen -t ed25519 -C "your_email@example.com" -f .git_deploy_key -q -N ""
```

### 2. نسخ المفتاح الخاص إلى مجلد الـ SSH المحلي:
```powershell
# أنشئ المجلد إذا لم يكن موجوداً
New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh_local\gova1" -Force

# انسخ المفتاح الخاص
Copy-Item ".\.git_deploy_key" "$env:USERPROFILE\.ssh_local\gova1\" -Force
Copy-Item ".\.git_deploy_key.pub" "$env:USERPROFILE\.ssh_local\gova1\" -Force
```

### 3. تعديل git remote لاستخدام المفتاح:
```powershell
# قم بتعديل الـ remote URL
git remote set-url origin "git@github.com-gova1:userphone101112-droid/gova1.git"

# إذا أردت العودة للـ HTTPS
git remote set-url origin "https://github.com/userphone101112-droid/gova1.git"
```

### 4. إعداد SSH Agent (اختياري لكن موصى به):
```powershell
# ابدأ SSH Agent
Start-Service ssh-agent

# أضف المفتاح
ssh-add "$env:USERPROFILE\.ssh_local\gova1\.git_deploy_key"
```

### 5. اختبر الاتصال:
```bash
ssh -T git@github.com-gova1
```

---

## الملفات المستخدمة:
- `.git_deploy_key` - المفتاح الخاص (آمن - لا تشاركه)
- `.git_deploy_key.pub` - المفتاح العام (أضفه على GitHub)
- `.ssh_config` - تكوين SSH محلي

---

## ملاحظات أمان:
- ✅ المفاتيح محفوظة محلياً في المشروع
- ✅ لا تحتاج لإعدادات Windows العامة
- ✅ يمكنك نسخ المشروع على أي جهاز وسيعمل مباشرة
- ⚠️ تأكد من عدم مشاركة المفتاح الخاص `.git_deploy_key`
- ⚠️ المفاتيح مضافة إلى `.gitignore` لتجنب رفعها على GitHub
