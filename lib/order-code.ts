export function generateOrderCode(now = new Date()) {
  const stamp = [
    now.getFullYear().toString().slice(-2),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
  ].join("");

  const time = [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join("");

  const random = Math.floor(Math.random() * 900 + 100).toString();

  return `CRM-${stamp}-${time}-${random}`;
}

