// Cross-arch TensorFlow bridge
// Tries to load native tfjs-node where available; falls back to pure JS @tensorflow/tfjs otherwise.
// This keeps AI features available on ARM64 and minimal containers.
let tf;
try {
  tf = await import('@tensorflow/tfjs-node');
} catch (e) {
  // Enhanced error logging for TensorFlow bridge fallback
  console.warn('TensorFlow.js native backend unavailable, falling back to pure JS implementation:', {
    error: e.message,
    code: e.code,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  });
  
  // Fallback to pure JS (CPU) implementation
  tf = await import('@tensorflow/tfjs');
}
export default tf;

