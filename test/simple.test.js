import test from 'node:test';
import assert from 'node:assert';

test('basic math works', () => {
  assert.strictEqual(1 + 1, 2);
  assert.strictEqual(2 * 3, 6);
  assert.strictEqual(10 / 2, 5);
});

test('string operations work', () => {
  assert.strictEqual('hello' + ' ' + 'world', 'hello world');
  assert.strictEqual('test'.length, 4);
  assert.strictEqual('NOVA'.toLowerCase(), 'nova');
});

test('array operations work', () => {
  const arr = [1, 2, 3];
  assert.strictEqual(arr.length, 3);
  assert.strictEqual(arr[0], 1);
  assert.strictEqual(arr.push(4), 4);
  assert.strictEqual(arr.length, 4);
});

test('object operations work', () => {
  const obj = { name: 'Nova', version: '2.0.0' };
  assert.strictEqual(obj.name, 'Nova');
  assert.strictEqual(obj.version, '2.0.0');
  assert.strictEqual(Object.keys(obj).length, 2);
});

test('async operations work', async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});

test('error handling works', () => {
  assert.throws(() => {
    throw new Error('Test error');
  }, Error);

  assert.doesNotThrow(() => {
    // This should not throw
  });
});
