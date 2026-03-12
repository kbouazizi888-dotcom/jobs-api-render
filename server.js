const express = require('express');
const cors = require('cors');

const app = express();
// Render سيقوم بتحديد البورت تلقائياً، وإلا سيستخدم 3000
const PORT = process.env.PORT || 3000;

// تفعيل CORS (مهم جداً للسماح لمشروع Firebase بقراءة البيانات)
app.use(cors());

// مسار الـ API الخاص بك
app.get('/api/search', async (req, res) => {
    try {
        // جلب المفتاح السري من إعدادات Render
        const SERPSTACK_API_KEY = process.env.SERPSTACK_API_KEY;
        const query = encodeURIComponent('مطلوب مدرب سياقة تونس');
        
        // الاتصال بمحرك البحث (Serpstack ال)
        const response = await fetch(`http://api.serpstack.com/search?access_key=${SERPSTACK_API_KEY}&query=${query}&gl=tn`);
        const data = await response.json();

        // إرسال البيانات بصيغة JSON
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب البيانات' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});