// Vercel Serverless Function for real-time state synchronization
// メモリ上およびレスポンスキャッシュで複数ユーザー間のデータを永続・共有同期します

let cachedState = null;

export default async function handler(req, res) {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      if (data && typeof data === 'object') {
        cachedState = {
          ...data,
          updatedAt: Date.now()
        };
        // 外部のグローバルバックアップストレージにも非同期保存
        try {
          fetch('https://ntfy.sh/gainaesha_sync_store_channel_2026', {
            method: 'POST',
            body: JSON.stringify(cachedState),
            headers: { 'Title': 'StateUpdate' }
          }).catch(() => {});
        } catch (e) {}

        return res.status(200).json({ success: true, updatedAt: cachedState.updatedAt });
      }
      return res.status(400).json({ error: 'Invalid data format' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    // キャッシュ無効化ヘッダー
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    if (cachedState) {
      return res.status(200).json(cachedState);
    }

    // 初回や再起動時は外部バックアップから復元を試みる
    try {
      const backupRes = await fetch('https://ntfy.sh/gainaesha_sync_store_channel_2026/json?poll=1&since=all', {
        headers: { 'User-Agent': 'GainaeshaSync' }
      });
      if (backupRes.ok) {
        const text = await backupRes.text();
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length > 0) {
          const lastMsg = JSON.parse(lines[lines.length - 1]);
          if (lastMsg && lastMsg.message) {
            cachedState = JSON.parse(lastMsg.message);
            return res.status(200).json(cachedState);
          }
        }
      }
    } catch (e) {
      console.warn('Backup fetch error:', e);
    }

    return res.status(200).json(cachedState || { empty: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
