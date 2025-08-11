import {CRC32} from '../../lib/crc/crc32';

export class Checksum {
	// Checksums and hashes
	static crc32(data: Buffer | Uint8Array | string): number {
		return CRC32.calc(data);
	}

	static xorChecksum(data: Buffer | Uint8Array | string): number {
		const bytes = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
		let x = 0;
		for (const b of bytes) x ^= b;
		return x;
	}

	static djb2Hash(str: string): number {
		let hash = 5381;
		for (let i = 0; i < str.length; i++) {
			hash = ((hash << 5) + hash) + str.charCodeAt(i);
		}
		return hash >>> 0;
	}

	static sdbmHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
		}
		return hash >>> 0;
	}
}
