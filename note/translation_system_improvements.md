# اقتراحات وتحسينات معمارية لنظام الترجمة وأداة الفحص (UI Inspector)

توضح النقاط التالية مجموعة من الاقتراحات والتحسينات التقنية لزيادة الأداء، وتفادي الأخطاء المستقبلية، وتحسين تجربة التطوير (DX) في نظام الترجمات وأداة الفحص بالمشروع. يتم تقديمها كخطوط إرشادية وتصميمات مقترحة دون إجراء أي تعديل فعلي على الملفات.

---

## 1. تحسين الأداء: تجنب التحقق من الحدود الإقليمية (Boundary Validation) في الإنتاج

### المشكلة الحالية:
تستدعي الدالة الترجومية `t()` في [useTranslation.ts](file:///c:/Users/hesham/Desktop/gova/src/platform/ui/i18n/core/useTranslation.ts#L27-L31) دالة التحقق من الحدود `validateTranslationKey` في كل عملية رندر (Render) لكل مفتاح ترجمة معروض. بالرغم من أن أخطاء تداخل الميزات هي أخطاء تخص بيئة التطوير فقط، إلا أنها تستمر في العمل والتحقق في بيئة الإنتاج (`production`).

### المقترح:
تعطيل التحقق تماماً في بيئة الإنتاج لتوفير وقت المعالجة وتفادي استدعاء المصفوفات الفرعية:

```diff
  const t: TranslateFn = (source, fallback) => {
    const key = resolveTranslationKey(source);

    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] No translation key for source:', source);
      }
      return fallback ?? '';
    }

-   try {
-     validateTranslationKey(key, feature);
-   } catch (error) {
-     console.warn(error);
-   }
+   if (process.env.NODE_ENV === 'development') {
+     try {
+       validateTranslationKey(key, feature);
+     } catch (error) {
+       console.warn(error);
+     }
+   }
```

---

## 2. تحسين خوادم التطوير: استخدام عمليات الملفات غير المتزامنة (Asynchronous Filesystem Calls)

### المشكلة الحالية:
تستخدم مسارات واجهة البرمجة (API Routes) الخاصة بأداة الفحص للتراجم، مثل [check-translation/route.ts](file:///c:/Users/hesham/Desktop/gova/src/app/api/ui-inspector/check-translation/route.ts) و [translation-ignore/route.ts](file:///c:/Users/hesham/Desktop/gova/src/app/api/ui-inspector/translation-ignore/route.ts)، الدوال المتزامنة لقراءة وكتابة ملفات الـ JSON (مثل `readFileSync`, `writeFileSync`, `existsSync`). هذه الدوال تحظر حلقة الأحداث (Event Loop) في Node.js، مما قد يتسبب في بطء استجابة خادم التطوير عند معالجة طلبات الفحص المتكررة.

### المقترح:
تحويل العمليات البرمجية إلى العمليات غير المتزامنة المبنية على الوعود (`fs.promises`):

```diff
-import { existsSync, readFileSync, writeFileSync } from 'fs';
+import { promises as fs, existsSync } from 'fs';

-function readCheckFile() {
-  if (!existsSync(CHECK_FILE)) return { savedAt: null, items: [] };
-  return JSON.parse(readFileSync(CHECK_FILE, 'utf-8'));
-}
+async function readCheckFile() {
+  try {
+    const content = await fs.readFile(CHECK_FILE, 'utf-8');
+    return JSON.parse(content);
+  } catch (error) {
+    return { savedAt: null, items: [] };
+  }
+}
```

---

## 3. إزالة تكرار المنطق المشترك بين الواجهة الخلفية والأمامية (Code Duplication)

### المشكلة الحالية:
يتم تكوين مفتاح العنصر الفريد لفحص الترجمات (Item Key) بصيغة دمج عناصر معينة بفاصل الأنبوب `|` في ملفين منفصلين:
* الواجهة الأمامية: [TranslationPanel.tsx](file:///c:/Users/hesham/Desktop/gova/src/platform/ui/devtools/ui-inspector/components/TranslationPanel.tsx#L363-L383) في الدالة `createTranslationItemKey`.
* الواجهة الخلفية: [check-translation/route.ts](file:///c:/Users/hesham/Desktop/gova/src/app/api/ui-inspector/check-translation/route.ts#L81-L99) في الدالة `createItemKey`.

في حال تم تعديل صيغة المفتاح أو تحسينه في أحدهما دون الآخر، فستفشل قائمة تجاهل العناصر المتطابقة.

### المقترح:
نقل دالة التوليد إلى ملف خدمات أو ملف أدوات مشترك (مثلاً تحت المجلد `src/platform/ui/devtools/ui-inspector/utils/`) واستيراده في كلا الجانبين. بالإضافة إلى ذلك، يفضل استخدام خوارزمية تشفير بسيطة أو دالة توليد تعتمد على كائن منظم بدلاً من تجميع سلاسل نصية قد تحتوي بذاتها على رمز الفاصل `|`.

---

## 4. تشغيل سكريبت التوليد بشكل غير متزامن في خادم التطوير (Asynchronous Script Execution)

### المشكلة الحالية:
في مسار تسجيل العناصر [register-element/route.ts](file:///c:/Users/hesham/Desktop/gova/src/app/api/ui-inspector/register-element/route.ts#L290-L293)، يتم استدعاء سكريبت التحديث `npm run registry:generate` بشكل متزامن باستخدام `execFileSync`. هذه العملية تؤخر استجابة واجهة المستخدم لثوانٍ معدودة حتى تنتهي العملية تماماً.

### المقترح:
استدعاء العملية بصورة غير متزامنة عبر `execFile` بدلاً من `execFileSync` وإرجاع الاستجابة الفورية للمتصفح بمجرد نجاح الإضافة للملف، وترك عملية التوليد تعمل في الخلفية:

```typescript
import { execFile } from 'child_process';

function refreshGeneratedRegistryFilesAsync(): void {
  // تشغيل غير متزامن لا يعطل استجابة الـ HTTP API
  execFile('npm', ['run', 'registry:generate'], (error) => {
    if (error) {
      console.error('Failed to run registry generation in background:', error);
    }
  });
}
```

---

## 5. أتمتة تحديث أنواع الترجمة (Translation Keys Auto-generation)

### المشكلة الحالية:
يتوجب على المطورين تشغيل `npm run i18n:generate-keys` يدوياً لتحديث ملف الأنواع `translation-keys.d.ts` بعد كل عملية تزامن أو إضافة يدوية للترجمات للحصول على استكمال الكود التلقائي (Autocomplete) بشكل صحيح.

### المقترح:
إدراج مراقب ملفات (File Watcher) في بيئة التطوير باستخدام مكتبة مثل `chokidar` يراقب التغيرات في المجلد `src/platform/ui/i18n/locales/**/*.json` ويقوم بتشغيل خدمة توليد المفاتيح تلقائياً عند حفظ أي ملف ترجمة. يمكن إعداد هذا المراقب ليعمل بالتوازي مع خادم Next.js في التطوير.
