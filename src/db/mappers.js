// قاعدة البيانات تخزن الأعمدة بصيغة snake_case (full_name, due_in_km...)
// لكن تطبيق الجوال يتوقع camelCase (fullName, dueInKm...) لأن هذا كان
// شكل البيانات وقت كانت مخزنة بالـ arrays. هذي الدالة تحول أي صف
// (row) راجع من قاعدة البيانات لنفس الشكل القديم، بدون ما نغيّر شي
// بتطبيق الجوال.
export function toCamel(row) {
  if (!row) return row;
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}
