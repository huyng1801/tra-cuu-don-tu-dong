const UNITS = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const TEENS = [
  "mười",
  "mười một",
  "mười hai",
  "mười ba",
  "mười bốn",
  "mười lăm",
  "mười sáu",
  "mười bảy",
  "mười tám",
  "mười chín",
];

function readTriple(value: number, showZeroHundred = false) {
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const unit = value % 10;
  const parts: string[] = [];

  if (hundred > 0) {
    parts.push(`${UNITS[hundred]} trăm`);
  } else if (showZeroHundred) {
    parts.push("không trăm");
  }

  if (ten > 1) {
    parts.push(`${UNITS[ten]} mươi`);
    if (unit === 1) {
      parts.push("mốt");
    } else if (unit === 5) {
      parts.push("lăm");
    } else if (unit > 0) {
      parts.push(UNITS[unit]);
    }
  } else if (ten === 1) {
    parts.push(TEENS[unit]);
  } else if (unit > 0) {
    if (showZeroHundred || hundred > 0) {
      parts.push("lẻ");
    }
    parts.push(UNITS[unit]);
  }

  return parts.join(" ").trim();
}

function readNumber(value: number) {
  if (value === 0) {
    return "không";
  }

  const billion = Math.floor(value / 1_000_000_000);
  const million = Math.floor((value % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((value % 1_000_000) / 1_000);
  const remainder = value % 1_000;
  const parts: string[] = [];

  if (billion > 0) {
    parts.push(`${readTriple(billion)} tỷ`);
  }

  if (million > 0) {
    parts.push(`${readTriple(million, billion > 0)} triệu`);
  }

  if (thousand > 0) {
    parts.push(`${readTriple(thousand, billion > 0 || million > 0)} nghìn`);
  }

  if (remainder > 0) {
    parts.push(readTriple(remainder, billion > 0 || million > 0 || thousand > 0));
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function formatVietnameseCurrencyWords(amount: number) {
  if (!Number.isFinite(amount) || amount < 0) {
    return "";
  }

  const normalized = Math.round(amount);

  if (normalized === 0) {
    return "Không đồng";
  }

  const words = readNumber(normalized);
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} đồng`;
}
