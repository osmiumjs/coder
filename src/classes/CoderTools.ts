import {iterateSync}    from '@osmium/iterate';
import {base32, base64} from '../lib/rfc4648';

const crc32 = require('../lib/crc/crc32');
import BaseX            from '../lib/base-x/index';

export class CoderTools {
	static BASE_ALPHABETS = {
		BASE16: '0123456789ABCDEF',
		BASE36: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		BASE58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
		BASE62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
		BASE66: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~'
	};

	static isBuffer(what: any): boolean {
		if (what instanceof Uint8Array) return true;
		return Buffer.isBuffer(what);
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

	static baseXEncode(what: string | Buffer, base: string, asAscii: boolean = false): string {
		return BaseX(base).encode(this.toBuffer(what, asAscii));
	}

	static baseXDecode(what: string, base: string, asBuffer = false, asAscii = false): string | Buffer {
		const b = BaseX(base).decode(what);
		const encoding = asAscii ? 'ascii' : 'utf8';

		return asBuffer ? b : b.toString(encoding);
	}

	static base16Encode(what: string | Buffer, asAscii = false): string {
		return this.baseXEncode(what, this.BASE_ALPHABETS.BASE16, asAscii);
	}

	static base32Encode(what: string | Buffer, asAscii = false): string {
		return base32.stringify(this.toBuffer(what, asAscii));
	}

	static base36Encode(what: string | Buffer, asAscii = false): string {
		return this.baseXEncode(what, this.BASE_ALPHABETS.BASE36, asAscii);
	}

	static base58Encode(what: string | Buffer, asAscii = false): string {
		return this.baseXEncode(what, this.BASE_ALPHABETS.BASE58, asAscii);
	}

	static base62Encode(what: string | Buffer, asAscii = false): string {
		return this.baseXEncode(what, this.BASE_ALPHABETS.BASE62, asAscii);
	}

	static base64Encode(what: string | Buffer, asAscii = false): string {
		return base64.stringify(this.toBuffer(what, asAscii));
	}

	static base66Encode(what: string | Buffer, asAscii = false): string {
		return this.baseXEncode(what, this.BASE_ALPHABETS.BASE66, asAscii);
	}

	static base16Decode(what: string, asBuffer = false, asAscii = false): string | Buffer {
		return this.baseXDecode(what, this.BASE_ALPHABETS.BASE16, asBuffer, asAscii);
	}

	static base32Decode(what: string, asBuffer = false, asAscii = false): string | Buffer | Uint8Array {
		const result = base32.parse(what, {loose: true});
		const encoding = asAscii ? 'ascii' : 'utf8';

		return asBuffer ? result : Buffer.from(result).toString(encoding);
	}

	static base36Decode(what: string, asBuffer = false, asAscii = false): string | Buffer {
		return this.baseXDecode(what, this.BASE_ALPHABETS.BASE36, asBuffer, asAscii);
	}

	static base58Decode(what: string, asBuffer = false, asAscii = false): string | Buffer | Uint8Array {
		return this.baseXDecode(what, this.BASE_ALPHABETS.BASE58, asBuffer, asAscii);
	}

	static base62Decode(what: string, asBuffer = false, asAscii = false): string | Buffer {
		return this.baseXDecode(what, this.BASE_ALPHABETS.BASE62, asBuffer, asAscii);
	}

	static base64Decode(what: string, asBuffer = false, asAscii = false): string | Buffer | Uint8Array {
		const result = base64.parse(what, {loose: true});
		const encoding = asAscii ? 'ascii' : 'utf8';

		return asBuffer ? result : Buffer.from(result).toString(encoding);
	}

	static base66Decode(what: string, asBuffer = false, asAscii = false): string | Buffer {
		return this.baseXDecode(what, this.BASE_ALPHABETS.BASE66, asBuffer, asAscii);
	}

	static twoInt32toInt53(val: [number, number]): number {
		const buffer = new ArrayBuffer(8);
		(new Uint32Array(buffer))[0] = val[0];
		(new Uint32Array(buffer))[1] = val[1];
		return new Float64Array(buffer)[0];
	}

	static int53toTwoInt32(val: number): [number, number] {
		const buf = new ArrayBuffer(8);
		(new Float64Array(buf))[0] = val;
		return [(new Uint32Array(buf))[0], (new Uint32Array(buf))[1]];
	}

	static intToBuf(int: number, len = 7, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeIntBE(int, 0, len) : b.writeIntLE(int, 0, len), len);
	}

	static int8ToBuf(int: number): Buffer {
		return this.makeWBuffer(b => b.writeInt8(int, 0), 1);
	}

	static int8UToBuf(int: number): Buffer {
		return this.makeWBuffer(b => b.writeUInt8(int, 0), 1);
	}

	static int16ToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeInt16BE(int, 0) : b.writeInt16LE(int, 0), 2);
	}

	static int16UToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeUInt16BE(int, 0) : b.writeUInt16LE(int, 0), 2);
	}

	static int32ToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeInt32BE(int, 0) : b.writeInt32LE(int, 0), 4);
	}

	static int32UToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeUInt32BE(int, 0) : b.writeUInt32LE(int, 0), 4);
	}

	static floatToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeFloatBE(int, 0) : b.writeFloatLE(int, 0), 4);
	}

	static doubleToBuf(int: number, be = false): Buffer {
		return this.makeWBuffer(b => be ? b.writeDoubleBE(int, 0) : b.writeDoubleLE(int, 0), 8);
	}

	static bufToInt8(buf: Buffer, offset = 0): number {
		return buf.readInt8(offset);
	}

	static bufToInt8U(buf: Buffer, offset = 0): number {
		return buf.readUInt8(offset);
	}

	static bufToInt16(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readInt16BE(offset) : buf.readInt16LE(offset);
	}

	static bufToInt16U(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readUInt16BE(offset) : buf.readUInt16LE(offset);
	}

	static bufToInt32(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readInt32BE(offset) : buf.readInt32LE(offset);
	}

	static bufToInt32U(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readUInt32BE(offset) : buf.readUInt32LE(offset);
	}

	static bufToInt(buf: Buffer, len = 7, offset = 0, be = false): number {
		return be ? buf.readIntBE(offset, len) : buf.readIntLE(offset, len);
	}

	static bufToFloat(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readFloatBE(offset) : buf.readFloatLE(offset);
	}

	static bufToDouble(buf: Buffer, offset = 0, be = false): number {
		return be ? buf.readDoubleBE(offset) : buf.readDoubleLE(offset);
	}

	static pad(str: string | number, z: number = 8): string {
		return (`${str}`).length < z ? this.pad(`0${str}`, z) : `${str}`;
	}

	static bufToBinFlags(buf: Buffer | number, offset: number = 0): Array<boolean> {
		const data = Buffer.isBuffer(buf) ? this.bufToInt8U(buf, offset).toString(2) : buf;
		return this.pad(data).split('').map(r => r === '1');
	}

	static binFlagsToBuf(arr: Array<boolean>): Buffer {
		const arrayByte: any = iterateSync(Array(8).fill(false, 0, 8), (el, idx) => arr[idx] ? 1 : 0, []);
		const byte = arrayByte.join('');

		return this.int8UToBuf(parseInt(byte, 2));
	}

	static hexToBinStr(val: string): string {
		let i = 0, l = val.length - 1, bytes = [];
		for (i; i < l; i += 2) bytes.push(parseInt(val.substring(i, 2), 16));

		return String.fromCharCode.apply(String, bytes);
	}

	static crc32(data: Buffer | Uint8Array | string, previous: number = 0): number {
		return crc32(data, previous);
	}
}
