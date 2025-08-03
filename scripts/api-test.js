#!/usr/bin/env node

/**
 * 🧪 Cat Management System API Test Suite
 * 包括的なCRUD操作テストスクリプト
 */

const BASE_URL = 'http://localhost:3001/api/v1';

// テスト用データ
const testData = {
  breed: {
    code: 9999,
    name: "🐱 テスト猫種",
    description: "テスト用の猫種です。愛らしい性格が特徴的です。"
  },
  coatColor: {
    code: 9999,
    name: "🌈 テスト色柄",
    description: "テスト用の色柄パターンです。"
  },
  pedigree: {
    pedigreeId: "TEST-PED-001",
    catName: "🐾 テスト猫ちゃん",
    title: "テスト猫ちゃんの血統書",
    catteryName: "テストキャッテリー",
    gender: 2,
    eyeColor: "グリーン"
  }
};

// カラフルなログ出力
const log = {
  info: (msg) => console.log(`🔵 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  title: (msg) => console.log(`\n🚀 ${msg}\n${'='.repeat(50)}`)
};

// HTTP リクエストヘルパー
async function apiRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    log.info(`${method} ${endpoint} -> ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Request failed: ${response.status} ${response.statusText}`);
      log.error(`Error details: ${errorText}`);
      return null;
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ヘルスチェック
async function testHealth() {
  log.title('ヘルスチェック');
  const health = await apiRequest('GET', '/../../health');
  if (health) {
    log.success(`API Status: ${health.status} - ${health.service}`);
    return true;
  }
  return false;
}

// 猫種のCRUDテスト
async function testBreedsCRUD() {
  log.title('猫種 CRUD テスト');
  
  // CREATE
  log.info('猫種を作成中...');
  const created = await apiRequest('POST', '/breeds', testData.breed);
  if (!created) return false;
  
  log.success(`作成成功: ID ${created.id} - ${created.name}`);
  const breedId = created.id;

  // READ (一覧)
  log.info('猫種一覧を取得中...');
  const list = await apiRequest('GET', '/breeds');
  if (list) {
    log.success(`猫種一覧: ${list.length}件取得`);
  }

  // READ (詳細)
  log.info('猫種詳細を取得中...');
  const detail = await apiRequest('GET', `/breeds/${breedId}`);
  if (detail) {
    log.success(`詳細取得: ${detail.name}`);
  }

  // UPDATE
  log.info('猫種を更新中...');
  const updateData = { 
    code: 9999,
    name: "🐱 更新されたテスト猫種",
    description: "更新されたテスト用の猫種です。"
  };
  const updated = await apiRequest('PATCH', `/breeds/${breedId}`, updateData);
  if (updated) {
    log.success(`更新成功: ${updated.name}`);
  }

  // DELETE
  log.info('猫種を削除中...');
  const deleted = await apiRequest('DELETE', `/breeds/${breedId}`);
  if (deleted !== null) {
    log.success('削除成功');
  }

  return true;
}

// 色柄のCRUDテスト
async function testCoatColorsCRUD() {
  log.title('色柄 CRUD テスト');
  
  // CREATE
  log.info('色柄を作成中...');
  const created = await apiRequest('POST', '/coat-colors', testData.coatColor);
  if (!created) return false;
  
  log.success(`作成成功: ID ${created.id} - ${created.name}`);
  const colorId = created.id;

  // READ (一覧)
  log.info('色柄一覧を取得中...');
  const list = await apiRequest('GET', '/coat-colors');
  if (list) {
    log.success(`色柄一覧: ${list.length}件取得`);
  }

  // READ (詳細)
  log.info('色柄詳細を取得中...');
  const detail = await apiRequest('GET', `/coat-colors/${colorId}`);
  if (detail) {
    log.success(`詳細取得: ${detail.name}`);
  }

  // UPDATE
  log.info('色柄を更新中...');
  const updateData = { 
    code: 9999,
    name: "🌈 更新されたテスト色柄",
    description: "更新されたテスト用の色柄パターンです。"
  };
  const updated = await apiRequest('PATCH', `/coat-colors/${colorId}`, updateData);
  if (updated) {
    log.success(`更新成功: ${updated.name}`);
  }

  // DELETE
  log.info('色柄を削除中...');
  const deleted = await apiRequest('DELETE', `/coat-colors/${colorId}`);
  if (deleted !== null) {
    log.success('削除成功');
  }

  return true;
}

// 血統書のCRUDテスト
async function testPedigreesCRUD() {
  log.title('血統書 CRUD テスト');
  
  // CREATE
  log.info('血統書を作成中...');
  const created = await apiRequest('POST', '/pedigrees', testData.pedigree);
  if (!created) return false;
  
  log.success(`作成成功: ID ${created.id} - ${created.catName}`);
  const pedigreeId = created.id;

  // READ (一覧)
  log.info('血統書一覧を取得中...');
  const list = await apiRequest('GET', '/pedigrees');
  if (list) {
    log.success(`血統書一覧: ${list.length}件取得`);
  }

  // READ (詳細)
  log.info('血統書詳細を取得中...');
  const detail = await apiRequest('GET', `/pedigrees/${pedigreeId}`);
  if (detail) {
    log.success(`詳細取得: ${detail.catName}`);
  }

  // UPDATE
  log.info('血統書を更新中...');
  const updateData = { 
    pedigreeId: "TEST-PED-001",
    catName: "🐾 更新されたテスト猫ちゃん",
    title: "更新されたテスト猫ちゃんの血統書",
    catteryName: "更新されたテストキャッテリー",
    gender: 2,
    eyeColor: "ブルー"
  };
  const updated = await apiRequest('PATCH', `/pedigrees/${pedigreeId}`, updateData);
  if (updated) {
    log.success(`更新成功: ${updated.catName}`);
  }

  // DELETE
  log.info('血統書を削除中...');
  const deleted = await apiRequest('DELETE', `/pedigrees/${pedigreeId}`);
  if (deleted !== null) {
    log.success('削除成功');
  }

  return true;
}

// 統計情報のテスト
async function testStatistics() {
  log.title('統計情報テスト');
  
  const endpoints = [
    '/breeds/statistics',
    '/coat-colors/statistics'
  ];

  for (const endpoint of endpoints) {
    log.info(`統計取得: ${endpoint}`);
    const stats = await apiRequest('GET', endpoint);
    if (stats) {
      log.success(`統計データ取得成功`);
    }
  }
}

// メイン実行関数
async function runTests() {
  console.log('🎯 Cat Management System API Test Suite');
  console.log('==========================================\n');

  const tests = [
    testHealth,
    testBreedsCRUD,
    testCoatColorsCRUD, 
    testPedigreesCRUD,
    testStatistics
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      log.error(`テスト実行エラー: ${error.message}`);
    }
    console.log(''); // 空行
  }

  // 結果サマリ
  log.title('テスト結果サマリ');
  log.info(`実行テスト数: ${totalTests}`);
  log.success(`成功: ${passedTests}`);
  
  if (passedTests < totalTests) {
    log.error(`失敗: ${totalTests - passedTests}`);
  }

  if (passedTests === totalTests) {
    log.success('🎉 全てのテストが成功しました！');
  } else {
    log.warning('⚠️ 一部のテストが失敗しました。ログを確認してください。');
  }
}

// 実行
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testHealth, testBreedsCRUD, testCoatColorsCRUD, testPedigreesCRUD };
