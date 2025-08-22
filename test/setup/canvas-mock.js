// Canvas mock for Jest testing
module.exports = {
  createCanvas: () => ({
    getContext: () => ({
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      fillText: () => {},
      strokeText: () => {},
    }),
    toBuffer: () => Buffer.from(''),
    toDataURL: () => '',
    width: 0,
    height: 0,
  }),
  loadImage: () => Promise.resolve({}),
  registerFont: () => {},
};
