import { Router } from "express";

const router = Router();

const SYSTEM_INSTRUCTION = `أنت مساعد Carvia، مساعد ذكاء اصطناعي متخصص فقط بالسيارات وصيانتها وأعطالها وقطع غيارها والقيادة الآمنة.
- أجب دائمًا بالعربية، بأسلوب واضح ومباشر ومختصر.
- إذا سُئلت عن أي موضوع خارج نطاق السيارات، اعتذر بأدب وأخبر المستخدم إنك متخصص بالسيارات فقط.
- لا تقدم تشخيصًا نهائيًا لعطل خطير بدون تنبيه المستخدم يراجع ورشة أو ميكانيكي، خصوصًا لو الأمر متعلق بالسلامة (فرامل، توجيه، إطارات).
- خلك مختصر ومفيد، بدون إطالة غير ضرورية.`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "الرسالة فارغة" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY غير موجود بمتغيرات البيئة");
    return res.status(500).json({ error: "المساعد الذكي غير مفعّل حاليًا" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: message.trim() }] }],
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("رد غير متوقع من Gemini:", JSON.stringify(data));
      return res.status(502).json({ error: "تعذر الحصول على رد من المساعد" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("خطأ بالاتصال بالمساعد الذكي:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
