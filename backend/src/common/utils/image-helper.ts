export interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensions(buffer: Buffer): ImageDimensions | null {
  // Check if PNG
  if (
    buffer.length > 24 &&
    buffer.readUInt32BE(0) === 0x89504e47 &&
    buffer.readUInt32BE(12) === 0x49484452
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // Check if JPEG
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) return null; // Invalid JPEG
      const marker = buffer[offset + 1];
      if (marker === 0xd9 || marker === 0xda) {
        break; // End of image or start of scan data
      }
      if (offset + 3 >= buffer.length) return null;
      const length = buffer.readUInt16BE(offset + 2);
      // SOF0 (0xC0) or SOF2 (0xC2) marker
      if (marker === 0xc0 || marker === 0xc2) {
        if (offset + 9 >= buffer.length) return null;
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset += 2 + length;
    }
  }
  return null;
}
