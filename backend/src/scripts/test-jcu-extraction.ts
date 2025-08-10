// JCU抽出関数のテスト

function extractPedigreeNumber(jcuString: string): string | null {
  if (!jcuString) return null;

  console.log(`入力: "${jcuString}"`);

  // "JCU-No " または "WCA-No " を除去
  const match = jcuString.match(/(?:JCU-No|WCA-No)\s+(.+)/);
  if (match) {
    const fullNumber = match[1].trim();
    console.log(`フル番号: "${fullNumber}"`);

    // "XXXXXX-YYYYYY" から末尾の "YYYYYY" を抽出
    const keyMatch = fullNumber.match(/^\d{6}-(\d{6})$/);
    if (keyMatch) {
      const result = keyMatch[1]; // 末尾6桁のキー部分
      console.log(`抽出結果: "${result}"`);
      return result;
    }
    return fullNumber;
  }

  // 直接血統書番号の場合
  if (jcuString.match(/^\d{6}$/)) {
    console.log(`直接番号: "${jcuString}"`);
    return jcuString;
  }

  console.log("抽出失敗");
  return null;
}

// テストケース
const testCases = [
  "JCU-No 921361-163553",
  "WCA-No 841901-700538",
  "JCU-No 441652-142007",
  "WCA-No 662862-700900",
  "JCU-No 400371-150501",
  "JCU-No 391402-116197",
];

console.log("🧪 JCU抽出テスト:\n");

testCases.forEach((testCase) => {
  console.log(`テスト: ${testCase}`);
  const result = extractPedigreeNumber(testCase);
  console.log(`結果: ${result}\n`);
});
