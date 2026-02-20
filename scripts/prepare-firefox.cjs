const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

console.log('🔧 Preparing manifest for Firefox...');

if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Error: manifest.json not found in dist folder!');
    process.exit(1);
}

try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    if (manifest.background && manifest.background.service_worker) {
        console.log('🔄 Converting service_worker to scripts for Firefox compatibility...');
        
        const serviceWorker = manifest.background.service_worker;
        
        // Firefox Manifest V3 uses 'scripts' instead of 'service_worker'
        // See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background
        
        manifest.background.scripts = [serviceWorker];
        delete manifest.background.service_worker;
        
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        console.log('✅ Manifest successfully patched for Firefox!');
    } else {
        console.log('ℹ️ No background service_worker found in manifest. Skipping patch.');
    }
} catch (error) {
    console.error('❌ Error patching manifest:', error.message);
    process.exit(1);
}
