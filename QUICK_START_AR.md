# 🚀 Quick Start - Deploy Key Setup

## الخطوات السريعة:

### ✅ 1. أنشئ مفتاح SSH

قم بتشغيل هذا الأمر في مجلد المشروع:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f .git_deploy_key -q -N ""
```

ثم اضغط Enter للمتابعة.

---

### ✅ 2. أضف المفتاح العام على GitHub

أولاً اقرأ محتوى المفتاح العام:
```bash
cat .git_deploy_key.pub
```

ثم اذهب إلى:
**Settings → Deploy Keys → Add Deploy Key

الصق المفتاح وتأكد من تفعيل: ✓ Allow write access

رابط مباشر:
https://github.com/userphone101112-droid/gova1/settings/keys

---

### ✅ 3. تشغيل السكريبت (PowerShell أو Batch)

**للـ PowerShell:**
```powershell
.\setup-deploy-key.ps1 -Setup
```

**للـ Batch (Windows CMD):
```cmd
setup-deploy-key.bat setup
```

---

### ✅ 4. اختبر الاتصال

**PowerShell:**
```powershell
.\setup-deploy-key.ps1 -Test
```

**Batch:**
```cmd
setup-deploy-key.bat test
```

---

### ✅ 5. جرّب الـ Push

```bash
git add .
git commit -m "test deploy key"
git push
```

---

## 📁 الملفات المهمة:

| الملف | الوصف |
|------|-------|
| `.git_deploy_key` | ⚠️ المفتاح الخاص - لا تشاركه |
| `.git_deploy_key.pub` | المفتاح العام - أضفه على GitHub |
| `setup-deploy-key.ps1` | السكريبت الرئيسي (PowerShell) |
| `setup-deploy-key.bat` | البديل (Windows Batch) |
| `.ssh_config` | إعدادات SSH المحلية |
| `DEPLOY_KEY_SETUP.md` | شرح تفصيلي |

---

## ⚠️ نقاط أمان مهمة:

- ✅ المفاتيح مخفية في `.gitignore`
- ✅ لن يتم رفعها على GitHub
- ✅ آمنة محلياً فقط
- ❌ لا تشارك `.git_deploy_key` مع أحد

---

## 🔧 استكشاف الأخطاء:

### مشكلة: خطأ في الاتصال

**الحل:**
1. تحقق من إضافة المفتاح العام على GitHub
2. تأكد من تفعيل "Allow write access"
3. شغل البرنامج النصي مرة أخرى

### مشكلة: SSH Agent لا يعمل

**الحل:**
```powershell
# ابدأ SSH Agent يدويًا
Start-Service ssh-agent

# أضف المفتاح يدويًا
ssh-add "C:\Users\hesham\.ssh_local\gova1\.git_deploy_key"
```

---

## 📖 للمزيد من المعلومات:

اقرأ ملف: `DEPLOY_KEY_SETUP.md`
