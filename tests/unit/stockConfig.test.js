import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SYMBOL,
  AVAILABLE_PERIODS,
  resolveSymbol,
  formatPriceTick,
  formatVolumeTick,
  applySplitAdjustments
} from '../../src/utils/stockConfig.js';

test('default symbol is AXNX after the MIMI ticker change', () => {
  assert.equal(DEFAULT_SYMBOL, 'AXNX');
});

test('resolveSymbol maps the retired MIMI ticker to AXNX', () => {
  assert.equal(resolveSymbol('MIMI'), 'AXNX');
  assert.equal(resolveSymbol('mimi'), 'AXNX');
  assert.equal(resolveSymbol(' MIMI '), 'AXNX');
});

test('resolveSymbol keeps other symbols and falls back to the default', () => {
  assert.equal(resolveSymbol('AAPL'), 'AAPL');
  assert.equal(resolveSymbol('ibm'), 'IBM');
  assert.equal(resolveSymbol(''), 'AXNX');
  assert.equal(resolveSymbol(undefined), 'AXNX');
  assert.equal(resolveSymbol(null), 'AXNX');
});

test('only periods served by the free Alpha Vantage tier are offered', () => {
  assert.deepEqual(AVAILABLE_PERIODS, ['1M', '3M', '6M']);
});

test('formatPriceTick keeps cents for sub-$10 prices', () => {
  assert.equal(formatPriceTick(0.85), '$0.85');
  assert.equal(formatPriceTick(1), '$1.00');
  assert.equal(formatPriceTick(1.2), '$1.20');
  assert.equal(formatPriceTick(9.995), '$9.99');
});

test('formatPriceTick uses whole dollars for $10 and above', () => {
  assert.equal(formatPriceTick(10), '$10');
  assert.equal(formatPriceTick(150), '$150');
});

test('formatVolumeTick scales to K and M instead of showing 0.0M', () => {
  assert.equal(formatVolumeTick(0), '0');
  assert.equal(formatVolumeTick(500), '500');
  assert.equal(formatVolumeTick(20000), '20K');
  assert.equal(formatVolumeTick(25000), '25K');
  assert.equal(formatVolumeTick(1500000), '1.5M');
  assert.equal(formatVolumeTick(6000000), '6M');
});

const day = (iso) => Date.UTC(...iso.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n)))) / 1000;
const candle = (iso, price, volume) => ({
  time: day(iso), open: price, high: price, low: price, close: price, volume
});

test('applySplitAdjustments rescales AXNX candles before the 2026-10-22 2-for-5 reverse split', () => {
  const input = [
    candle('2026-10-21', 0.44, 100000),
    candle('2026-10-22', 1.13, 108039)
  ];
  const [before, after] = applySplitAdjustments('AXNX', input);

  assert.ok(Math.abs(before.close - 1.1) < 1e-9);
  assert.ok(Math.abs(before.open - 1.1) < 1e-9);
  assert.ok(Math.abs(before.high - 1.1) < 1e-9);
  assert.ok(Math.abs(before.low - 1.1) < 1e-9);
  assert.equal(before.volume, 40000);
  assert.deepEqual(after, input[1]);
});

test('applySplitAdjustments does not mutate the cached input array', () => {
  const input = [candle('2026-10-21', 0.44, 100000)];
  applySplitAdjustments('AXNX', input);
  assert.equal(input[0].close, 0.44);
  assert.equal(input[0].volume, 100000);
});

test('applySplitAdjustments leaves symbols without recorded splits unchanged', () => {
  const input = [candle('2026-10-21', 150, 100000)];
  assert.deepEqual(applySplitAdjustments('IBM', input), input);
});
