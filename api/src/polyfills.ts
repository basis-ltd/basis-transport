/* eslint-disable @typescript-eslint/no-require-imports */
const buffer = require('buffer');

if (!buffer.SlowBuffer) {
  function SlowBuffer(size: number) {
    return buffer.Buffer.alloc(size);
  }
  SlowBuffer.prototype = buffer.Buffer.prototype;
  buffer.SlowBuffer = SlowBuffer;
}
