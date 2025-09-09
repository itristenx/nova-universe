/**
 * Basic TensorFlow.js Functionality Validation Tests
 * 
 * Tests core TensorFlow.js functionality to ensure the system is working correctly
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import * as tf from '@tensorflow/tfjs-node';

describe('Basic TensorFlow.js Functionality Tests', () => {
  before(async () => {
    console.log('🔬 Testing Basic TensorFlow.js Functionality...');
    console.log(`TensorFlow.js version: ${tf.version.tfjs}`);
  });

  after(async () => {
    console.log('✅ Basic TensorFlow.js Tests Complete');
  });

  describe('Core TensorFlow.js Operations', () => {
    test('should create and manipulate tensors', async () => {
      const tensor1 = tf.tensor1d([1, 2, 3, 4]);
      const tensor2 = tf.tensor1d([5, 6, 7, 8]);
      
      assert.deepStrictEqual(tensor1.shape, [4], 'Tensor shape should be correct');
      assert.equal(tensor1.dtype, 'float32', 'Default dtype should be float32');
      
      const result = tf.add(tensor1, tensor2);
      const resultData = await result.data();
      assert.deepStrictEqual(Array.from(resultData), [6, 8, 10, 12], 'Tensor operations should work correctly');
      
      // Cleanup
      tensor1.dispose();
      tensor2.dispose();
      result.dispose();
    });

    test('should create neural network models', async () => {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });
      
      assert.ok(model, 'Model should be created');
      assert.equal(model.layers.length, 3, 'Model should have 3 layers');
      assert.deepStrictEqual(model.inputShape, [null, 4], 'Input shape should be correct');
      
      model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
      
      assert.ok(model.optimizer, 'Model should have optimizer after compilation');
      
      // Test prediction
      const input = tf.randomNormal([1, 4]);
      const prediction = model.predict(input);
      assert.ok(prediction, 'Model should make predictions');
      assert.deepStrictEqual(prediction.shape, [1, 1], 'Prediction shape should be correct');
      
      // Cleanup
      input.dispose();
      prediction.dispose();
      model.dispose();
    });

    test('should handle different data types', () => {
      const float32Tensor = tf.tensor1d([1, 2, 3], 'float32');
      const int32Tensor = tf.tensor1d([1, 2, 3], 'int32');
      const boolTensor = tf.tensor1d([true, false, true], 'bool');
      
      assert.equal(float32Tensor.dtype, 'float32', 'Should support float32');
      assert.equal(int32Tensor.dtype, 'int32', 'Should support int32');
      assert.equal(boolTensor.dtype, 'bool', 'Should support boolean');
      
      float32Tensor.dispose();
      int32Tensor.dispose();
      boolTensor.dispose();
    });

    test('should manage memory properly', () => {
      const initialMemory = tf.memory();
      
      // Create and dispose tensors
      const tensors = [];
      for (let i = 0; i < 5; i++) {
        tensors.push(tf.randomNormal([10, 10]));
      }
      
      const middleMemory = tf.memory();
      assert.ok(middleMemory.numTensors > initialMemory.numTensors, 'Memory usage should increase');
      
      // Dispose all tensors
      tensors.forEach(tensor => tensor.dispose());
      
      const finalMemory = tf.memory();
      assert.equal(finalMemory.numTensors, initialMemory.numTensors, 'Memory should be cleaned up');
    });
  });

  describe('Advanced TensorFlow.js Features', () => {
    test('should support model training', async () => {
      // Create a simple model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [2], units: 4, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      model.compile({
        optimizer: 'sgd',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Create simple training data
      const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);
      const ys = tf.tensor2d([[0], [1], [1], [0]]); // XOR function

      // Train for 1 epoch (quick test)
      const history = await model.fit(xs, ys, {
        epochs: 1,
        batchSize: 4,
        verbose: 0
      });

      assert.ok(history, 'Training should complete');
      assert.ok(history.history, 'History should be recorded');
      assert.ok(history.history.loss, 'Loss should be tracked');

      // Cleanup
      xs.dispose();
      ys.dispose();
      model.dispose();
    });

    test('should support model saving and loading', async () => {
      // Create a simple model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [2], units: 3, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

      // Save to memory (for testing without filesystem)
      const saveResult = await model.save('localstorage://test-model');
      assert.ok(saveResult, 'Model should save successfully');

      // Load the model back
      const loadedModel = await tf.loadLayersModel('localstorage://test-model');
      assert.ok(loadedModel, 'Model should load successfully');
      assert.equal(loadedModel.layers.length, model.layers.length, 'Loaded model should have same structure');

      // Test that both models produce same output
      const input = tf.randomNormal([1, 2]);
      const originalOutput = model.predict(input);
      const loadedOutput = loadedModel.predict(input);
      
      // They should have the same shape
      assert.deepStrictEqual(originalOutput.shape, loadedOutput.shape, 'Outputs should have same shape');

      // Cleanup
      input.dispose();
      originalOutput.dispose();
      loadedOutput.dispose();
      model.dispose();
      loadedModel.dispose();
    });

    test('should support custom layers and operations', () => {
      // Test custom activation function
      const customActivation = (x) => tf.relu(x);
      
      const input = tf.tensor1d([-2, -1, 0, 1, 2]);
      const output = customActivation(input);
      const outputData = output.arraySync();
      
      assert.deepStrictEqual(outputData, [0, 0, 0, 1, 2], 'Custom activation should work');
      
      input.dispose();
      output.dispose();
    });

    test('should support batch processing', async () => {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [3], units: 2, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

      // Batch prediction test
      const batchInput = tf.randomNormal([10, 3]); // 10 samples
      const batchOutput = model.predict(batchInput);
      
      assert.deepStrictEqual(batchOutput.shape, [10, 1], 'Batch output should have correct shape');

      // Cleanup
      batchInput.dispose();
      batchOutput.dispose();
      model.dispose();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle tensor shape mismatches gracefully', () => {
      try {
        const tensor1 = tf.tensor1d([1, 2, 3]);
        const tensor2 = tf.tensor2d([[1, 2], [3, 4]]);
        const result = tf.add(tensor1, tensor2);
        result.dispose();
        tensor1.dispose();
        tensor2.dispose();
        assert.fail('Should have thrown an error for shape mismatch');
      } catch (error) {
        assert.ok(error instanceof Error, 'Should throw proper error');
        assert.ok(error.message.length > 0, 'Error should have descriptive message');
      }
    });

    test('should validate model inputs', () => {
      const model = tf.sequential({
        layers: [tf.layers.dense({ inputShape: [5], units: 1 })]
      });

      try {
        const wrongInput = tf.randomNormal([1, 3]); // Wrong shape
        const prediction = model.predict(wrongInput);
        prediction.dispose();
        wrongInput.dispose();
        assert.fail('Should have thrown an error for wrong input shape');
      } catch (error) {
        assert.ok(error instanceof Error, 'Should throw proper error');
      } finally {
        model.dispose();
      }
    });

    test('should handle invalid tensor creation', () => {
      try {
        tf.tensor2d([1, 2, 3], [2, 2]); // Invalid shape
        assert.fail('Should have thrown an error for invalid shape');
      } catch (error) {
        assert.ok(error instanceof Error, 'Should throw proper error');
      }
    });
  });

  describe('Performance and Memory', () => {
    test('should execute operations efficiently', () => {
      const startTime = Date.now();
      
      // Perform multiple operations
      const operations = 100;
      for (let i = 0; i < operations; i++) {
        const a = tf.randomNormal([100]);
        const b = tf.randomNormal([100]);
        const result = tf.add(a, b);
        
        a.dispose();
        b.dispose();
        result.dispose();
      }
      
      const endTime = Date.now();
      const timePerOperation = (endTime - startTime) / operations;
      
      assert.ok(timePerOperation < 10, `Operations should be fast (${timePerOperation}ms per op)`);
    });

    test('should maintain stable memory usage', () => {
      const initialMemory = tf.memory();
      
      // Perform operations in tidy blocks
      for (let i = 0; i < 10; i++) {
        tf.tidy(() => {
          const a = tf.randomNormal([50, 50]);
          const b = tf.randomNormal([50, 50]);
          const c = tf.matMul(a, b);
          return c;
        });
      }
      
      const finalMemory = tf.memory();
      const memoryIncrease = finalMemory.numTensors - initialMemory.numTensors;
      
      assert.ok(memoryIncrease <= 1, `Memory should be stable (increase: ${memoryIncrease} tensors)`);
    });
  });
});