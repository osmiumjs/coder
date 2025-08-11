import {iterateSync} from '@osmium/iterate';

export class BitOperations {
	// Binary flags and utils
	static pad(str: string | number, z: number = 8): string {
		return (`${str}`).length < z ? this.pad(`0${str}`, z) : `${str}`;
	}

	static bufToBinFlags(buf: Buffer | number, offset: number = 0): Array<boolean> {
		const dataStr = Buffer.isBuffer(buf)
		                ? buf.readUInt8(offset).toString(2)
		                : Number(buf).toString(2);
		return this.pad(dataStr).split('').map(r => r === '1');
	}

	static binFlagsToBuf(arr: Array<boolean>): Buffer {
		const arrayByte: any = iterateSync(Array(8).fill(false, 0, 8), (el, idx) => arr[idx] ? 1 : 0, []);
		const byte = arrayByte.join('');
		return Buffer.from([parseInt(byte, 2)]);
	}

	// Binary string utilities
	static bytesToBinary(bytes: Uint8Array | Buffer): string {
		return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('');
	}

	static binaryToBytes(binary: string): Uint8Array {
		const out: number[] = [];
		for (let i = 0; i < binary.length; i += 8) {
			out.push(parseInt(binary.slice(i, i + 8), 2));
		}
		return new Uint8Array(out);
	}

	static stringToBinary(str: string, encoding: BufferEncoding = 'utf8'): string {
		return this.bytesToBinary(Buffer.from(str, encoding));
	}

	static binaryToString(binary: string, encoding: BufferEncoding = 'utf8'): string {
		return Buffer.from(this.binaryToBytes(binary)).toString(encoding);
	}

	// Bit manipulation utilities
	static setBit(num: number, position: number): number {
		return num | (1 << position);
	}

	static clearBit(num: number, position: number): number {
		return num & ~(1 << position);
	}

	static toggleBit(num: number, position: number): number {
		return num ^ (1 << position);
	}

	static getBit(num: number, position: number): boolean {
		return (num & (1 << position)) !== 0;
	}

	static countSetBits(num: number): number {
		let count = 0;
		while (num) {
			count += num & 1;
			num >>>= 1;
		}
		return count;
	}

	// Endianness
	static swapEndian16(val: number): number {
		return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
	}

	static swapEndian32(val: number): number {
		return ((val & 0xFF) << 24) |
		       (((val >> 8) & 0xFF) << 16) |
		       (((val >> 16) & 0xFF) << 8) |
		       ((val >> 24) & 0xFF);
	}
}
