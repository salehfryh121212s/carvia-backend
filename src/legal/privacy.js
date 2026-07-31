export const privacyPolicyHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>سياسة الخصوصية — Carvia</title>
<style>
  body { font-family: -apple-system, Tahoma, Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1a1a; }
  h1 { font-size: 24px; } h2 { font-size: 18px; margin-top: 32px; }
  .en { direction: ltr; text-align: left; border-top: 2px solid #ddd; margin-top: 60px; padding-top: 30px; }
  .updated { color: #666; font-size: 13px; }
</style>
</head>
<body>

<h1>سياسة الخصوصية — Carvia</h1>
<p class="updated">آخر تحديث: يُحدَّث تلقائيًا عند كل نشر — عدّل التاريخ هنا يدويًا عند أي تغيير فعلي بالسياسة.</p>

<p>هذه السياسة توضح كيف يجمع تطبيق Carvia بياناتك ويستخدمها ويحميها.</p>

<h2>١. البيانات التي نجمعها</h2>
<ul>
  <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني أو رقم الجوال، كلمة المرور (تُخزَّن مشفّرة ولا نستطيع رؤيتها كنص واضح).</li>
  <li><strong>بيانات السيارة:</strong> اسم السيارة، الموديل، رقم اللوحة.</li>
  <li><strong>بيانات جهاز OBD-II:</strong> قراءات فنية من سيارتك (حرارة المحرك، دورات المحرك، مستوى الوقود، جهد البطارية، أكواد الأعطال) تُقرأ عبر Bluetooth من جهاز OBD-II متصل بسيارتك.</li>
  <li><strong>الموقع الجغرافي:</strong> يُستخدم فقط لعرض ورش الصيانة القريبة منك، ولا يُخزَّن بشكل دائم إلا إذا وافقت صراحة.</li>
</ul>

<h2>٢. كيف نستخدم بياناتك</h2>
<ul>
  <li>لعرض حالة سيارتك وتنبيهات الصيانة داخل التطبيق.</li>
  <li>لإيجاد ورش صيانة قريبة منك (عبر خدمة خرائط جوجل — Google Places API).</li>
  <li>لتسهيل حجز مواعيد الصيانة مع الورش.</li>
</ul>

<h2>٣. مشاركة البيانات مع أطراف ثالثة</h2>
<p>نستخدم Google Places API لعرض الورش القريبة بناءً على موقعك؛ إحداثياتك تُرسَل لجوجل لهذا الغرض فقط. لا نبيع بياناتك الشخصية لأي طرف ثالث لأغراض تسويقية.</p>

<h2>٤. الاحتفاظ بالبيانات وحذفها</h2>
<p>تُحفظ بياناتك طالما حسابك فعّال. يمكنك طلب حذف حسابك وكل بياناته المرتبطة عبر التواصل معنا (أضف بريد تواصل الدعم هنا).</p>

<h2>٥. أمان البيانات</h2>
<p>نستخدم تشفير كلمات المرور (bcrypt) وتوكنات مصادقة (JWT) لحماية حسابك. مع ذلك، لا توجد وسيلة نقل أو تخزين إلكتروني آمنة بنسبة 100%.</p>

<h2>٦. إخلاء مسؤولية بخصوص تشخيص السيارة</h2>
<p>التنبيهات والتقديرات المعروضة بالتطبيق (مثل احتمالية عطل أو تكلفة تقديرية) هي <strong>تقديرات أولية استرشادية</strong> مبنية على قواعد عامة وليست تشخيصًا فنيًا نهائيًا أو استشارة سلامة معتمدة. راجع ورشة أو فني متخصص دائمًا قبل اتخاذ أي قرار متعلق بالقيادة أو السلامة.</p>

<h2>٧. التواصل</h2>
<p>لأي استفسار حول هذه السياسة، تواصل معنا عبر: (أضف بريد إلكتروني رسمي هنا).</p>

<div class="en">
<h1>Privacy Policy — Carvia</h1>
<p>This policy explains how the Carvia app collects, uses, and protects your data.</p>

<h2>1. Data We Collect</h2>
<ul>
  <li><strong>Account data:</strong> name, email/phone, password (stored hashed, never in plain text).</li>
  <li><strong>Vehicle data:</strong> car name, model, plate number.</li>
  <li><strong>OBD-II device data:</strong> technical readings from your car (engine temperature, RPM, fuel level, battery voltage, diagnostic trouble codes) read via Bluetooth from a connected OBD-II device.</li>
  <li><strong>Location:</strong> used only to show nearby repair workshops, not stored permanently unless you explicitly opt in.</li>
</ul>

<h2>2. How We Use Your Data</h2>
<ul>
  <li>To show your vehicle's status and maintenance alerts in the app.</li>
  <li>To find nearby workshops (via Google Places API).</li>
  <li>To facilitate workshop booking.</li>
</ul>

<h2>3. Third-Party Sharing</h2>
<p>We use Google Places API to show nearby workshops based on your coordinates; your location is sent to Google only for this purpose. We do not sell your personal data to third parties for marketing.</p>

<h2>4. Data Retention & Deletion</h2>
<p>Your data is retained while your account is active. You may request deletion of your account and associated data by contacting us (add support email here).</p>

<h2>5. Data Security</h2>
<p>We use password hashing (bcrypt) and authentication tokens (JWT) to protect your account. No electronic storage or transmission method is 100% secure.</p>

<h2>6. Vehicle Diagnosis Disclaimer</h2>
<p>Alerts and estimates shown in the app (e.g., failure probability or estimated cost) are <strong>preliminary, rule-based guidance only</strong>, not a certified technical diagnosis or safety advice. Always consult a qualified mechanic before making any driving or safety decision.</p>

<h2>7. Contact</h2>
<p>For any question about this policy, contact us at: (add official email here).</p>
</div>

</body>
</html>
`;
