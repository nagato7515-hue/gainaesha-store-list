const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Windows上の一般的なChromeの実行ファイルパス
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('Starting drag test...');
  
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('Chrome executable not found at: ' + CHROME_PATH);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage();
  
  // コンソールエラーの監視
  page.on('pageerror', err => {
    console.log('PAGE ERROR (CRITICAL):', err.message);
  });
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  try {
    // ローカルサーバーへアクセス
    console.log('Navigating to http://127.0.0.1:8080...');
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle0' });
    
    // サンプルデータを入力
    console.log('Loading sample data...');
    await page.click('#load-sample-btn');
    await new Promise(r => setTimeout(r, 2000)); // 描画・透過画像処理待ち

    // ドラッグ対象要素の特定
    const assetId = '#asset-dressing';
    console.log(`Locating target element: ${assetId}`);
    
    // アセットの透過処理が完了（srcがdata:imageで始まる）するのを確実に待つ
    console.log('Waiting for transparent processing (data:image) to complete...');
    await page.waitForFunction((id) => {
      const img = document.querySelector(`${id} img`);
      return img && img.src.startsWith('data:');
    }, { timeout: 5000 }, assetId);
    
    // 現在の位置を取得
    let pos1 = await page.evaluate((id) => {
      const el = document.querySelector(id);
      return { left: el.style.left, top: el.style.top };
    }, assetId);
    console.log('Initial Position:', pos1);

    // 全アセットのバウンディングボックスを出力して重なりを確認
    console.log('--- Current bounding boxes of all assets ---');
    const assetKeys = ['#asset-dressing', '#asset-map', '#asset-skyline', '#asset-rice', '#asset-lemon', '#asset-veggies'];
    for (const key of assetKeys) {
      const el = await page.$(key);
      if (el) {
        const box = await el.boundingBox();
        console.log(`${key}:`, box ? `x=\${box.x.toFixed(1)}, y=\${box.y.toFixed(1)}, w=\${box.width.toFixed(1)}, h=\${box.height.toFixed(1)}` : 'null');
      }
    }
    console.log('---------------------------------------------');

    // 1回目のドラッグ＆ドロップシミュレーション
    console.log('Performing Drag 1...');
    const element = await page.$(assetId);
    const boundingBox = await element.boundingBox();
    
    if (!boundingBox) {
      console.error('FAIL: Bounding box of target element is null. Element might be invisible or off-screen.');
      process.exit(1);
    }
    
    const startX = boundingBox.x + boundingBox.width / 2;
    const startY = boundingBox.y + boundingBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY + 50, { steps: 10 }); // 右下へ移動
    await page.mouse.up();
    
    await new Promise(r => setTimeout(r, 500)); // 状態安定待ち

    let pos2 = await page.evaluate((id) => {
      const el = document.querySelector(id);
      return { left: el.style.left, top: el.style.top };
    }, assetId);
    console.log('Position after Drag 1:', pos2);

    // 2回目のドラッグ＆ドロップシミュレーション
    console.log('Performing Drag 2...');
    const boundingBox2 = await element.boundingBox();
    const startX2 = boundingBox2.x + boundingBox2.width / 2;
    const startY2 = boundingBox2.y + boundingBox2.height / 2;

    await page.mouse.move(startX2, startY2);
    await page.mouse.down();
    await page.mouse.move(startX2 - 50, startY2 - 30, { steps: 10 }); // 左上へ移動
    await page.mouse.up();

    await new Promise(r => setTimeout(r, 500)); // 状態安定待ち

    let pos3 = await page.evaluate((id) => {
      const el = document.querySelector(id);
      return { left: el.style.left, top: el.style.top };
    }, assetId);
    console.log('Position after Drag 2:', pos3);

    // --- スライダー操作後のテストを追加 ---
    console.log('Modifying size slider to 200px...');
    await page.evaluate(() => {
      const slider = document.querySelector('#size-dressing');
      slider.value = 200;
      slider.dispatchEvent(new Event('input'));
      slider.dispatchEvent(new Event('change'));
    });
    
    // スライダーの値が反映されて幅が変わっているか確認
    let currentWidth = await page.evaluate((id) => {
      const el = document.querySelector(id);
      return el.style.width;
    }, assetId);
    console.log('Element width after slider modification:', currentWidth);
    
    await new Promise(r => setTimeout(r, 500)); // 安定待ち

    // 3回目のドラッグ＆ドロップシミュレーション
    console.log('Performing Drag 3 (after slider modification)...');
    const boundingBox3 = await element.boundingBox();
    
    if (!boundingBox3) {
      console.error('FAIL: Bounding box of target element is null after resizing.');
      process.exit(1);
    }
    
    const startX3 = boundingBox3.x + boundingBox3.width / 2;
    const startY3 = boundingBox3.y + boundingBox3.height / 2;

    await page.mouse.move(startX3, startY3);
    await page.mouse.down();
    await page.mouse.move(startX3 + 40, startY3 - 40, { steps: 10 }); // 右上へ移動
    await page.mouse.up();

    await new Promise(r => setTimeout(r, 500));

    let pos4 = await page.evaluate((id) => {
      const el = document.querySelector(id);
      return { left: el.style.left, top: el.style.top };
    }, assetId);
    console.log('Position after Drag 3:', pos4);

    // テスト成否の判定
    let success = true;
    if (pos1.left === pos2.left && pos1.top === pos2.top) {
      console.error('FAIL: Drag 1 did not change the element position.');
      success = false;
    } 
    if (pos2.left === pos3.left && pos2.top === pos3.top) {
      console.error('FAIL: Drag 2 did not change the element position.');
      success = false;
    }
    if (pos3.left === pos4.left && pos3.top === pos4.top) {
      console.error('FAIL: Drag 3 (after slider) did not change the element position (Frozen!).');
      success = false;
    }
    
    if (success) {
      console.log('SUCCESS: All drags (including after slider) work perfectly!');
    }

    // エビデンスとしてのスクリーンショット保存
    const screenshotPath = path.join(__dirname, 'drag_test.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to: ' + screenshotPath);

    // 画像を会話フォルダ（artifact用）にもコピーする
    const artifactPath = 'C:\\Users\\nagat\\.gemini\\antigravity\\brain\\1c9c69b8-eb67-42c6-8e33-0ee9d502cdcb\\drag_test.png';
    fs.copyFileSync(screenshotPath, artifactPath);
    console.log('Screenshot copied to artifact path: ' + artifactPath);

  } catch (error) {
    console.error('Test execution failed with error:', error);
  } finally {
    await browser.close();
    console.log('Test completed.');
  }
}

runTest();
