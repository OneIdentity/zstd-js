import {ZstdInit, ZstdCodec} from '..';
import 'text-encoding-polyfill';

ZstdInit().then(({ZstdStream, ZstdSimple}: ZstdCodec) => {
  // Create some sample data to compress
  const rawText =
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Distinctio ducimus eaque est fugit inventore labore, nam neque porro ratione voluptatibus?';
  const rawData = new TextEncoder().encode(rawText);

  console.log('Source text: ', rawText);

  // Simple usages
  (() => {
    // Init result array for compressed data
    let result: Uint8Array | null = null;

    try {
      // Do the simple compression
      result = ZstdSimple.compress(new Uint8Array(rawData));

      // Log out the simple compressed Int8Array
      console.log('[Simple] Compressed result:', result);
    } catch (err: any) {
      // Error message
      console.error(err);
    }

    try {
      // Check if the compression was not failed
      if (!result) return;

      // Do the simple decompression
      result = ZstdSimple.decompress(result);

      // Log out the simple decompressed message.
      console.log('[Simple] Decompressed result: ', new TextDecoder().decode(result));
    } catch (err: any) {
      // Error message
      console.error(err);
    }
  })();

  // Stream usages
  (() => {
    // Init result array for compressed data
    let result: Uint8Array | null = null;

    try {
      // Do the stream compression
      result = ZstdStream.compress(new Uint8Array(rawData), 3, false);

      // Log out the stream compressed Int8Array
      console.log('[Stream] Compressed result:', result);
    } catch (err: any) {
      // Error message
      console.error(err);
    }

    try {
      // Check if the compression was not failed
      if (!result) return;

      // Do the stream decompression
      result = ZstdStream.decompress(result);

      // Log out the stream decompressed message.
      console.log('[Stream] Decompressed result:', new TextDecoder().decode(result));
    } catch (err: any) {
      // Error message
      console.error(err);
    }
  })();
});
