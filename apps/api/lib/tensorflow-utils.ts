/**
 * TensorFlow.js Utility Functions
 * Industry-standard utilities for TensorFlow.js operations
 */

import * as tf from '@tensorflow/tfjs-node';

/**
 * Enhanced error handling for TensorFlow operations
 */
export class TensorFlowErrorHandler {
  /**
   * Wrap TensorFlow operations with enhanced error handling
   */
  static async withErrorHandling<T>(
    operation: () => T | Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      throw new TensorFlowError(error, context);
    }
  }

  /**
   * Validate tensor shapes for operations
   */
  static validateShapeCompatibility(
    tensor1: tf.Tensor,
    tensor2: tf.Tensor,
    operation: string
  ): void {
    const shape1 = tensor1.shape;
    const shape2 = tensor2.shape;

    if (!this.areShapesCompatible(shape1, shape2, operation)) {
      throw new TensorFlowError(
        `Shape incompatibility for ${operation}: ${shape1} vs ${shape2}. ` +
        `Tensors must have compatible shapes for broadcast operations.`,
        'shape_validation'
      );
    }
  }

  /**
   * Check if shapes are compatible for broadcasting
   */
  private static areShapesCompatible(
    shape1: number[],
    shape2: number[], 
    operation: string
  ): boolean {
    // Simple compatibility check - can be enhanced
    if (operation === 'add' || operation === 'multiply') {
      return shape1.length === shape2.length && 
             shape1.every((dim, i) => dim === shape2[i] || dim === 1 || shape2[i] === 1);
    }
    return true; // Default to compatible for other operations
  }
}

/**
 * Enhanced TensorFlow error with better context
 */
export class TensorFlowError extends Error {
  public readonly originalError: Error;
  public readonly context?: string;
  public readonly errorType: string;

  constructor(originalError: Error | string, context?: string) {
    const message = typeof originalError === 'string' 
      ? originalError 
      : originalError.message;

    const enhancedMessage = context 
      ? `TensorFlow error in ${context}: ${message}`
      : `TensorFlow error: ${message}`;

    super(enhancedMessage);

    this.name = 'TensorFlowError';
    this.originalError = typeof originalError === 'string' 
      ? new Error(originalError) 
      : originalError;
    this.context = context;
    this.errorType = this.categorizeError(message);
  }

  /**
   * Categorize error type for better handling
   */
  private categorizeError(message: string): string {
    if (message.includes('shape') || message.includes('broadcast')) {
      return 'shape_mismatch';
    }
    if (message.includes('dtype') || message.includes('type')) {
      return 'type_mismatch';
    }
    if (message.includes('memory') || message.includes('allocation')) {
      return 'memory_error';
    }
    if (message.includes('dimension') || message.includes('axis')) {
      return 'dimension_error';
    }
    return 'general_error';
  }
}

/**
 * Memory management utilities
 */
export class TensorFlowMemoryManager {
  /**
   * Execute operation with automatic memory cleanup
   */
  static tidy<T>(fn: () => T): T {
    return tf.tidy(fn);
  }

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): {
    numTensors: number;
    numDataBuffers: number;
    numBytes: number;
  } {
    return tf.memory();
  }

  /**
   * Validate memory usage doesn't exceed threshold
   */
  static validateMemoryUsage(maxTensors: number = 1000): void {
    const memory = tf.memory();
    if (memory.numTensors > maxTensors) {
      console.warn(
        `TensorFlow memory warning: ${memory.numTensors} tensors in memory ` +
        `(threshold: ${maxTensors}). Consider cleaning up unused tensors.`
      );
    }
  }

  /**
   * Log memory usage for debugging
   */
  static logMemoryUsage(context?: string): void {
    const memory = tf.memory();
    const prefix = context ? `[${context}] ` : '';
    console.log(
      `${prefix}TensorFlow Memory: ${memory.numTensors} tensors, ` +
      `${memory.numDataBuffers} buffers, ${Math.round(memory.numBytes / 1024)}KB`
    );
  }
}

/**
 * Model utilities
 */
