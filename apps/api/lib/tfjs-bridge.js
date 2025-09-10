// Cross-arch TensorFlow bridge
// Tries to load native tfjs-node where available; falls back to pure JS @tensorflow/tfjs otherwise.
// This keeps AI features available on ARM64 and minimal containers.
let tf;
try {
  tf = await import('@tensorflow/tfjs-node');
} catch (e) {
  // Fallback to pure JS (CPU) implementation
  tf = await import('@tensorflow/tfjs');
}
export default tf;

