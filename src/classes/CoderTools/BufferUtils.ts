export class BufferUtils {
	// Buffer utilities
	static isBuffer(what: any): boolean {
		return what instanceof Uint8Array || Buffer.isBuffer(what);
	}

	static makeWBuffer(cb: (arg: Buffer) => void, length: number): Buffer {
		const buf = Buffer.alloc(length);
		cb(buf);
		return buf;
	}

	static toBuffer(what: string | Buffer, ascii: boolean = false): Buffer {
		const encoding = ascii ? 'ascii' : 'utf8';
		return Buffer.isBuffer(what) ? what : Buffer.from(what, encoding);
	}

	static concatBuffers(...buffers: (Buffer | Uint8Array)[]): Buffer {
		return Buffer.concat(buffers.map(b => Buffer.from(b)));
	}

	static splitBuffer(buffer: Buffer | Uint8Array, chunkSize: number): Buffer[] {
		const buf = Buffer.from(buffer);
		const chunks: Buffer[] = [];
		for (let i = 0; i < buf.length; i += chunkSize) {
			chunks.push(buf.subarray(i, i + chunkSize));
		}
		return chunks;
	}

	// String/bytes conversions
	static stringToBytes(str: string, encoding: BufferEncoding = 'utf8'): Uint8Array {
		return new Uint8Array(Buffer.from(str, encoding));
	}

	static bytesToString(bytes: Uint8Array | Buffer, encoding: BufferEncoding = 'utf8'): string {
		return Buffer.from(bytes).toString(encoding);
	}
}
