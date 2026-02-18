const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

console.log('🔍 Validating build output...');

if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Error: manifest.json not found in dist folder!');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const filesToVerify = new Set();

// 1. Check background service worker
if (manifest.background && manifest.background.service_worker) {
    filesToVerify.add(manifest.background.service_worker);
}

// 2. Check content scripts
if (manifest.content_scripts) {
    manifest.content_scripts.forEach(script => {
        if (script.js) script.js.forEach(js => filesToVerify.add(js));
        if (script.css) script.css.forEach(css => filesToVerify.add(css));
    });
}

// 3. Check icons
if (manifest.icons) {
    Object.values(manifest.icons).forEach(icon => filesToVerify.add(icon));
}

// 4. Check action (popup)
if (manifest.action) {
    if (manifest.action.default_popup) filesToVerify.add(manifest.action.default_popup);
    if (manifest.action.default_icon) {
        Object.values(manifest.action.default_icon).forEach(icon => filesToVerify.add(icon));
    }
}

// 5. Check options page
if (manifest.options_page) {
    filesToVerify.add(manifest.options_page);
}

let missingCount = 0;
console.log(`Checking ${filesToVerify.size} referenced files...`);

for (const relPath of filesToVerify) {
    const fullPath = path.join(DIST_DIR, relPath);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Found: ${relPath}`);
    } else {
        console.error(`❌ Missing: ${relPath} (expected at ${fullPath})`);
        missingCount++;
    }
}

if (missingCount > 0) {
    console.error(`\n❌ Validation failed: ${missingCount} file(s) missing from dist!`);
    process.exit(1);
}

console.log('\n✨ Build validation successful!');
