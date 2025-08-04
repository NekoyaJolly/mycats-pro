import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface PedigreeRow {
  キー: string;
  ＧＰ: string;
  猫名前１: string;
  猫名前２: string;
  猫名前３: string;
  猫種ｺｰﾄﾞ: string;
  性別: string;
  生年月日: string;
  繁殖者名: string;
  所有者名: string;
}

/**
 * CSVの内容を検索・プレビューする
 */
async function previewCSV() {
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データUTFVer.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSVファイルが見つかりません:', csvPath);
    return;
  }

  console.log('📂 CSVファイルを分析中...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 2, // ヘッダーをスキップ
  }) as PedigreeRow[];

  console.log(`📊 総レコード数: ${records.length}`);
  
  // 最初の数件をデバッグ出力
  console.log('\n🔍 デバッグ: 最初の3件の生データ');
  records.slice(0, 3).forEach((record, i) => {
    console.log(`Record ${i + 1}:`, {
      キー: record.キー,
      ＧＰ: record.ＧＰ,
      猫名前３: record.猫名前３,
    });
  });
  
  // キー範囲の分析（nullチェック追加）
  const keys = records
    .map(r => parseInt(r.キー))
    .filter(k => !isNaN(k) && k > 0)
    .sort((a, b) => a - b);
    
  if (keys.length === 0) {
    console.log('❌ 有効なキーが見つかりませんでした');
    return;
  }
  
  console.log(`🔢 キー範囲: ${keys[0]} - ${keys[keys.length - 1]}`);
  
  // サンプルデータの表示（nullチェック強化）
  console.log('\n📋 サンプルデータ (最初の10件):');
  console.log('─'.repeat(100));
  console.log('キー    | GP        | 猫名前３           | 猫種 | 性別 | 生年月日   | 繁殖者名');
  console.log('─'.repeat(100));
  
  records.slice(0, 10).forEach(record => {
    const key = (record.キー || '').toString().padEnd(6);
    const gp = (record.ＧＰ || '').toString().padEnd(9);
    const name = (record.猫名前３ || '').toString().padEnd(18);
    const breed = (record.猫種ｺｰﾄﾞ || '').toString().padEnd(4);
    const gender = record.性別 === '1' ? '雄' : record.性別 === '2' ? '雌' : '?';
    const birth = (record.生年月日 || '').toString().padEnd(10);
    const breeder = (record.繁殖者名 || '').toString().substring(0, 15);
    
    console.log(`${key} | ${gp} | ${name} | ${breed} | ${gender}  | ${birth} | ${breeder}`);
  });
  
  console.log('─'.repeat(100));
  
  // キー範囲別の統計
  console.log('\n📈 キー範囲別統計:');
  const ranges = [
    { name: '500000番台', min: 500000, max: 599999 },
    { name: '600000番台', min: 600000, max: 699999 },
    { name: '700000番台', min: 700000, max: 799999 },
    { name: '701606-701630', min: 701606, max: 701630 },
  ];
  
  ranges.forEach(range => {
    const count = keys.filter(k => k >= range.min && k <= range.max).length;
    console.log(`  ${range.name}: ${count}件`);
  });
  
  // 推奨サンプル範囲
  console.log('\n💡 推奨サンプル範囲:');
  console.log('  npm run csv:import -- --start 701606 --end 701630     # 25件程度');
  console.log('  npm run csv:import -- --start 700000 --end 700050     # 50件程度');
  console.log('  npm run csv:import -- --keys 701606,701610,701615     # 特定の3件');
  console.log('  npm run csv:preview                                    # プレビューモード');
}

if (require.main === module) {
  previewCSV();
}
