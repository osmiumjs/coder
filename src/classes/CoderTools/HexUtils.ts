export class HexUtils {
	// Hex utilities
	static hexToBinStr(val: string): string {
		const bytes: number[] = [];
		for (let i = 0; i < val.length; i += 2) {
			bytes.push(parseInt(val.substring(i, i + 2), 16));
		}
		return String.fromCharCode(...bytes);
	}

	static hexToBytes(val: string): Uint8Array {
		const bytes = [] as number[];
		for (let i = 0; i < val.length; i += 2) {
			bytes.push(parseInt(val.substring(i, i + 2), 16));
		}
		return new Uint8Array(bytes);
	}

	static bytesToHex(bytes: Uint8Array | Buffer): string {
		return Buffer.from(bytes).toString('hex').toUpperCase();
	}

	static stringToHex(str: string, encoding: BufferEncoding = 'utf8'): string {
		return Buffer.from(str, encoding).toString('hex').toUpperCase();
	}

	static hexToString(hex: string, encoding: BufferEncoding = 'utf8'): string {
		return Buffer.from(hex, 'hex').toString(encoding);
	}
}
