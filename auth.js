
    // 🚨 1. Configuration - لازم تحط نفس الإعدادات اللي في index.html
    const firebaseConfig = {
      apiKey: "AIzaSyBK6FZF3LW83qaUHBKYTfiVd2Ozrd1Rf2g",
      authDomain: "thanawy-1383.firebaseapp.com",
      databaseURL: "https://thanawy-1383-default-rtdb.firebaseio.com",
      projectId: "thanawy-1383",
      storageBucket: "thanawy-1383.firebasestorage.app",
      messagingSenderId: "1026664406457",
      appId: "1:1026664406457:web:87d71f7e41bef36ba0aa68",
      measurementId: "G-J5R2EFM2D0"
    };

    // 🚨 2. عنوان صفحة الدخول اللي هترجع ليها
    const LOGIN_PAGE_URL = "https://1383ss.vercel.app"; 

    // دالة التوجيه لصفحة الدخول
    function redirectToLogin(reason) {
        // بنستخدم replace عشان الصفحة دي متتسجلش في الـ Browser History
        window.location.replace(LOGIN_PAGE_URL);
    }

    // *******************************************************************

    const activeCode = localStorage.getItem('activeCode');
    const localDeviceId = localStorage.getItem('localDeviceId');

    // 3. التحقق المبدئي: لو مفيش كود أو Device ID متسجل محليًا
    if (!activeCode || !localDeviceId) {
        redirectToLogin("Missing local code or Device ID.");
    } else {
        // 4. التحقق من Firebase
        
        if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.database();

        async function verifyCodeOnServer(code) {
            try {
                // بنحاول نقرا بيانات الكود ده من الداتا بيز مرة واحدة بس
                const snapshot = await db.ref('approvedStudents/' + code).once('value');
                const data = snapshot.val();
                const now = Date.now();

                // أ. الكود مش موجود
                if (!data) {
                    redirectToLogin("Code not found.");
                    return;
                }

                // ب. الكود منتهي الصلاحية
                if (data.expiry <= now) {
                    redirectToLogin("Code is expired.");
                    return;
                }
                
                // ج. الكود مُعطّل من الإدارة
                if (data.isBlocked === true) {
                    redirectToLogin("Code is blocked.");
                    return;
                }
                
                // د. الكود مفعل على جهاز تاني
                const storedDeviceId = data.deviceId;
                
                if (!storedDeviceId || storedDeviceId !== localDeviceId) {
                    // عشان الأمان، بنمسح الداتا المحلية عشان الطالب يرجع يسجل دخول تاني
                    localStorage.removeItem('activeCode');
                    localStorage.removeItem('localDeviceId');
                    redirectToLogin("Code linked to another device.");
                    return;
                }

                // لو وصل لحد هنا يبقى: ✅ الكود سليم ومفعل على نفس الجهاز
              // 🚨 السطر الجديد: عرض الكود في الشريط السفلي
              //document.getElementById('displayActivationCodeBottom').textContent = code;
                // خلاص، سيبه يكمل ويشوف المحتوى

            } catch (error) {
                // لو فشل الاتصال بالخادم، الأمان يقتضي إننا نرجعه لصفحة الدخول
                // عشان منعاً للدخول غير المصرح به لو الـ Server كان واقع
                redirectToLogin("Verification server error.");
            }
        }

        // إبدأ عملية التحقق
        verifyCodeOnServer(activeCode);
    }
