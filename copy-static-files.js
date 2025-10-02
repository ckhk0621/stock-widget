#!/usr/bin/env node

/**
 * Post-build script: Copy hashed files to static names for WordPress compatibility
 *
 * This creates BOTH versions:
 * - stock-widget.[hash].js (cache-busting)
 * - stock-widget.js (WordPress compatibility)
 */

import { readdir, copyFile } from 'fs/promises';
import { join } from 'path';

const distDir = './dist';

async function copyStaticFiles() {
  try {
    const files = await readdir(distDir);

    // Find hashed JS file
    const jsFile = files.find(f => f.match(/^stock-widget\.[a-zA-Z0-9_-]+\.js$/));
    if (jsFile) {
      await copyFile(
        join(distDir, jsFile),
        join(distDir, 'stock-widget.js')
      );
      console.log(`✅ Copied ${jsFile} → stock-widget.js`);
    }

    // Find hashed CSS file
    const cssFile = files.find(f => f.match(/^stock-widget\.[a-zA-Z0-9_-]+\.css$/));
    if (cssFile) {
      await copyFile(
        join(distDir, cssFile),
        join(distDir, 'stock-widget.css')
      );
      console.log(`✅ Copied ${cssFile} → stock-widget.css`);
    }

    console.log('\n📦 Both hashed and static files available for deployment');

  } catch (error) {
    console.error('❌ Error copying static files:', error.message);
    process.exit(1);
  }
}

copyStaticFiles();
