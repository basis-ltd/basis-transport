/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const buffer = require('buffer');

if (!buffer.SlowBuffer) {
  function SlowBuffer(size: number) {
    return buffer.Buffer.alloc(size);
  }
  SlowBuffer.prototype = buffer.Buffer.prototype;
  buffer.SlowBuffer = SlowBuffer;
}
