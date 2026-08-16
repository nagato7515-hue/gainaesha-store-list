/* ==========================================================================
   雅稲惠舎 店舗一覧画像ジェネレーター - スクリプト
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 都道府県順の定義 (北から南) ---
  const PREFECTURE_ORDER = [
    "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
    "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
    "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知",
    "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
    "鳥取", "島根", "岡山", "広島", "山口",
    "徳島", "香川", "愛媛", "高知",
    "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"
  ];

  // 都道府県名から末尾の「都府県」を取り除く（京都、北海道は対象外）
  function cleanPrefName(pref) {
    if (!pref) return '';
    const trimmed = pref.trim();
    if (trimmed === '京都' || trimmed === '北海道' || trimmed === '京都府' || trimmed === '北海道道') {
      return trimmed === '京都府' ? '京都' : (trimmed === '北海道道' ? '北海道' : trimmed);
    }
    return trimmed.replace(/(県|府|都|道)$/, '');
  }

  // --- デフォルトの店舗データ（添付画像の再現用） ---
  const DEFAULT_STORE_DATA = `【千葉エリア】
・ファミリーマート南房総丸山店
・道の駅 とみうら枇杷倶楽部
・道の駅 富楽里とみやま
・道の駅 三芳村鄙の里
・はなまる市場 (道の駅ローズマリー公園内)
・道の駅 グリーンファーム館山
・渚の駅 海のマルシェたてやま
・無印良品 (みんなみの里内)
・明治屋 柏ストアー
・ザ・ガーデン自由が丘 千葉店
・ウラヤスマーケッツ
・THE FARM BASE

【東京エリア】
・明治屋 広尾ストアー
・スーパーナニワヤ
・三徳 若荷谷店
・信濃屋 食品店
・信濃屋 六本木ヒルズ店
・信濃屋 cask
・信濃屋 喜多見駅前店
・サカガミ 野方店
・麦わら帽子
・ガーデンズマルシェ

【その他の地域】
宮城 | 明治屋 仙台一番町ストアー
栃木 | 湊町エピスリー
埼玉 | 明治屋 川越ストアー
埼玉 | 食品館ハーズ
埼玉 | アルズ 武蔵浦和店
神奈川 | アルズ 中山店
神奈川 | 大野菜
新潟 | 明治屋 新潟ストアー
山梨 | ひまわり市場
静岡 | 明治屋 浜松ストアー
静岡 | あおき 沼津西店
京都 | 明治屋 京都三條ストアー
大阪 | メルカートピッコロ 淀屋橋本店
兵庫 | 明治屋 芦屋ストアー
広島 | オーガニックプラザ イオンタウン楽々園店
福岡 | AND THE SOIL.
鹿児島 | ハルタ いづろ店`;

  // --- DOM要素の取得 ---
  const elements = {
    // インプット類
    storeInput: document.getElementById('store-data-input'),
    loadSampleBtn: document.getElementById('load-sample-btn'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    fileInput: document.getElementById('file-input'),
    dropZone: document.getElementById('drop-zone'),
    
    // かんたんGUI入力関連
    tabBtnGui: document.getElementById('tab-btn-gui'),
    tabBtnText: document.getElementById('tab-btn-text'),
    tabContentGui: document.getElementById('tab-content-gui'),
    tabContentText: document.getElementById('tab-content-text'),
    addStorePref: document.getElementById('add-store-pref'),
    addStoreName: document.getElementById('add-store-name'),
    addStoreBtn: document.getElementById('add-store-btn'),
    guiItemsArea1: document.getElementById('gui-items-area1'),
    guiItemsArea2: document.getElementById('gui-items-area2'),
    guiItemsArea3: document.getElementById('gui-items-area3'),
    countArea1: document.getElementById('count-area1'),
    countArea2: document.getElementById('count-area2'),
    countArea3: document.getElementById('count-area3'),

    titleInput: document.getElementById('title-input'),
    subtitleInput: document.getElementById('subtitle-input'),
    dateInput: document.getElementById('date-input'),
    area1TitleInput: document.getElementById('area1-title-input'),
    area2TitleInput: document.getElementById('area2-title-input'),
    area3TitleInput: document.getElementById('area3-title-input'),
    footerLeftInput: document.getElementById('footer-left-input'),
    footerRightInput: document.getElementById('footer-right-input'),
    
    // レイアウト・デザイン
    aspectRadio45: document.querySelector('input[name="aspect-ratio"][value="4-5"]'),
    aspectRadio11: document.querySelector('input[name="aspect-ratio"][value="1-1"]'),
    fontFamilySelect: document.getElementById('font-family-select'),
    fontSizeAdjust: document.getElementById('font-size-adjust'),
    fontSizeVal: document.getElementById('font-size-val'),
    fontSizeTitle: document.getElementById('font-size-title'),
    fontSizeTitleVal: document.getElementById('font-size-title-val'),
    fontSizeSubtitle: document.getElementById('font-size-subtitle'),
    fontSizeSubtitleVal: document.getElementById('font-size-subtitle-val'),
    fontSizeDate: document.getElementById('font-size-date'),
    fontSizeDateVal: document.getElementById('font-size-date-val'),
    fontSizeHeading: document.getElementById('font-size-heading'),
    fontSizeHeadingVal: document.getElementById('font-size-heading-val'),
    fontSizeFooter: document.getElementById('font-size-footer'),
    fontSizeFooterVal: document.getElementById('font-size-footer-val'),
    
    // カラーピッカー
    colorBg: document.getElementById('color-bg'),
    colorBgText: document.getElementById('color-bg-text'),
    colorText: document.getElementById('color-text'),
    colorTextText: document.getElementById('color-text-text'),
    colorArea1: document.getElementById('color-area1'),
    colorArea1Text: document.getElementById('color-area1-text'),
    colorArea2: document.getElementById('color-area2'),
    colorArea2Text: document.getElementById('color-area2-text'),
    colorArea3: document.getElementById('color-area3'),
    colorArea3Text: document.getElementById('color-area3-text'),
    colorBorder: document.getElementById('color-border'),
    colorBorderText: document.getElementById('color-border-text'),

    // イラスト管理
    resetAssetsBtn: document.getElementById('reset-assets-btn'),
    resetAllBtn: document.getElementById('reset-all-btn'),

    // プレビュー表示先
    captureTarget: document.getElementById('capture-target'),
    previewWrapper: document.querySelector('.preview-wrapper'),
    renderDate: document.getElementById('render-date'),
    renderTitle: document.getElementById('render-title'),
    renderSubtitle: document.getElementById('render-subtitle'),
    renderArea1Title: document.getElementById('render-area1-title'),
    renderArea2Title: document.getElementById('render-area2-title'),
    renderArea3Title: document.getElementById('render-area3-title'),
    listArea1: document.getElementById('list-area1'),
    listArea2: document.getElementById('list-area2'),
    listArea3: document.getElementById('list-area3'),
    renderFooterLeft: document.getElementById('text-footer-left'),
    renderFooterRight: document.getElementById('render-footer-right'),
    postBorderInner: document.querySelector('.post-border-inner'),
    postFooter: document.querySelector('.post-footer'),
    
    // モバイル・ズームコントロール
    controlPanel: document.getElementById('control-panel'),
    previewArea: document.getElementById('preview-area'),
    btnShowPanel: document.getElementById('btn-show-panel'),
    btnShowPreview: document.getElementById('btn-show-preview'),
    zoomFitBtn: document.getElementById('zoom-fit-btn'),
    zoom100Btn: document.getElementById('zoom-100-btn'),
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
    
    // ダウンロード
    downloadBtn: document.getElementById('download-btn')
  };

  // イラストトグルとサイズ調整の動的マッピング
  const assets = {
    dressing: {
      el: document.getElementById('asset-dressing'),
      toggle: document.getElementById('toggle-dressing'),
      sizeSlider: document.getElementById('size-dressing'),
      sizeVal: document.getElementById('size-val-dressing'),
      defaultPos: { top: 20, left: 35 }
    },
    map: {
      el: document.getElementById('asset-map'),
      toggle: document.getElementById('toggle-map'),
      sizeSlider: document.getElementById('size-map'),
      sizeVal: document.getElementById('size-val-map'),
      defaultPos: { top: 50, left: 32 }
    },
    skyline: {
      el: document.getElementById('asset-skyline'),
      toggle: document.getElementById('toggle-skyline'),
      sizeSlider: document.getElementById('size-skyline'),
      sizeVal: document.getElementById('size-val-skyline'),
      defaultPos: { top: 22, left: 74 }
    },
    rice: {
      el: document.getElementById('asset-rice'),
      toggle: document.getElementById('toggle-rice'),
      sizeSlider: document.getElementById('size-rice'),
      sizeVal: document.getElementById('size-val-rice'),
      defaultPos: { top: 45, left: 88 }
    },
    lemon: {
      el: document.getElementById('asset-lemon'),
      toggle: document.getElementById('toggle-lemon'),
      sizeSlider: document.getElementById('size-lemon'),
      sizeVal: document.getElementById('size-val-lemon'),
      defaultPos: { top: 89, left: 88 }
    },
    veggies: {
      el: document.getElementById('asset-veggies'),
      toggle: document.getElementById('toggle-veggies'),
      sizeSlider: document.getElementById('size-veggies'),
      sizeVal: document.getElementById('size-val-veggies'),
      defaultPos: { top: 68, left: 30 }
    }
  };

  // --- アプリケーションの状態 ---
  let appState = {
    currentScale: 1.0,
    storeData: [],
    draggingElement: null,
    dragStartPos: { x: 0, y: 0 },
    elementStartPos: { top: 0, left: 0 }
  };

  const STORAGE_KEY = 'gainaesha_generator_saved_state_v1';

  // --- 初期設定 ---
  function init() {
    // イベントリスナーの追加
    addEventListeners();

    // LocalStorage から保存された状態を復元
    const hasSavedState = loadStateFromStorage();

    // 初回アクセス（保存データがない）場合のみデフォルト値をセット
    if (!hasSavedState) {
      // サンプルデータを入力欄にセットし、初回パース
      elements.storeInput.value = DEFAULT_STORE_DATA;
      parseStoreData();

      // アセットの初期サイズをスライダー値から反映
      Object.keys(assets).forEach(key => {
        const asset = assets[key];
        const size = asset.sizeSlider.value;
        asset.el.style.width = size + 'px';
        asset.el.style.minWidth = size + 'px';
      });

      // 各テキストの初期フォントサイズを反映
      elements.renderTitle.style.fontSize = elements.fontSizeTitle.value + 'px';
      elements.renderSubtitle.style.fontSize = elements.fontSizeSubtitle.value + 'px';
      elements.renderDate.style.fontSize = elements.fontSizeDate.value + 'px';
      document.querySelectorAll('.area-heading').forEach(el => {
        el.style.fontSize = elements.fontSizeHeading.value + 'px';
      });
      elements.postFooter.style.fontSize = elements.fontSizeFooter.value + 'px';
    }

    // プレビューのサイズ調整と表示更新
    updatePreviewStyles();
    renderAll();

    // 画像アセットの透過処理を非同期実行
    processAllAssetsForTransparency();
  }

  // --- 状態の自動保存 (LocalStorage) ---
  function saveStateToStorage() {
    try {
      const state = {
        textInputs: {
          title: elements.titleInput.value,
          subtitle: elements.subtitleInput.value,
          date: elements.dateInput.value,
          area1Title: elements.area1TitleInput.value,
          area2Title: elements.area2TitleInput.value,
          area3Title: elements.area3TitleInput.value,
          footerLeft: elements.footerLeftInput.value,
          footerRight: elements.footerRightInput.value
        },
        stores: appState.storeData,
        design: {
          aspectRatio: elements.aspectRadio45.checked ? '4-5' : '1-1',
          fontFamily: elements.fontFamilySelect.value,
          fontSizeStore: elements.fontSizeAdjust.value,
          fontSizeTitle: elements.fontSizeTitle.value,
          fontSizeSubtitle: elements.fontSizeSubtitle.value,
          fontSizeDate: elements.fontSizeDate.value,
          fontSizeHeading: elements.fontSizeHeading.value,
          fontSizeFooter: elements.fontSizeFooter.value,
          colorBg: elements.colorBg.value,
          colorText: elements.colorText.value,
          colorArea1: elements.colorArea1.value,
          colorArea2: elements.colorArea2.value,
          colorArea3: elements.colorArea3.value,
          colorBorder: elements.colorBorder.value
        },
        assets: {}
      };

      Object.keys(assets).forEach(key => {
        const asset = assets[key];
        state.assets[key] = {
          visible: asset.toggle.checked,
          size: asset.sizeSlider.value,
          top: asset.el.style.top,
          left: asset.el.style.left,
          flipped: asset.el.classList.contains('flipped')
        };
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorageへの保存に失敗しました:', e);
    }
  }

  // --- 状態の復元 (LocalStorage) ---
  function loadStateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (!state) return false;

      // 1. テキスト復元
      if (state.textInputs) {
        if (state.textInputs.title !== undefined) {
          elements.titleInput.value = state.textInputs.title;
          elements.renderTitle.textContent = state.textInputs.title;
        }
        if (state.textInputs.subtitle !== undefined) {
          elements.subtitleInput.value = state.textInputs.subtitle;
          elements.renderSubtitle.textContent = state.textInputs.subtitle;
        }
        if (state.textInputs.date !== undefined) {
          elements.dateInput.value = state.textInputs.date;
          elements.renderDate.textContent = state.textInputs.date;
        }
        if (state.textInputs.area1Title !== undefined) {
          elements.area1TitleInput.value = state.textInputs.area1Title;
          elements.renderArea1Title.textContent = '【' + state.textInputs.area1Title + '】';
        }
        if (state.textInputs.area2Title !== undefined) {
          elements.area2TitleInput.value = state.textInputs.area2Title;
          elements.renderArea2Title.textContent = '【' + state.textInputs.area2Title + '】';
        }
        if (state.textInputs.area3Title !== undefined) {
          elements.area3TitleInput.value = state.textInputs.area3Title;
          elements.renderArea3Title.textContent = '【' + state.textInputs.area3Title + '】';
        }
        if (state.textInputs.footerLeft !== undefined) {
          elements.footerLeftInput.value = state.textInputs.footerLeft;
          elements.renderFooterLeft.textContent = state.textInputs.footerLeft;
        }
        if (state.textInputs.footerRight !== undefined) {
          elements.footerRightInput.value = state.textInputs.footerRight;
          elements.renderFooterRight.textContent = state.textInputs.footerRight;
        }
      }

      // 2. 店舗データ復元
      if (Array.isArray(state.stores)) {
        appState.storeData = state.stores;
        syncStoreDataToTextarea();
      }

      // 3. デザイン・配色復元
      if (state.design) {
        if (state.design.aspectRatio === '1-1') {
          elements.aspectRadio11.checked = true;
          elements.captureTarget.classList.remove('aspect-4-5');
          elements.captureTarget.classList.add('aspect-1-1');
        } else {
          elements.aspectRadio45.checked = true;
          elements.captureTarget.classList.remove('aspect-1-1');
          elements.captureTarget.classList.add('aspect-4-5');
        }

        if (state.design.fontFamily) {
          elements.fontFamilySelect.value = state.design.fontFamily;
          elements.captureTarget.style.fontFamily = state.design.fontFamily;
        }

        if (state.design.fontSizeStore) {
          elements.fontSizeAdjust.value = state.design.fontSizeStore;
          elements.fontSizeVal.textContent = state.design.fontSizeStore + 'px';
        }
        if (state.design.fontSizeTitle) {
          elements.fontSizeTitle.value = state.design.fontSizeTitle;
          elements.fontSizeTitleVal.textContent = state.design.fontSizeTitle + 'px';
          elements.renderTitle.style.fontSize = state.design.fontSizeTitle + 'px';
        }
        if (state.design.fontSizeSubtitle) {
          elements.fontSizeSubtitle.value = state.design.fontSizeSubtitle;
          elements.fontSizeSubtitleVal.textContent = state.design.fontSizeSubtitle + 'px';
          elements.renderSubtitle.style.fontSize = state.design.fontSizeSubtitle + 'px';
        }
        if (state.design.fontSizeDate) {
          elements.fontSizeDate.value = state.design.fontSizeDate;
          elements.fontSizeDateVal.textContent = state.design.fontSizeDate + 'px';
          elements.renderDate.style.fontSize = state.design.fontSizeDate + 'px';
        }
        if (state.design.fontSizeHeading) {
          elements.fontSizeHeading.value = state.design.fontSizeHeading;
          elements.fontSizeHeadingVal.textContent = state.design.fontSizeHeading + 'px';
          document.querySelectorAll('.area-heading').forEach(el => {
            el.style.fontSize = state.design.fontSizeHeading + 'px';
          });
        }
        if (state.design.fontSizeFooter) {
          elements.fontSizeFooter.value = state.design.fontSizeFooter;
          elements.fontSizeFooterVal.textContent = state.design.fontSizeFooter + 'px';
          elements.postFooter.style.fontSize = state.design.fontSizeFooter + 'px';
        }

        // カラーピッカー
        const applyColor = (input, text, val, applyFn) => {
          if (val) {
            input.value = val;
            text.value = val;
            applyFn(val);
          }
        };

        applyColor(elements.colorBg, elements.colorBgText, state.design.colorBg, v => elements.captureTarget.style.backgroundColor = v);
        applyColor(elements.colorText, elements.colorTextText, state.design.colorText, v => elements.captureTarget.style.color = v);
        applyColor(elements.colorArea1, elements.colorArea1Text, state.design.colorArea1, v => document.querySelectorAll('.heading-area1').forEach(el => el.style.backgroundColor = v));
        applyColor(elements.colorArea2, elements.colorArea2Text, state.design.colorArea2, v => document.querySelectorAll('.heading-area2').forEach(el => el.style.backgroundColor = v));
        applyColor(elements.colorArea3, elements.colorArea3Text, state.design.colorArea3, v => document.querySelectorAll('.heading-area3').forEach(el => el.style.backgroundColor = v));
        applyColor(elements.colorBorder, elements.colorBorderText, state.design.colorBorder, v => elements.postBorderInner.style.borderColor = v);
      }

      // 4. アセット復元
      if (state.assets) {
        Object.keys(assets).forEach(key => {
          const savedAsset = state.assets[key];
          const asset = assets[key];
          if (savedAsset && asset) {
            asset.toggle.checked = !!savedAsset.visible;
            asset.el.style.display = savedAsset.visible ? 'block' : 'none';

            if (savedAsset.size) {
              asset.sizeSlider.value = savedAsset.size;
              asset.sizeVal.textContent = savedAsset.size + 'px';
              asset.el.style.width = savedAsset.size + 'px';
              asset.el.style.minWidth = savedAsset.size + 'px';
            }
            if (savedAsset.top) asset.el.style.top = savedAsset.top;
            if (savedAsset.left) asset.el.style.left = savedAsset.left;
            if (savedAsset.flipped) {
              asset.el.classList.add('flipped');
            } else {
              asset.el.classList.remove('flipped');
            }
          }
        });
      }

      return true;
    } catch (e) {
      console.warn('LocalStorageからの復元に失敗しました:', e);
      return false;
    }
  }

  // --- 全ての設定を初期状態にリセット ---
  function resetAllSettings() {
    if (!confirm('全ての店舗データとデザイン設定を初期状態（サンプル）に戻しますか？')) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    location.reload();
  }

  // --- イベントリスナー ---
  function addEventListeners() {
    // データ入力
    elements.storeInput.addEventListener('input', () => {
      parseStoreData();
      renderAll();
      saveStateToStorage();
    });
    elements.loadSampleBtn.addEventListener('click', () => {
      elements.storeInput.value = DEFAULT_STORE_DATA;
      parseStoreData();
      renderAll();
      saveStateToStorage();
    });
    elements.clearDataBtn.addEventListener('click', () => {
      elements.storeInput.value = '';
      parseStoreData();
      renderAll();
      saveStateToStorage();
    });

    // かんたんGUI入力のタブ切り替え
    if (elements.tabBtnGui && elements.tabBtnText) {
      elements.tabBtnGui.addEventListener('click', () => {
        elements.tabBtnGui.classList.add('active');
        elements.tabBtnText.classList.remove('active');
        elements.tabContentGui.style.display = 'block';
        elements.tabContentText.style.display = 'none';
      });

      elements.tabBtnText.addEventListener('click', () => {
        elements.tabBtnText.classList.add('active');
        elements.tabBtnGui.classList.remove('active');
        elements.tabContentText.style.display = 'block';
        elements.tabContentGui.style.display = 'none';
      });
    }

    // かんたんGUI入力の店舗追加
    if (elements.addStoreBtn) {
      elements.addStoreBtn.addEventListener('click', addStoreFromGui);
    }
    if (elements.addStoreName) {
      elements.addStoreName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addStoreFromGui();
        }
      });
    }

    // エリアヘッダーのクリックでアコーディオン開閉（全店舗一覧を展開）
    document.querySelectorAll('.gui-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.gui-store-group');
        if (group) {
          group.classList.toggle('open');
        }
      });
    });

    // ファイル読み込み
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          readAndParseFile(file);
        }
      });
    }

    // ドラッグ＆ドロップによるファイル読み込み
    if (elements.dropZone) {
      elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
      });

      elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
      });

      elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
          readAndParseFile(file);
        }
      });
    }

    // テキスト編集
    const textInputs = [
      { input: elements.titleInput, render: elements.renderTitle },
      { input: elements.subtitleInput, render: elements.renderSubtitle },
      { input: elements.dateInput, render: elements.renderDate },
      { input: elements.area1TitleInput, render: elements.renderArea1Title, prefix: '【', suffix: '】' },
      { input: elements.area2TitleInput, render: elements.renderArea2Title, prefix: '【', suffix: '】' },
      { input: elements.area3TitleInput, render: elements.renderArea3Title, prefix: '【', suffix: '】' },
      { input: elements.footerLeftInput, render: elements.renderFooterLeft },
      { input: elements.footerRightInput, render: elements.renderFooterRight }
    ];

    textInputs.forEach(item => {
      item.input.addEventListener('input', () => {
        let val = item.input.value;
        if (item.prefix) val = item.prefix + val;
        if (item.suffix) val = val + item.suffix;
        item.render.textContent = val;
        saveStateToStorage();
      });
    });

    // アスペクト比切り替え
    document.querySelectorAll('input[name="aspect-ratio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const ratio = e.target.value;
        if (ratio === '4-5') {
          elements.captureTarget.classList.remove('aspect-1-1');
          elements.captureTarget.classList.add('aspect-4-5');
        } else {
          elements.captureTarget.classList.remove('aspect-4-5');
          elements.captureTarget.classList.add('aspect-1-1');
        }
        updatePreviewStyles();
        saveStateToStorage();
      });
    });

    // フォントファミリー切り替え
    elements.fontFamilySelect.addEventListener('change', (e) => {
      elements.captureTarget.style.fontFamily = e.target.value;
      saveStateToStorage();
    });

    // 店舗名フォントサイズ変更
    elements.fontSizeAdjust.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeVal.textContent = size + 'px';
      
      // プレビュー内の店舗フォントサイズを設定
      document.querySelectorAll('.store-list li, .other-store-item').forEach(el => {
        el.style.fontSize = size + 'px';
      });
      saveStateToStorage();
    });

    // メインタイトルフォントサイズ変更
    elements.fontSizeTitle.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeTitleVal.textContent = size + 'px';
      elements.renderTitle.style.fontSize = size + 'px';
      saveStateToStorage();
    });

    // サブタイトルフォントサイズ変更
    elements.fontSizeSubtitle.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeSubtitleVal.textContent = size + 'px';
      elements.renderSubtitle.style.fontSize = size + 'px';
      saveStateToStorage();
    });

    // 日付フォントサイズ変更
    elements.fontSizeDate.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeDateVal.textContent = size + 'px';
      elements.renderDate.style.fontSize = size + 'px';
      saveStateToStorage();
    });

    // 各エリア見出しフォントサイズ変更
    elements.fontSizeHeading.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeHeadingVal.textContent = size + 'px';
      document.querySelectorAll('.area-heading').forEach(el => {
        el.style.fontSize = size + 'px';
      });
      saveStateToStorage();
    });

    // フッターフォントサイズ変更
    elements.fontSizeFooter.addEventListener('input', (e) => {
      const size = e.target.value;
      elements.fontSizeFooterVal.textContent = size + 'px';
      elements.postFooter.style.fontSize = size + 'px';
      saveStateToStorage();
    });

    // カラーピッカー連携 (双方向同期)
    const colorPairs = [
      { picker: elements.colorBg, text: elements.colorBgText, callback: val => elements.captureTarget.style.backgroundColor = val },
      { picker: elements.colorText, text: elements.colorTextText, callback: val => elements.captureTarget.style.color = val },
      { picker: elements.colorArea1, text: elements.colorArea1Text, callback: val => document.querySelectorAll('.heading-area1').forEach(el => el.style.backgroundColor = val) },
      { picker: elements.colorArea2, text: elements.colorArea2Text, callback: val => document.querySelectorAll('.heading-area2').forEach(el => el.style.backgroundColor = val) },
      { picker: elements.colorArea3, text: elements.colorArea3Text, callback: val => {
        document.querySelectorAll('.heading-area3').forEach(el => el.style.backgroundColor = val);
        updateDynamicColorStyles();
      }},
      { picker: elements.colorBorder, text: elements.colorBorderText, callback: val => {
        elements.postBorderInner.style.borderColor = val;
        updateDynamicColorStyles();
      }}
    ];

    colorPairs.forEach(pair => {
      pair.picker.addEventListener('input', (e) => {
        const val = e.target.value;
        pair.text.value = val;
        pair.callback(val);
        saveStateToStorage();
      });
      pair.text.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          pair.picker.value = val;
          pair.callback(val);
          saveStateToStorage();
        }
      });
    });

    // イラストのトグルとサイズ調整
    Object.keys(assets).forEach(key => {
      const asset = assets[key];
      // 表示・非表示
      asset.toggle.addEventListener('change', (e) => {
        asset.el.style.display = e.target.checked ? 'block' : 'none';
        saveStateToStorage();
      });
      // サイズ調整
      asset.sizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        asset.sizeVal.textContent = size + 'px';
        asset.el.style.width = size + 'px';
        asset.el.style.minWidth = size + 'px'; // 縮小変形（潰れ）を防止
        
        // サイズ変更したイラストを最前面に持ってくる
        Object.keys(assets).forEach(k => {
          assets[k].el.style.zIndex = '100';
        });
        asset.el.style.zIndex = '101';
        saveStateToStorage();
      });
      // プレビュー上でのダブルクリックで左右反転
      asset.el.addEventListener('dblclick', () => {
        asset.el.classList.toggle('flipped');
        saveStateToStorage();
      });
    });

    // 位置リセット
    elements.resetAssetsBtn.addEventListener('click', () => {
      Object.keys(assets).forEach(key => {
        const asset = assets[key];
        asset.el.style.top = asset.defaultPos.top + '%';
        asset.el.style.left = asset.defaultPos.left + '%';
        asset.el.classList.remove('flipped');
      });
      saveStateToStorage();
    });

    // 全ての設定をリセット
    if (elements.resetAllBtn) {
      elements.resetAllBtn.addEventListener('click', resetAllSettings);
    }

    // モバイルビュー切り替え
    if (elements.btnShowPanel && elements.btnShowPreview) {
      elements.btnShowPanel.addEventListener('click', () => {
        elements.btnShowPanel.classList.add('active');
        elements.btnShowPreview.classList.remove('active');
        elements.controlPanel.classList.remove('mobile-hidden');
        elements.previewArea.classList.remove('mobile-active');
      });

      elements.btnShowPreview.addEventListener('click', () => {
        elements.btnShowPreview.classList.add('active');
        elements.btnShowPanel.classList.remove('active');
        elements.controlPanel.classList.add('mobile-hidden');
        elements.previewArea.classList.add('mobile-active');
        setTimeout(updatePreviewStyles, 50);
      });
    }

    // プレビュー拡大ズームコントロール
    if (elements.zoomFitBtn) {
      elements.zoomFitBtn.addEventListener('click', () => {
        appState.zoomMode = 'fit';
        updatePreviewStyles();
      });
    }
    if (elements.zoom100Btn) {
      elements.zoom100Btn.addEventListener('click', () => {
        appState.zoomMode = '100';
        appState.customZoom = 1.0;
        updatePreviewStyles();
      });
    }
    if (elements.zoomInBtn) {
      elements.zoomInBtn.addEventListener('click', () => {
        appState.zoomMode = 'custom';
        appState.customZoom = Math.min(2.0, appState.customZoom + 0.15);
        updatePreviewStyles();
      });
    }
    if (elements.zoomOutBtn) {
      elements.zoomOutBtn.addEventListener('click', () => {
        appState.zoomMode = 'custom';
        appState.customZoom = Math.max(0.2, appState.customZoom - 0.15);
        updatePreviewStyles();
      });
    }

    // ドラッグ＆ドロップイベントのセットアップ
    setupDragAndDrop();

    // ウィンドウリサイズ時の縮小スケール自動調整
    window.addEventListener('resize', updatePreviewStyles);

    // 画像書き出しボタン
    elements.downloadBtn.addEventListener('click', downloadImage);
  }

  // --- ファイルの読み込みと表示反映 ---
  function readAndParseFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      elements.storeInput.value = text;
      parseStoreData();
      renderAll();
      saveStateToStorage();
    };
    reader.onerror = () => {
      alert('ファイルの読み込み中にエラーが発生しました。');
    };
    reader.readAsText(file, 'UTF-8');
  }

  // --- ドラッグ＆ドロップ機能 ---
  function setupDragAndDrop() {
    Object.keys(assets).forEach(key => {
      const el = assets[key].el;
      
      // ネイティブのドラッグ動作を完全に無効化する
      el.setAttribute('draggable', 'false');
      el.addEventListener('dragstart', (e) => e.preventDefault());
      
      const startDrag = (e) => {
        console.log('DRAG START: mousedown/touchstart for asset:', el.id);
        // 多重ドラッグ開始の防止ガード
        if (appState.draggingElement) {
          console.warn('DRAG START BLOCKED: already dragging element:', appState.draggingElement.id);
          return;
        }
        
        const isTouch = e.type === 'touchstart';
        
        // モバイルでのスクロール防止のみ preventDefault() を呼ぶ
        if (isTouch) {
          if (e.cancelable) e.preventDefault();
        }
        
        appState.draggingElement = el;
        el.classList.add('dragging');
        
        // z-indexを動的に制御し、操作中のイラストを常に最前面に配置する
        Object.keys(assets).forEach(k => {
          assets[k].el.style.zIndex = '100';
        });
        el.style.zIndex = '101';
        
        // クライアントの開始座標を取得
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;
        
        appState.dragStartPos = { x: clientX, y: clientY };
        
        // 要素の現在の位置（親に対する%をピクセルに換算）
        const rect = el.getBoundingClientRect();
        const parentRect = elements.postBorderInner.getBoundingClientRect();
        
        appState.elementStartPos = {
          left: (rect.left - parentRect.left) / appState.currentScale,
          top: (rect.top - parentRect.top) / appState.currentScale
        };
        
        // イベント発生元に応じて、マウスとタッチのリスナーを分離して登録
        if (isTouch) {
          window.addEventListener('touchmove', onDrag, { passive: false });
          window.addEventListener('touchend', endDrag);
        } else {
          window.addEventListener('mousemove', onDrag, { passive: false });
          window.addEventListener('mouseup', endDrag);
        }
      };

      el.addEventListener('mousedown', startDrag);
      el.addEventListener('touchstart', startDrag, { passive: false });
    });

    function onDrag(e) {
      console.log('DRAG MOVE: mousemove/touchmove triggered. draggingElement:', appState.draggingElement ? appState.draggingElement.id : 'null');
      if (!appState.draggingElement) return;
      
      const isTouch = e.type.startsWith('touch');
      let clientX, clientY;
      
      if (isTouch) {
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else {
          return; // 座標が取得できない場合は処理しない
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // 開始位置からの移動差分
      const dx = (clientX - appState.dragStartPos.x) / appState.currentScale;
      const dy = (clientY - appState.dragStartPos.y) / appState.currentScale;
      
      // 新しい論理ピクセル座標
      let newLeftPx = appState.elementStartPos.left + dx;
      let newTopPx = appState.elementStartPos.top + dy;
      
      // 親のサイズを基準にパーセンテージに換算
      const parentRect = elements.postBorderInner.getBoundingClientRect();
      const parentWidth = parentRect.width / appState.currentScale;
      const parentHeight = parentRect.height / appState.currentScale;
      
      let leftPercent = (newLeftPx / parentWidth) * 100;
      let topPercent = (newTopPx / parentHeight) * 100;
      
      // 境界内に収める
      leftPercent = Math.max(-20, Math.min(110, leftPercent));
      topPercent = Math.max(-20, Math.min(110, topPercent));
      
      appState.draggingElement.style.left = leftPercent.toFixed(2) + '%';
      appState.draggingElement.style.top = topPercent.toFixed(2) + '%';
      
      if (e.cancelable) e.preventDefault();
    }

    function endDrag() {
      console.log('DRAG END: mouseup/touchend triggered. draggingElement was:', appState.draggingElement ? appState.draggingElement.id : 'null');
      if (appState.draggingElement) {
        appState.draggingElement.classList.remove('dragging');
        appState.draggingElement = null;
        saveStateToStorage();
      }
      // すべてのリトナーを安全に解除
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', endDrag);
    }
  }

  // --- プレビューの拡縮調整 (高精細スケーリング ＆ ズーム対応) ---
  function updatePreviewStyles() {
    const parent = elements.previewWrapper;
    const post = elements.captureTarget;
    if (!parent || !post) return;
    
    const parentWidth = parent.clientWidth - 40;
    const parentHeight = parent.clientHeight - 40;
    
    // ターゲットのサイズ
    const targetWidth = post.classList.contains('aspect-1-1') ? 1080 : 1080;
    const targetHeight = post.classList.contains('aspect-1-1') ? 1080 : 1350;
    
    let scale;
    if (appState.zoomMode === '100') {
      scale = 1.0;
    } else if (appState.zoomMode === 'custom') {
      scale = appState.customZoom;
    } else {
      // 'fit'
      const scaleX = parentWidth / targetWidth;
      const scaleY = parentHeight / targetHeight;
      scale = Math.min(scaleX, scaleY, 1.0);
      if (scale < 0.2) scale = 0.2;
      appState.customZoom = scale;
    }
    
    appState.currentScale = scale;
    
    // スタイル適用
    post.style.width = targetWidth + 'px';
    post.style.height = targetHeight + 'px';
    post.style.transform = `scale(${scale})`;
    
    // ズームボタンのアクティブ状態更新
    if (elements.zoomFitBtn && elements.zoom100Btn) {
      elements.zoomFitBtn.classList.toggle('active', appState.zoomMode === 'fit');
      elements.zoom100Btn.classList.toggle('active', appState.zoomMode === '100');
    }
    
    // プレビューラッパーの高さを調整して、中央寄せしやすくする
    parent.style.minHeight = (targetHeight * scale + 40) + 'px';
  }

  // --- 店舗データのパース (スマートパーサー) ---
  function parseStoreData() {
    const text = elements.storeInput.value.trim();
    if (!text) {
      appState.storeData = [];
      return;
    }

    const lines = text.split('\n');
    const parsed = [];
    
    // 現在どのエリアをパースしているかを追跡する変数
    let currentArea = null;

    lines.forEach(line => {
      let cleanLine = line.trim();
      if (!cleanLine) return;

      // 箇条書き用の記号（・, -, *, ◦, • など）が先頭にあれば取り除く
      cleanLine = cleanLine.replace(/^[・\-*◦•\s]+/, '').trim();

      // エリア見出しの検出 (例: 【千葉エリア】, [東京エリア], 千葉エリア など)
      const areaMatch = cleanLine.match(/^[【\[]?(千葉|東京|その他|その他地域|その他の地域).*?[】\]]?$/);
      if (areaMatch) {
        const areaName = areaMatch[1];
        if (areaName.includes('千葉')) {
          currentArea = '千葉';
        } else if (areaName.includes('東京')) {
          currentArea = '東京';
        } else {
          currentArea = 'その他';
        }
        return; // 見出し行はスキップ
      }

      // 区切り文字による分割を試みる (カンマ、縦棒、タブ、コロン、セミコロン、またはスペース)
      let parts = [];
      
      if (cleanLine.includes(',')) {
        parts = cleanLine.split(',');
      } else if (cleanLine.includes('|')) {
        parts = cleanLine.split('|');
      } else if (cleanLine.includes('\t')) {
        parts = cleanLine.split('\t');
      } else if (cleanLine.includes('：') || cleanLine.includes(':')) {
        parts = cleanLine.split(/[:：]/);
      } else {
        // スペース区切りを試す (先頭単語が都道府県名であると推測される場合のみ適用)
        const spaceParts = cleanLine.split(/\s+/);
        if (spaceParts.length >= 2) {
          const firstWord = cleanPrefName(spaceParts[0]);
          const isPref = PREFECTURE_ORDER.some(p => p.startsWith(firstWord)) || ['千葉', '東京', '神奈川', '埼玉', '栃木', '新潟', '山梨', '静岡', '愛知', '京都', '大阪', '兵庫', '広島', '福岡', '宮城', '鹿児島'].includes(firstWord);
          if (isPref) {
            parts = [spaceParts[0], spaceParts.slice(1).join(' ')];
          }
        }
      }

      if (parts.length >= 2) {
        const pref = parts[0].trim();
        const store = parts.slice(1).join(' ').trim();
        parsed.push({ pref, name: store });
      } else if (currentArea) {
        // 見出しの下にある場合は、その見出しのエリアを都道府県とみなす
        parsed.push({ pref: currentArea, name: cleanLine });
      } else {
        // 判別できない場合は「その他」に店舗名を入れる
        parsed.push({ pref: 'その他', name: cleanLine });
      }
    });

    appState.storeData = parsed;
  }

  // --- 描画処理 ---
  function renderAll() {
    // 1. 各エリアに店舗データを振り分ける
    const area1Stores = []; // 千葉エリア
    const area2Stores = []; // 東京エリア
    const otherStores = {}; // その他の地域 { "京都": [...], "大阪": [...] }

    appState.storeData.forEach(item => {
      const normalizedPref = cleanPrefName(item.pref); // 都道府県の後ろを取り除く表記揺れ対策
      
      if (normalizedPref === '千葉') {
        area1Stores.push(item.name);
      } else if (normalizedPref === '東京') {
        area2Stores.push(item.name);
      } else {
        // その他の地域
        const displayPref = item.pref; // 表示用は元の「京都」や「山梨」等にする
        if (!otherStores[displayPref]) {
          otherStores[displayPref] = [];
        }
        otherStores[displayPref].push(item.name);
      }
    });

    // 2. 店舗リストの描画 (千葉エリア)
    elements.listArea1.innerHTML = '';
    const fontSize = elements.fontSizeAdjust.value + 'px';
    
    area1Stores.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.style.fontSize = fontSize;
      elements.listArea1.appendChild(li);
    });

    // 3. 店舗リストの描画 (東京エリア)
    elements.listArea2.innerHTML = '';
    area2Stores.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.style.fontSize = fontSize;
      elements.listArea2.appendChild(li);
    });

    // 4. 店舗リストの描画 (その他の地域 - 都道府県順にソートして描画)
    elements.listArea3.innerHTML = '';
    
    // ソートキー（PREFECTURE_ORDER に基づき、存在しないものは最後）
    const sortedPrefs = Object.keys(otherStores).sort((a, b) => {
      const aClean = cleanPrefName(a);
      const bClean = cleanPrefName(b);
      
      let indexA = PREFECTURE_ORDER.indexOf(aClean);
      let indexB = PREFECTURE_ORDER.indexOf(bClean);
      
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      
      return indexA - indexB;
    });

    // その他の店舗の平坦化されたリストを作成（グリッドへの均等配置用）
    const otherStoreItemsList = [];
    sortedPrefs.forEach(pref => {
      otherStores[pref].forEach(storeName => {
        otherStoreItemsList.push({ pref, storeName });
      });
    });

    // グリッド（2カラム）に順次追加
    otherStoreItemsList.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'other-store-item';
      itemEl.style.fontSize = fontSize;

      const label = document.createElement('span');
      label.className = 'other-region-label';
      label.textContent = item.pref;
      // 都道府県ラベルの背景色を枠線色と同一にして統一感を持たせる
      label.style.backgroundColor = elements.colorBorder.value;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'other-store-name';
      nameSpan.textContent = item.storeName;

      itemEl.appendChild(label);
      itemEl.appendChild(nameSpan);
      elements.listArea3.appendChild(itemEl);
    });

    // カラーの設定を一部上書き反映
    updateDynamicColorStyles();

    // かんたんGUI管理リストのレンダリング
    renderGuiStoreList();
  }

  // --- GUIフォームから店舗を追加 ---
  function addStoreFromGui() {
    const pref = elements.addStorePref.value.trim();
    const name = elements.addStoreName.value.trim();

    if (!name) {
      elements.addStoreName.focus();
      return;
    }

    appState.storeData.push({ pref, name });
    elements.addStoreName.value = '';
    elements.addStoreName.focus();

    // 追加したエリアのグループを自動展開
    const normalizedPref = cleanPrefName(pref);
    let targetGroupId = 'gui-group-area3';
    if (normalizedPref === '千葉') targetGroupId = 'gui-group-area1';
    else if (normalizedPref === '東京') targetGroupId = 'gui-group-area2';
    
    const targetGroup = document.getElementById(targetGroupId);
    if (targetGroup) targetGroup.classList.add('open');

    syncStoreDataToTextarea();
    renderAll();
    saveStateToStorage();
  }

  // --- storeData の内容をテキストエリアに同期 ---
  function syncStoreDataToTextarea() {
    const area1Stores = [];
    const area2Stores = [];
    const otherStores = [];

    appState.storeData.forEach(item => {
      const normalizedPref = cleanPrefName(item.pref);
      if (normalizedPref === '千葉') {
        area1Stores.push(`・${item.name}`);
      } else if (normalizedPref === '東京') {
        area2Stores.push(`・${item.name}`);
      } else {
        otherStores.push(`${item.pref} | ${item.name}`);
      }
    });

    const parts = [];
    if (area1Stores.length > 0) {
      parts.push(`【千葉エリア】\n${area1Stores.join('\n')}`);
    }
    if (area2Stores.length > 0) {
      parts.push(`【東京エリア】\n${area2Stores.join('\n')}`);
    }
    if (otherStores.length > 0) {
      parts.push(`【その他の地域】\n${otherStores.join('\n')}`);
    }

    elements.storeInput.value = parts.join('\n\n');
  }

  // --- GUI管理リストのレンダリング ---
  function renderGuiStoreList() {
    if (!elements.guiItemsArea1 || !elements.guiItemsArea2 || !elements.guiItemsArea3) return;

    elements.guiItemsArea1.innerHTML = '';
    elements.guiItemsArea2.innerHTML = '';
    elements.guiItemsArea3.innerHTML = '';

    // 各エリアに属する店舗のインデックス一覧を収集
    const area1Indices = [];
    const area2Indices = [];
    const area3Indices = [];

    appState.storeData.forEach((item, index) => {
      const normalizedPref = cleanPrefName(item.pref);
      if (normalizedPref === '千葉') {
        area1Indices.push(index);
      } else if (normalizedPref === '東京') {
        area2Indices.push(index);
      } else {
        area3Indices.push(index);
      }
    });

    // 1. 千葉エリアのレンダリング (並び替え可能)
    area1Indices.forEach((storeIndex, pos) => {
      const item = appState.storeData[storeIndex];
      const row = document.createElement('div');
      row.className = 'gui-store-item';

      const content = document.createElement('div');
      content.className = 'gui-store-content';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'gui-store-name-text';
      nameSpan.textContent = item.name;
      content.appendChild(nameSpan);
      row.appendChild(content);

      const actions = document.createElement('div');
      actions.className = 'gui-store-actions';

      // 並び替えボタン（▲ / ▼）
      const reorderBtns = createReorderBtns(area1Indices, pos);
      actions.appendChild(reorderBtns.upBtn);
      actions.appendChild(reorderBtns.downBtn);

      // 削除ボタン
      const delBtn = createDeleteBtn(storeIndex);
      actions.appendChild(delBtn);

      row.appendChild(actions);
      elements.guiItemsArea1.appendChild(row);
    });

    // 2. 東京エリアのレンダリング (並び替え可能)
    area2Indices.forEach((storeIndex, pos) => {
      const item = appState.storeData[storeIndex];
      const row = document.createElement('div');
      row.className = 'gui-store-item';

      const content = document.createElement('div');
      content.className = 'gui-store-content';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'gui-store-name-text';
      nameSpan.textContent = item.name;
      content.appendChild(nameSpan);
      row.appendChild(content);

      const actions = document.createElement('div');
      actions.className = 'gui-store-actions';

      // 並び替えボタン（▲ / ▼）
      const reorderBtns = createReorderBtns(area2Indices, pos);
      actions.appendChild(reorderBtns.upBtn);
      actions.appendChild(reorderBtns.downBtn);

      // 削除ボタン
      const delBtn = createDeleteBtn(storeIndex);
      actions.appendChild(delBtn);

      row.appendChild(actions);
      elements.guiItemsArea2.appendChild(row);
    });

    // 3. その他の地域のレンダリング (都道府県順ルール適用)
    area3Indices.forEach((storeIndex) => {
      const item = appState.storeData[storeIndex];
      const row = document.createElement('div');
      row.className = 'gui-store-item';

      const content = document.createElement('div');
      content.className = 'gui-store-content';

      const prefTag = document.createElement('span');
      prefTag.className = 'gui-pref-tag';
      prefTag.textContent = item.pref;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'gui-store-name-text';
      nameSpan.textContent = item.name;

      content.appendChild(prefTag);
      content.appendChild(nameSpan);
      row.appendChild(content);

      const actions = document.createElement('div');
      actions.className = 'gui-store-actions';

      const delBtn = createDeleteBtn(storeIndex);
      actions.appendChild(delBtn);

      row.appendChild(actions);
      elements.guiItemsArea3.appendChild(row);
    });

    // 件数の更新
    if (elements.countArea1) elements.countArea1.textContent = area1Indices.length;
    if (elements.countArea2) elements.countArea2.textContent = area2Indices.length;
    if (elements.countArea3) elements.countArea3.textContent = area3Indices.length;

    // 0件時のプレースホルダー表示
    if (area1Indices.length === 0) elements.guiItemsArea1.innerHTML = '<div class="gui-empty-notice">店舗が登録されていません</div>';
    if (area2Indices.length === 0) elements.guiItemsArea2.innerHTML = '<div class="gui-empty-notice">店舗が登録されていません</div>';
    if (area3Indices.length === 0) elements.guiItemsArea3.innerHTML = '<div class="gui-empty-notice">店舗が登録されていません</div>';
  }

  // --- 並び替えボタン（▲ / ▼）の生成 ---
  function createReorderBtns(indicesArray, currentPos) {
    const upBtn = document.createElement('button');
    upBtn.className = 'gui-action-btn';
    upBtn.title = '上へ移動';
    upBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`;
    
    if (currentPos === 0) {
      upBtn.disabled = true;
    } else {
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        swapStores(indicesArray[currentPos], indicesArray[currentPos - 1]);
      });
    }

    const downBtn = document.createElement('button');
    downBtn.className = 'gui-action-btn';
    downBtn.title = '下へ移動';
    downBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
    
    if (currentPos === indicesArray.length - 1) {
      downBtn.disabled = true;
    } else {
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        swapStores(indicesArray[currentPos], indicesArray[currentPos + 1]);
      });
    }

    return { upBtn, downBtn };
  }

  // --- 2つの店舗データの順番を入れ替える ---
  function swapStores(indexA, indexB) {
    const temp = appState.storeData[indexA];
    appState.storeData[indexA] = appState.storeData[indexB];
    appState.storeData[indexB] = temp;

    syncStoreDataToTextarea();
    renderAll();
    saveStateToStorage();
  }

  // --- 削除ボタンの生成 (確認ダイアログ付き) ---
  function createDeleteBtn(index) {
    const btn = document.createElement('button');
    btn.className = 'gui-action-btn gui-delete-btn';
    btn.title = 'この店舗を削除';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const store = appState.storeData[index];
      const storeName = store ? store.name : 'この店舗';
      if (!confirm(`「${storeName}」を削除してもよろしいですか？`)) {
        return;
      }
      appState.storeData.splice(index, 1);
      syncStoreDataToTextarea();
      renderAll();
      saveStateToStorage();
    });
    return btn;
  }

  // カラーピッカーの値で一部の動的要素に色を当てる
  function updateDynamicColorStyles() {
    const borderCol = elements.colorBorder.value;
    const area3Col = elements.colorArea3.value;
    
    // 千葉/東京の店舗リストのドットカラー
    const area1Col = elements.colorArea1.value;
    const area2Col = elements.colorArea2.value;
    
    // 動的に生成されるその他の地域ラベルの背景色
    document.querySelectorAll('.other-region-label').forEach(el => {
      el.style.backgroundColor = borderCol;
    });

    // 千葉と東京のドット色を動的適用するためにカスタムCSSを追加/更新
    let styleEl = document.getElementById('dynamic-color-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-color-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      .heading-area1 + .store-list li::before { background-color: ${area1Col} !important; }
      .heading-area2 + .store-list li::before { background-color: ${area2Col} !important; }
    `;
  }

  // --- 白背景アセットの自動透過処理 ---
  function processAllAssetsForTransparency() {
    Object.keys(assets).forEach(key => {
      const img = assets[key].el.querySelector('img');
      if (img) {
        // 画像読み込み済みかチェック
        if (img.complete) {
          makeWhiteTransparent(img);
        } else {
          // ロード完了時に一度だけ透過処理を走らせる
          const handleLoad = () => {
            img.removeEventListener('load', handleLoad);
            makeWhiteTransparent(img);
          };
          img.addEventListener('load', handleLoad);
        }
      }
    });
  }

  function makeWhiteTransparent(img) {
    // 既に透過処理済みの場合はスキップ（無限ループ防止）
    if (img.dataset.transparentProcessed === 'true') return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      // 1. 白に近い（RGBの各値が240以上）ピクセルを透過
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        if (r > 240 && g > 240 && b > 240) {
          data[i+3] = 0; // 透過
        }
      }
      
      // 2. 不透明ピクセルの境界バウンディングボックスを検出
      let minX = width, maxX = 0, minY = height, maxY = 0;
      let hasData = false;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 0) { // 不透明なピクセル
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasData = true;
          }
        }
      }
      
      // 透過後のピクセルデータを一度Canvasに書き戻す
      ctx.putImageData(imgData, 0, 0);
      
      // 不透明データが検出された場合のみトリミングを実行
      if (hasData) {
        // 余白を少し持たせる (5px)
        const padding = 5;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(width - 1, maxX + padding);
        maxY = Math.min(height - 1, maxY + padding);
        
        const trimWidth = maxX - minX + 1;
        const trimHeight = maxY - minY + 1;
        
        const trimCanvas = document.createElement('canvas');
        const trimCtx = trimCanvas.getContext('2d');
        trimCanvas.width = trimWidth;
        trimCanvas.height = trimHeight;
        
        // 元のCanvasからトリミングした部分をコピーして描画
        trimCtx.drawImage(canvas, minX, minY, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);
        
        img.dataset.transparentProcessed = 'true';
        img.src = trimCanvas.toDataURL(); // トリミングされたDataURLに置き換える
        console.log(`Image transparentized and trimmed: ${img.alt || 'asset'}. Trimmed dimensions: ${trimWidth}x${trimHeight}`);
      } else {
        img.dataset.transparentProcessed = 'true';
        img.src = canvas.toDataURL(); // DataURLに置き換える
      }
    } catch (e) {
      // CORS制約等のエラー時はそのまま表示
      console.warn("画像の透過・トリミング処理中にエラーが発生しました:", e);
    }
  }

  // --- 画像ダウンロード処理 ---
  function downloadImage() {
    const post = elements.captureTarget;
    
    // ダウンロードボタンを一時的に無効化
    elements.downloadBtn.disabled = true;
    elements.downloadBtn.textContent = '画像を生成中...';

    // 点線のアウトラインなどのエディタ用スタイルを除外するため、ドラッグ中などの表示をリセット
    document.querySelectorAll('.draggable-asset').forEach(el => {
      el.style.border = 'none';
    });

    // html2canvasオプション
    const options = {
      scale: 2, // 2倍の超解像度でキャプチャ
      useCORS: true, // アセット画像の読み込み用
      allowTaint: true,
      backgroundColor: null, // 透明背景（コンテナ自体に背景色があるのでOK）
      logging: false
    };

    // 一時的にtransform scaleを解除し、キャプチャを実行したあと元に戻す
    const originalTransform = post.style.transform;
    post.style.transform = 'none';

    html2canvas(post, options).then(canvas => {
      // transformを元に戻す
      post.style.transform = originalTransform;
      
      // ダウンロードリンクを生成
      const link = document.createElement('a');
      const dateStr = elements.dateInput.value.replace(/\./g, '');
      link.download = `雅稲惠舎_店舗一覧_${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // ボタン復帰
      elements.downloadBtn.disabled = false;
      elements.downloadBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle; margin-right: 8px;">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
        </svg>
        画像をダウンロード (高画質PNG)
      `;
    }).catch(err => {
      console.error('画像生成に失敗しました:', err);
      post.style.transform = originalTransform;
      alert('画像の生成中にエラーが発生しました。');
      elements.downloadBtn.disabled = false;
      elements.downloadBtn.textContent = '画像のダウンロードに失敗しました';
    });
  }

  // --- アプリケーション起動 ---
  init();
});
