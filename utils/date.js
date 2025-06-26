function getTodayStr() {
  const now = new Date();
  const kstNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );

  const yyyy = kstNow.getFullYear();
  const mm = String(kstNow.getMonth() + 1).padStart(2, "0");
  const dd = String(kstNow.getDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
}

module.exports = getTodayStr;
