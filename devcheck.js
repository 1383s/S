import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js';
import { getDatabase, ref, get, child } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js';

// 🚨🚨🚨 يجب تحديث بيانات مشروعك هنا 🚨🚨🚨
// يجب أن تكون هذه البيانات هي نفسها المستخدمة في ملفاتك الأخرى
const firebaseConfig = {
    apiKey: "AIzaSyBK6FZF3LW83qaUHBKYTfiVd2Ozrd1Rf2g", 
    authDomain: "thanawy-1383.firebaseapp.com",
    databaseURL: "https://thanawy-1383-default-rtdb.firebaseio.com",
    projectId: "thanawy-1383",
    // ... يمكن إضافة باقي الحقول
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const BLOCKED_DEVICES_PATH = 'blockedDevices';
const DEVICE_ID_KEY = 'localDeviceId'; // المفتاح المستخدم لحفظ كود الجهاز في localStorage

/**
 * الدالة الرئيسية للتحقق من حالة حظر الجهاز وإعادة التوجيه.
 */
async function checkDeviceBlockStatusAndRedirect() {
    // 1. قراءة كود الجهاز من الذاكرة المحلية
    const currentDeviceId = localStorage.getItem(DEVICE_ID_KEY); 

    // إذا لم يكن هناك كود جهاز مخزن، نفترض أنه جهاز جديد لم يسجل دخوله بعد، لذا لا نقوم بالحظر.
    if (!currentDeviceId || typeof currentDeviceId !== 'string' || currentDeviceId.trim() === "") {
        console.warn(`[Device Check] لا يوجد Device ID مخزن في ${DEVICE_ID_KEY}. تخطي التحقق من الحظر.`);
        return false; 
    }
    
    const deviceIdKey = currentDeviceId.trim();
    // المسار المحدد في Firebase: blockedDevices/[كود الجهاز]
    const deviceRef = ref(db, `${BLOCKED_DEVICES_PATH}/${deviceIdKey}`);

    try {
        console.log(`[Device Check] جاري التحقق من حالة حظر الجهاز: ${deviceIdKey}...`);

        // 2. جلب البيانات لمرة واحدة من Firebase
        const snapshot = await get(deviceRef);

        if (snapshot.exists()) {
            // 3. الجهاز محظور!
            console.error(`[Device Check] 🚫 تم حظر هذا الجهاز. إعادة التوجيه إلى block.html.`);
            
            // إعادة التوجيه إلى صفحة block.html
            // نستخدم replace() بدلاً من href لمنع العودة إلى الصفحة المحظورة عبر زر العودة في المتصفح.
            window.location.replace('block.html'); 
            
            return true;
        } else {
            // 4. الجهاز غير محظور
            console.log(`[Device Check] ✅ الجهاز غير محظور. يمكن المتابعة.`);
            return false;
        }

    } catch (error) {
        // ❌ فشل في الاتصال بالـ Firebase (تجنب حظر المستخدم في حالة خطأ تقني)
        console.error("[Device Check] ⚠️ فشل التحقق من Firebase (مشكلة اتصال أو صلاحيات). السماح بالمتابعة لتجنب الحظر الخاطئ:", error.message);
        return false; 
    }
}

// 5. تنفيذ التحقق فوراً عند تحميل ملف الـ JS
checkDeviceBlockStatusAndRedirect();
