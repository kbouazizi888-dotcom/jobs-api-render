const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('محرك بحث وظائف السائقين في تونس يعمل! 🚀');
});

app.get('/api/search', async (req, res) => {
    try {
        const SERPSTACK_API_KEY = process.env.SERPSTACK_API_KEY;
        
        if (!SERPSTACK_API_KEY) {
            return res.status(500).json({ error: 'مفتاح API غير موجود في إعدادات Render' });
        }

        // 1. تحديد المهن بدقة باللغتين العربية والفرنسية لضمان جلب كل العروض
        const professions = [
            '"سائق تاكسي"', 
            '"سائق حافلة"', 
            '"سائق شاحنة ثقيلة"', 
            '"سائق شاحنة ذات مقطورة"',
            '"chauffeur de taxi"',
            '"chauffeur de bus"',
            '"chauffeur poids lourd"',
            '"chauffeur semi-remorque"'
        ].join(' OR ');

        // فلتر الوقت: tbs=qdr:m تعني "خلال الشهر الماضي فقط"
        const timeFilter = '&tbs=qdr:m';

        // وظيفة جلب البيانات من Serpstack
        async function getJobs(location) {
            const query = encodeURIComponent(`(${professions}) "${location}" (شغل OR emploi OR recrutement)`);
            const url = `http://api.serpstack.com/search?access_key=${SERPSTACK_API_KEY}&query=${query}&gl=tn&hl=ar${timeFilter}`;
            
            console.log(`جاري البحث في: ${location}...`);
            const response = await fetch(url);
            return await response.json();
        }

        // الخطوة الأولى: البحث في سيدي بوزيد
        let data = await getJobs("سيدي بوزيد");
        let results = data.jobs_results || data.organic_results || [];

        // الخطوة الثانية: إذا لم نجد نتائج في سيدي بوزيد، نبحث في كامل تونس
        if (results.length === 0) {
            console.log("لا توجد نتائج في سيدي بوزيد، جاري التوسيع لكامل تونس...");
            data = await getJobs("تونس");
        }

        res.json(data);

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        res.status(500).json({ error: 'حدث خطأ فني في الخادم' });
    }
});

app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});