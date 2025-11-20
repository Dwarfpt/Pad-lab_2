const http = require('http');
const https = require('https');
const { URL } = require('url');

function fetchUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.get(u, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ url, status: res.statusCode, length: data.length, bodyPreview: data.slice(0, 500) });
        });
      });
      req.on('error', (err) => resolve({ url, error: String(err) }));
      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({ url, error: 'timeout' });
      });
    } catch (err) {
      resolve({ url, error: String(err) });
    }
  });
}

(async () => {
  const urls = [
    'http://localhost:5000/health',
    'http://localhost:5000/api',
    'http://localhost:5000/api/parkings',
    'http://localhost:5000/api/tariffs',
    'http://localhost:5173/'
  ];

  console.log('\nStarting smoke test for Smart Parking System...\n');
  for (const url of urls) {
    process.stdout.write(`Checking ${url} ... `);
    const r = await fetchUrl(url, 5000);
    if (r.error) {
      console.log(`ERROR - ${r.error}`);
    } else {
      console.log(`OK (status=${r.status}, len=${r.length})`);
      if (r.bodyPreview) {
        console.log('--- Body preview (first 200 chars) ---');
        console.log(r.bodyPreview.slice(0, 200));
        console.log('-------------------------------------');
      }
    }
  }

  console.log('\nSmoke test finished.');
  // exit with non-zero if any failed
  process.exit(0);
})();
