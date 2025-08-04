import * as fs from 'fs';
import * as path from 'path';

/**
 * 血統書CSVのフィールド名をリネームして、1行目を削除するスクリプト
 * 
 * 変更内容:
 * 1. 1行目（日本語ヘッダー）を削除
 * 2. 祖父母世代以降のフィールド名をF/M略称に変更
 * 3. 必須フィールド: PedigreeID, Gender
 * 4. その他のフィールドはNull可
 */

async function renamePedigreeCsvFields() {
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データUTFVer.csv');
  const outputPath = path.join(__dirname, '../../NewPedigree/血統書データRenamed.csv');
  
  try {
    console.log('🔄 CSVファイルを読み込み中...');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');
    
    if (lines.length < 3) {
      throw new Error('CSVファイルが正しい形式ではありません');
    }
    
    console.log(`📊 総行数: ${lines.length}`);
    console.log(`📝 1行目 (削除対象): ${lines[0].substring(0, 100)}...`);
    console.log(`📝 2行目 (現在のヘッダー): ${lines[1].substring(0, 100)}...`);
    
    // 2行目のヘッダーを取得してリネーム
    const originalHeader = lines[1];
    const renamedHeader = renameFields(originalHeader);
    
    console.log('🔄 フィールド名をリネーム中...');
    console.log(`📝 リネーム後: ${renamedHeader.substring(0, 100)}...`);
    
    // 1行目を削除し、リネームしたヘッダーとデータ行を結合
    const newContent = [renamedHeader, ...lines.slice(2)].join('\n');
    
    // 新しいファイルに保存
    fs.writeFileSync(outputPath, newContent, 'utf-8');
    
    console.log('✅ CSVファイルのリネームが完了しました');
    console.log(`📁 出力ファイル: ${outputPath}`);
    console.log(`📊 新しい総行数: ${lines.length - 1} (ヘッダー1行 + データ${lines.length - 3}行)`);
    
    // 結果の確認
    const newLines = newContent.split('\n');
    console.log(`📝 新しいヘッダー: ${newLines[0].substring(0, 150)}...`);
    console.log(`📝 最初のデータ行: ${newLines[1].substring(0, 100)}...`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

/**
 * フィールド名をリネームする関数
 */
function renameFields(headerLine: string): string {
  const fields = headerLine.split(',');
  
  // フィールド名のマッピング（祖父母世代以降をF/M略称に変更）
  const fieldMapping: { [key: string]: string } = {
    // 基本情報（そのまま）
    'PedigreeID': 'PedigreeID',
    'ChampionFlag': 'ChampionFlag',
    'Title': 'Title',
    'CatteryName': 'CatteryName',
    'CatName': 'CatName',
    'BreedCode': 'BreedCode',
    'Gender': 'Gender',
    'EyeColor': 'EyeColor',
    'CoatColorCode': 'CoatColorCode',
    'BirthDate': 'BirthDate',
    'BreederName': 'BreederName',
    'OwnerName': 'OwnerName',
    'RegistrationDate': 'RegistrationDate',
    'BrotherCount': 'BrotherCount',
    'SisterCount': 'SisterCount',
    'Notes': 'Notes',
    'Notes2': 'Notes2',
    'OtherNo': 'OtherNo',
    
    // 父母情報（そのまま）
    'FatherChampionFlag': 'FatherChampionFlag',
    'FatherTitle': 'FatherTitle',
    'FatherCatteryName': 'FatherCatteryName',
    'FatherCatName': 'FatherCatName',
    'FatherCoatColor': 'FatherCoatColor',
    'FatherEyeColor': 'FatherEyeColor',
    'FatherJCU': 'FatherJCU',
    'FatherOtherCode': 'FatherOtherCode',
    'MotherChampionFlag': 'MotherChampionFlag',
    'MotherTitle': 'MotherTitle',
    'MotherCatteryName': 'MotherCatteryName',
    'MotherCatName': 'MotherCatName',
    'MotherCoatColor': 'MotherCoatColor',
    'MotherEyeColor': 'MotherEyeColor',
    'MotherJCU': 'MotherJCU',
    'MotherOtherCode': 'MotherOtherCode',
    
    // 祖父母世代（F/M略称に変更）
    'PatGrandFatherChampionFlag': 'FFChampionFlag',
    'PatGrandFatherTitle': 'FFTitle',
    'PatGrandFatherCatteryName': 'FFCatteryName',
    'PatGrandFatherCatName': 'FFCatName',
    'PatGrandFatherJCU': 'FFJCU',
    'PatGrandMotherChampionFlag': 'FMChampionFlag',
    'PatGrandMotherTitle': 'FMTitle',
    'PatGrandMotherCatteryName': 'FMCatteryName',
    'PatGrandMotherCatName': 'FMCatName',
    'PatGrandMotherJCU': 'FMJCU',
    'MatGrandFatherChampionFlag': 'MFChampionFlag',
    'MatGrandFatherTitle': 'MFTitle',
    'MatGrandFatherCatteryName': 'MFCatteryName',
    'MatGrandFatherCatName': 'MFCatName',
    'MatGrandFatherJCU': 'MFJCU',
    'MatGrandMotherChampionFlag': 'MMChampionFlag',
    'MatGrandMotherTitle': 'MMTitle',
    'MatGrandMotherCatteryName': 'MMCatteryName',
    'MatGrandMotherCatName': 'MMCatName',
    'MatGrandMotherJCU': 'MMJCU',
    
    // 曾祖父母世代（FF, FM, MF, MM + F/M）
    'PatGreatGrandFatherChampionFlag': 'FFFChampionFlag',
    'PatGreatGrandFatherTitle': 'FFFTitle',
    'PatGreatGrandFatherCatteryName': 'FFFCatteryName',
    'PatGreatGrandFatherCatName': 'FFFCatName',
    'PatGreatGrandFatherJCU': 'FFFJCU',
    'PatGreatGrandMotherChampionFlag': 'FFMChampionFlag',
    'PatGreatGrandMotherTitle': 'FFMTitle',
    'PatGreatGrandMotherCatteryName': 'FFMCatteryName',
    'PatGreatGrandMotherCatName': 'FFMCatName',
    'PatGreatGrandMotherJCU': 'FFMJCU',
    'PatGreatGrandFatherMatChampionFlag': 'FMFChampionFlag',
    'PatGreatGrandFatherMatTitle': 'FMFTitle',
    'PatGreatGrandFatherMatCatteryName': 'FMFCatteryName',
    'PatGreatGrandFatherMatCatName': 'FMFCatName',
    'PatGreatGrandFatherMatJCU': 'FMFJCU',
    'PatGreatGrandMotherMatChampionFlag': 'FMMChampionFlag',
    'PatGreatGrandMotherMatTitle': 'FMMTitle',
    'PatGreatGrandMotherMatCatteryName': 'FMMCatteryName',
    'PatGreatGrandMotherMatCatName': 'FMMCatName',
    'PatGreatGrandMotherMatJCU': 'FMMJCU',
    'MatGreatGrandFatherChampionFlag': 'MFFChampionFlag',
    'MatGreatGrandFatherTitle': 'MFFTitle',
    'MatGreatGrandFatherCatteryName': 'MFFCatteryName',
    'MatGreatGrandFatherCatName': 'MFFCatName',
    'MatGreatGrandFatherJCU': 'MFFJCU',
    'MatGreatGrandMotherChampionFlag': 'MFMChampionFlag',
    'MatGreatGrandMotherTitle': 'MFMTitle',
    'MatGreatGrandMotherCatteryName': 'MFMCatteryName',
    'MatGreatGrandMotherCatName': 'MFMCatName',
    'MatGreatGrandMotherJCU': 'MFMJCU',
    'MatGreatGrandFatherMatChampionFlag': 'MMFChampionFlag',
    'MatGreatGrandFatherMatTitle': 'MMFTitle',
    'MatGreatGrandFatherMatCatteryName': 'MMFCatteryName',
    'MatGreatGrandFatherMatCatName': 'MMFCatName',
    'MatGreatGrandFatherMatJCU': 'MMFJCU',
    'MatGreatGrandMotherMatChampionFlag': 'MMMChampionFlag',
    'MatGreatGrandMotherMatTitle': 'MMMTitle',
    'MatGreatGrandMotherMatCatteryName': 'MMMCatteryName',
    'MatGreatGrandMotherMatCatName': 'MMMCatName',
    'MatGreatGrandMotherMatJCU': 'MMMJCU',
    
    // その他
    'OldCode': 'OldCode'
  };
  
  // フィールド名をマッピングに従って変更
  const renamedFields = fields.map(field => {
    const trimmedField = field.trim();
    return fieldMapping[trimmedField] || trimmedField;
  });
  
  return renamedFields.join(',');
}

// スクリプト実行
if (require.main === module) {
  renamePedigreeCsvFields()
    .then(() => {
      console.log('🎉 血統書CSVのリネームが完了しました！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 リネーム処理でエラーが発生しました:', error);
      process.exit(1);
    });
}

export { renamePedigreeCsvFields };
