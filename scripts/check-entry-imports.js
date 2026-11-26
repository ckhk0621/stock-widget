#!/usr/bin/env node

/**
 * Post-build guard: no chunk may import the entry file (stock-widget.js).
 *
 * WordPress loads the entry with a cache-busting query (stock-widget.js?v=...).
 * A chunk importing "./stock-widget.js" resolves to the URL without the query,
 * so the browser evaluates the entry a second time: double render and
 * duplicate API calls.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const ENTRY = 'stock-widget.js';
const ENTRY_IMPORT = /(?:from\s*|import\s*\(\s*|import\s*)["']\.\/stock-widget\.js["']/;

export const findEntryImporters = (files) =>
  files
    .filter(({ name }) => name.endsWith('.js') && name !== ENTRY)
    .filter(({ source }) => ENTRY_IMPORT.test(source))
    .map(({ name }) => name);

const main = async () => {
  const distDir = process.argv[2] || './dist';
  const names = await readdir(distDir);
  const files = await Promise.all(
    names
      .filter((name) => name.endsWith('.js'))
      .map(async (name) => ({ name, source: await readFile(join(distDir, name), 'utf8') }))
  );

  const offenders = findEntryImporters(files);
  if (offenders.length > 0) {
    console.error(`❌ These chunks import ${ENTRY} and would re-run the widget: ${offenders.join(', ')}`);
    process.exit(1);
  }
  console.log(`✅ No chunk imports ${ENTRY}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
