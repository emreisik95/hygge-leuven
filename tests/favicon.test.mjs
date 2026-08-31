import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function readIcoImage(buffer, requestedSize) {
  assert.equal(buffer.readUInt16LE(0), 0, "ICO reserved field must be zero");
  assert.equal(buffer.readUInt16LE(2), 1, "file must be an ICO image");

  const imageCount = buffer.readUInt16LE(4);
  for (let index = 0; index < imageCount; index += 1) {
    const entryOffset = 6 + index * 16;
    const width = buffer[entryOffset] || 256;
    const height = buffer[entryOffset + 1] || 256;
    if (width !== requestedSize || height !== requestedSize) continue;

    return {
      width,
      height,
      dataOffset: buffer.readUInt32LE(entryOffset + 12),
    };
  }

  assert.fail(`favicon.ico must contain a ${requestedSize}x${requestedSize} image`);
}

test("the legacy ICO uses the classic tan-and-ink h artwork", async () => {
  const favicon = await readFile("app/favicon.ico");
  const image = readIcoImage(favicon, 48);
  const dibHeaderSize = favicon.readUInt32LE(image.dataOffset);

  assert.equal(dibHeaderSize, 40, "48px icon must use a standard bitmap header");
  assert.equal(favicon.readInt32LE(image.dataOffset + 4), image.width);
  assert.equal(favicon.readInt32LE(image.dataOffset + 8), image.height * 2);
  assert.equal(favicon.readUInt16LE(image.dataOffset + 14), 32);

  const pixelOffset = image.dataOffset + dibHeaderSize;
  let tanPixels = 0;
  let inkPixels = 0;

  for (let pixel = 0; pixel < image.width * image.height; pixel += 1) {
    const offset = pixelOffset + pixel * 4;
    const blue = favicon[offset];
    const green = favicon[offset + 1];
    const red = favicon[offset + 2];
    const alpha = favicon[offset + 3];

    if (alpha > 200 && red > 215 && green > 195 && blue > 165) tanPixels += 1;
    if (alpha > 200 && red < 45 && green < 40 && blue < 35) inkPixels += 1;
  }

  const totalPixels = image.width * image.height;
  assert.ok(tanPixels > totalPixels * 0.45, "classic tan background is missing");
  assert.ok(inkPixels > totalPixels * 0.07, "classic dark h is missing");
});