export class TensorFlowModelUtils {
  /**
   * Validate model input shape
   */
  static validateModelInput(
    model: tf.LayersModel,
    input: tf.Tensor
  ): void {
    const expectedShape = model.inputShape as number[];
    const actualShape = input.shape;

    if (expectedShape && actualShape.length !== expectedShape.length) {
      throw new TensorFlowError(
        `Input shape mismatch: expected ${expectedShape.length}D tensor, ` +
        `got ${actualShape.length}D tensor (shape: ${actualShape})`,
        'model_input_validation'
      );
    }

    // Check individual dimensions (excluding batch dimension)
    for (let i = 1; i < expectedShape.length; i++) {
      if (expectedShape[i] && expectedShape[i] !== actualShape[i]) {
        throw new TensorFlowError(
          `Input dimension ${i} mismatch: expected ${expectedShape[i]}, ` +
          `got ${actualShape[i]}`,
          'model_input_validation'
        );
      }
    }
  }

  /**
   * Create model with proper error handling
   */
  static async createModel(
    config: tf.ContainerArgs | tf.SequentialArgs,
    type: 'sequential' | 'functional' = 'sequential'
  ): Promise<tf.LayersModel> {
    return TensorFlowErrorHandler.withErrorHandling(async () => {
      if (type === 'sequential') {
        return tf.sequential(config as tf.SequentialArgs);
      } else {
        // For functional models, additional logic would be needed
        throw new Error('Functional model creation not implemented');
      }
    }, 'model_creation');
  }

  /**
   * Compile model with validation
   */
  static compileModel(
    model: tf.LayersModel,
    config: tf.ModelCompileArgs
  ): void {
    TensorFlowErrorHandler.withErrorHandling(() => {
      model.compile(config);
    }, 'model_compilation');
  }

  /**
   * Safe model prediction with proper cleanup
   */
  static async predict<T extends tf.Tensor>(
    model: tf.LayersModel,
    inputs: tf.Tensor | tf.Tensor[]
  ): Promise<T> {
    return TensorFlowMemoryManager.tidy(() => {
      // Validate inputs if it's a single tensor
      if (!Array.isArray(inputs)) {
        TensorFlowModelUtils.validateModelInput(model, inputs);
      }

      const prediction = model.predict(inputs) as T;
      return prediction;
    });
  }
}

/**
 * Data preprocessing utilities
 */
export class TensorFlowDataUtils {
  /**
   * Safely create tensor with validation
   */
  static createTensor(
    data: any,
    shape?: number[],
    dtype?: tf.DataType
  ): tf.Tensor {
    return TensorFlowErrorHandler.withErrorHandling(() => {
      if (shape) {
        return tf.tensor(data, shape, dtype);
      } else {
        return tf.tensor(data, undefined, dtype);
      }
    }, 'tensor_creation') as tf.Tensor;
  }

  /**
   * Normalize tensor data
   */
  static normalizeTensor(tensor: tf.Tensor): tf.Tensor {
    return TensorFlowMemoryManager.tidy(() => {
      const min = tensor.min();
      const max = tensor.max();
      const range = max.sub(min);
      
      // Avoid division by zero
      const normalizedRange = tf.where(
        range.equal(0),
        tf.ones(range.shape),
        range
      );
      
      return tensor.sub(min).div(normalizedRange);
    });
  }

  /**
   * Split data into training and validation sets
   */
  static splitData(
    features: tf.Tensor,
    labels: tf.Tensor,
    validationSplit: number = 0.2
  ): {
    trainFeatures: tf.Tensor;
    trainLabels: tf.Tensor;
    valFeatures: tf.Tensor;
    valLabels: tf.Tensor;
  } {
    return TensorFlowMemoryManager.tidy(() => {
      const numSamples = features.shape[0];
      const trainSize = Math.floor(numSamples * (1 - validationSplit));

      return {
        trainFeatures: features.slice([0, 0], [trainSize, -1]),
        trainLabels: labels.slice([0], [trainSize]),
        valFeatures: features.slice([trainSize, 0], [-1, -1]),
        valLabels: labels.slice([trainSize], [-1]),
      };
    });
  }
}

// Export all utilities
export {
  tf as TensorFlow,
};