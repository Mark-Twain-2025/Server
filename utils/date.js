// 오늘날짜 문자열 반환(KST)
function getTodayStr() {
  const now = new Date();

  const offset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + offset);

  const yyyy = kstNow.getFullYear();
  const mm = String(kstNow.getMonth() + 1).padStart(2, "0");
  const dd = String(kstNow.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

module.exports = getTodayStr;
