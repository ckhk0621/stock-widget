import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findEntryImporters } from '../../scripts/check-entry-imports.js';

test('flags a chunk that statically imports the entry', () => {
  const files = [
    { name: 'stock-widget.js', source: 'import("./StockChart.js")' },
    { name: 'StockChart.js', source: 'import{A as P}from"./stock-widget.js";' }
  ];
  assert.deepEqual(findEntryImporters(files), ['StockChart.js']);
});

test('flags side-effect and dynamic imports of the entry', () => {
  const files = [
    { name: 'a.js', source: 'import "./stock-widget.js";' },
    { name: 'b.js', source: 'await import("./stock-widget.js")' }
  ];
  assert.deepEqual(findEntryImporters(files), ['a.js', 'b.js']);
});

test('passes chunks that only import vendor chunks', () => {
  const files = [
    { name: 'stock-widget.js', source: 'import{j}from"./vendor-react.js";' },
    { name: 'vendor.js', source: 'export const x=1;' },
    { name: 'StockChart.js', source: 'import{j}from"./vendor-react.js";import{f}from"./vendor.js";' }
  ];
  assert.deepEqual(findEntryImporters(files), []);
});
