const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل CORS للسماح لتطبيقك بقراءة البيانات
app.use(cors());

// مسار الصفحة الرئيسية للتأكد من عمل الخادم
app.get('/', (req, res) => {
    res.send('محرك بحث الوظائف يعمل بنجاح! 🚀 اذهب إلى /api/search لجلب البيانات.');
});

// مسار البحث الذكي
app.get('/api/search', async (req, res) => {
    try {
        const SERPSTACK_API_KEY = process.env.SERPSTACK_API_KEY;
        
        if (!SERPSTACK_API_KEY) {
            return res.status(500).json({ error: 'مفتاح API غير موجود في إعدادات Render' });
        }

        // 1. إعداد كلمات البحث والتخصصات المستهدفة
        // التخصصات: سائق شاحنة ذات مقطورة، سائق شاحنة ثقيلة، سائق حافلة، سائق تاكسي، سائق سيارة سياحية
        const professions = '"سائق شاحنة ذات مقطورة" OR "سائق شاحنة ثقيلة" OR "سائق حافلة" OR "سائق تاكسي" OR "سائق سيارة سياحية" OR "chauffeur poids lourd" OR "chauffeur semi-remorque" OR "chauffeur de bus" OR "chauffeur de taxi" OR "chauffeur privé"';
        
        const querySidiBouzid = encodeURIComponent(`(${professions}) (سيدي بوزيد OR Sidi Bouzid) شغل OR emploi`);
        const queryTunisia = encodeURIComponent(`(${professions}) (تونس OR Tunisia OR Tunisie) شغل OR emploi`);
        
        // إضافة معامل الوقت tbs=qdr:m لجلب نتائج الشهر الأخير فقط (Google Search Parameter)
        const timeFilter = '&tbs=qdr:m';

        // 2. المحاولة الأولى: البحث في سيدي بوزيد
        console.log("جاري البحث في سيدي بوزيد...");
        const urlSidiBouzid = `http://api.serpstack.com/search?access_key=${SERPSTACK_API_KEY}&query=${querySidiBouzid}&gl=tn${timeFilter}`;
        const response1 = await fetch(urlSidiBouzid);
        const data1 = await response1.json();
        
        // التحقق مما إذا كانت هناك نتائج كافية في سيدي بوزيد
        const results1 = data1.jobs_results || data1.organic_results || [];

        // إذا وجدنا نتائج، نرسلها فوراً ونتوقف هنا
        if (results1.length > 0) {
            console.log(`تم العثور على ${results1.length} نتائج في سيدي بوزيد!`);
            return res.json(data1);
        }

        // 3. المحاولة الثانية (الخطة ب): إذا لم نجد في سيدي بوزيد، نبحث في تونس كاملة
        console.log("لم نجد نتائج كافية في سيدي بوزيد، جاري البحث في تونس كاملة...");
        const urlTunisia = `http://api.serpstack.com/search?access_key=${SERPSTACK_API_KEY}&query=${queryTunisia}&gl=tn${timeFilter}`;
        const response2 = await fetch(urlTunisia);
        const data2 = await response2.json();

        // إرسال نتائج البحث في تونس كاملة
        console.log("تم جلب نتائج تونس.");
        res.json(data2);

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب البيانات' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});