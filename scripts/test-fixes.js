// バグ修正後のAPIテスト
async function testFixedAPIs() {
  console.log('🔍 修正されたAPI機能のテスト開始...');
  
  try {
    // 1. 猫種検索テスト（nameEnフィールド修正済み）
    console.log('\n📝 猫種検索テスト...');
    const breedResponse = await fetch('http://localhost:3001/api/v1/breeds?search=アメリカン');
    console.log(`猫種検索レスポンス: ${breedResponse.status}`);
    if (breedResponse.ok) {
      const breedData = await breedResponse.json();
      console.log('✅ 猫種検索成功 - データ件数:', breedData.total || 0);
    } else {
      const error = await breedResponse.text();
      console.log('❌ 猫種検索エラー:', error);
    }

    // 2. 色柄検索テスト（nameEn, colorCodeフィールド修正済み）
    console.log('\n📝 色柄検索テスト...');
    const colorResponse = await fetch('http://localhost:3001/api/v1/coat-colors?search=三毛');
    console.log(`色柄検索レスポンス: ${colorResponse.status}`);
    if (colorResponse.ok) {
      const colorData = await colorResponse.json();
      console.log('✅ 色柄検索成功 - データ件数:', colorData.total || 0);
    } else {
      const error = await colorResponse.text();
      console.log('❌ 色柄検索エラー:', error);
    }

    // 3. 家系図エンドポイントテスト（新規追加）
    console.log('\n📝 家系図エンドポイントテスト...');
    const familyResponse = await fetch('http://localhost:3001/api/v1/pedigrees/1/family-tree');
    console.log(`家系図レスポンス: ${familyResponse.status}`);
    if (familyResponse.ok) {
      const familyData = await familyResponse.json();
      console.log('✅ 家系図エンドポイント成功');
    } else {
      const error = await familyResponse.text();
      console.log('❌ 家系図エンドポイントエラー:', error);
    }

    // 4. 新しいフィルタテスト（catteryName, eyeColor追加）
    console.log('\n📝 新しいフィルタテスト...');
    const filterResponse = await fetch('http://localhost:3001/api/v1/pedigrees?catteryName=桜&eyeColor=青');
    console.log(`フィルタレスポンス: ${filterResponse.status}`);
    if (filterResponse.ok) {
      const filterData = await filterResponse.json();
      console.log('✅ 新しいフィルタ成功 - データ件数:', filterData.total || 0);
    } else {
      const error = await filterResponse.text();
      console.log('❌ 新しいフィルタエラー:', error);
    }

    // 5. 血統書検索テスト（既存の検索機能）
    console.log('\n📝 血統書検索テスト...');
    const pedigreeResponse = await fetch('http://localhost:3001/api/v1/pedigrees?search=美桜');
    console.log(`血統書検索レスポンス: ${pedigreeResponse.status}`);
    if (pedigreeResponse.ok) {
      const pedigreeData = await pedigreeResponse.json();
      console.log('✅ 血統書検索成功 - データ件数:', pedigreeData.total || 0);
    } else {
      const error = await pedigreeResponse.text();
      console.log('❌ 血統書検索エラー:', error);
    }

    console.log('\n🎯 修正APIテスト完了！');

  } catch (error) {
    console.log('❌ テスト実行エラー:', error.message);
  }
}

testFixedAPIs();
