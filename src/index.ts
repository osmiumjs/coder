import {base32, base64} from './lib/rfc4648';
import * as nTools from '@osmium/tools';
import {encode, decode} from './lib/binarySerializer';
import {DetectorCallback, DecodeCallback, DecodeResult, DecodeCustoms, CommonCustoms, EncodeCallback, EncodeCustoms, IndexedObject} from './types';

const _Buffer = require('buffer').Buffer;
const crc32 = require('./lib/crc/crc32');

import BaseX from './lib/base-x/index';

const BASE_ALPHABETS = {
	BASE16: '0123456789ABCDEF',
	BASE36: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	BASE58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
	BASE62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	BASE66: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~'
};

/**
 * @param {function(Buffer)} cb
 * @param {Number} length
 * @returns {Buffer}
 */
function makeWBuffer(cb: (arg: Buffer) => void, length: number): Buffer {
	const buf = Buffer.alloc(length);
	cb(buf);
	return buf;
}

/**
 * @param {Buffer|String} what
 * @param {String} base
 * @param {Boolean} [ascii=false] ascii
 * @returns {string}
 */
function baseXEncode(what: Buffer | string, base: string, ascii: boolean = false): string {
	return BaseX(base).encode(Buffer.isBuffer(what) ? what : Buffer.from(what, ascii ? 'ascii' : 'utf8'));
}

/**
 * @param {Buffer|String} what
 * @param {String} base
 * @param {Boolean} [asBuffer=false] asBuffer
 * @param {Boolean} [ascii=false] ascii
 * @returns {Buffer|String}
 */
function baseXDecode(what: string, base: string, asBuffer = false, ascii = false): DecodeResult {
	/** @type {Buffer} */
	const b = BaseX(base).decode(what);
	return asBuffer ? b : b.toString(ascii ? 'ascii' : 'utf8');
}

const coderTools = {
	BASE_ALPHABETS,
	BaseX,
	base16Encode: (what: string | Buffer, asAscii = false): string => baseXEncode(what, BASE_ALPHABETS.BASE16, asAscii),
	base32Encode: (what: string | Buffer, asAscii = false): string => base32.stringify(Buffer.isBuffer(what) ? what : Buffer.from(what, asAscii ? 'ascii' : 'utf8')),
	base36Encode: (what: string | Buffer, asAscii = false): string => baseXEncode(what, BASE_ALPHABETS.BASE36, asAscii),
	base58Encode: (what: string | Buffer, asAscii = false): string => baseXEncode(what, BASE_ALPHABETS.BASE58, asAscii),
	base62Encode: (what: string | Buffer, asAscii = false): string => baseXEncode(what, BASE_ALPHABETS.BASE62, asAscii),
	base64Encode: (what: string | Buffer, asAscii = false): string => base64.stringify(Buffer.isBuffer(what) ? what : Buffer.from(what, asAscii ? 'ascii' : 'utf8')),
	base66Encode: (what: string | Buffer, asAscii = false): string => baseXEncode(what, BASE_ALPHABETS.BASE66, asAscii),
	base16Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult => baseXDecode(what, BASE_ALPHABETS.BASE16, asBuffer, asAscii),
	base32Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult | Uint8Array => {
		const result = base32.parse(what, {loose: true});
		return asBuffer ? result : Buffer.from(result).toString(asAscii ? 'ascii' : 'utf8');
	},
	base36Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult => baseXDecode(what, BASE_ALPHABETS.BASE36, asBuffer, asAscii),
	base58Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult | Uint8Array => baseXDecode(what, BASE_ALPHABETS.BASE58, asBuffer, asAscii),
	base62Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult => baseXDecode(what, BASE_ALPHABETS.BASE62, asBuffer, asAscii),
	base64Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult | Uint8Array => {
		const result = base64.parse(what, {loose: true});
		return asBuffer ? result : Buffer.from(result).toString(asAscii ? 'ascii' : 'utf8');
	},
	base66Decode: (what: string, asBuffer = false, asAscii = false): DecodeResult => baseXDecode(what, BASE_ALPHABETS.BASE66, asBuffer, asAscii),
	/**
	 * @param {[Number, Number]} val
	 * @returns {Number}
	 */
	twoInt32toInt53: (val: Array<number>): number => {
		const buffer = new ArrayBuffer(8);
		(new Uint32Array(buffer))[0] = val[0];
		(new Uint32Array(buffer))[1] = val[1];
		return new Float64Array(buffer)[0];
	},
	/**
	 * @param {Number} val
	 * @returns {[Number, Number]}
	 */
	int53toTwoInt32: (val: number): number[] => {
		const buf = new ArrayBuffer(8);
		(new Float64Array(buf))[0] = val;
		return [(new Uint32Array(buf))[0], (new Uint32Array(buf))[1]];
	},
	intToBuf       : (int: number, len = 7, be = false): Buffer => makeWBuffer(b => be ? b.writeIntBE(int, 0, len) : b.writeIntLE(int, 0, len), len),
	int8ToBuf      : (int: number): Buffer => makeWBuffer(b => b.writeInt8(int, 0), 1),
	int8UToBuf     : (int: number): Buffer => makeWBuffer(b => b.writeUInt8(int, 0), 1),
	int16ToBuf     : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeInt16BE(int, 0) : b.writeInt16LE(int, 0), 2),
	int16UToBuf    : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeUInt16BE(int, 0) : b.writeUInt16LE(int, 0), 2),
	int32ToBuf     : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeInt32BE(int, 0) : b.writeInt32LE(int, 0), 4),
	int32UToBuf    : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeUInt32BE(int, 0) : b.writeUInt32LE(int, 0), 4),
	floatToBuf     : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeFloatBE(int, 0) : b.writeFloatLE(int, 0), 4),
	doubleToBuf    : (int: number, be = false): Buffer => makeWBuffer(b => be ? b.writeDoubleBE(int, 0) : b.writeDoubleLE(int, 0), 8),
	bufToInt8      : (buf: Buffer, offset = 0): number => buf.readInt8(offset),
	bufToInt8U     : (buf: Buffer, offset = 0): number => buf.readUInt8(offset),
	bufToInt16     : (buf: Buffer, offset = 0, be = false): number => be ? buf.readInt16BE(offset) : buf.readInt16LE(offset),
	bufToInt16U    : (buf: Buffer, offset = 0, be = false): number => be ? buf.readUInt16BE(offset) : buf.readUInt16LE(offset),
	bufToInt32     : (buf: Buffer, offset = 0, be = false): number => be ? buf.readInt32BE(offset) : buf.readInt32LE(offset),
	bufToInt32U    : (buf: Buffer, offset = 0, be = false): number => be ? buf.readUInt32BE(offset) : buf.readUInt32LE(offset),
	bufToInt       : (buf: Buffer, len = 7, offset = 0, be = false): number => be ? buf.readIntBE(offset, len) : buf.readIntLE(offset, len),
	bufToFloat     : (buf: Buffer, offset = 0, be = false): number => be ? buf.readFloatBE(offset) : buf.readFloatLE(offset),
	bufToDouble    : (buf: Buffer, offset = 0, be = false): number => be ? buf.readDoubleBE(offset) : buf.readDoubleLE(offset),
	pad            : (str: string, z: number = 8): string => str.length < z ? coderTools.pad('0' + str, z) : str,
	bufToBinFlags  : (buf: Buffer, offset: number): Array<Boolean> => coderTools.pad(coderTools.bufToInt8U(buf, offset).toString(2)).split('').map(r => r === '1'),
	binFlagsToBuf  : (arr: Array<boolean>): Buffer => {
		const arrayByte: any = nTools.iterate(Array(8).fill(false, 0, 8), (el, idx) => arr[idx] ? 1 : 0, []);
		const byte = arrayByte.join('');
		return coderTools.int8UToBuf(parseInt(byte, 2));
	},
	hexToBinStr    : (val: string): string => {
		let i = 0, l = val.length - 1, bytes = [];
		for (i; i < l; i += 2) bytes.push(parseInt(val.substr(i, 2), 16));
		return String.fromCharCode.apply(String, bytes);
	},
	crc32
};

class DataEncoder {
	customs: Array<EncodeCustoms>;

	constructor() {
		this.customs = [];
	}

	use(id: number, detector: DetectorCallback, encode: EncodeCallback): void {
		this.customs.push({id, detector, encode});
	}

	encode(arg: any): Buffer {
		return encode(arg, this.customs);
	}
}

class DataDecoder {
	customs: IndexedObject;

	constructor() {
		this.customs = {};
	}

	use(id: number, detector: DetectorCallback, decode: DecodeCallback): void {
		this.customs[id] = {id, detector, decode};
	}

	decode(arg: Buffer | ArrayBuffer | SharedArrayBuffer): any {
		return decode(arg, this.customs);
	}
}

export class DataCoder {
	decoder: DataDecoder;
	encoder: DataEncoder;
	tools: typeof coderTools;
	nTools: typeof nTools;
	used: IndexedObject;

	constructor() {
		this.decoder = new DataDecoder();
		this.encoder = new DataEncoder();
		this.tools = coderTools;
		this.nTools = nTools;
		this.used = {};
	}

	use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void {
		this.used[id] = {detector, encode, decode};
		this.decoder.use(id, detector, decode);
		this.encoder.use(id, detector, encode);
	}

	getUsed(): IndexedObject {
		return this.used;
	}

	encode<T>(args: T): Buffer {
		return this.encoder.encode(args);
	}

	decode(args: Buffer | ArrayBuffer | SharedArrayBuffer): any {
		return this.decoder.decode(args);
	}
}

class SerializerProto {
	version: number;
	crc32: (buf: (Buffer | string | Uint8Array), previous?: number) => number;
	tools: typeof coderTools;
	used: IndexedObject;
	coder: DataCoder;

	constructor(coder: DataCoder) {
		this.version = 1;
		// @ts-ignore
		this.crc32 = crc32;
		this.tools = coderTools;
		this.used = {};

		this.coder = coder ? coder : new DataCoder();
	}

	use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void {
		this.used[id] = {detector, encode, decode};
		this.coder.use(id, detector, encode, decode);
	}

	getUsed(): IndexedObject {
		return this.used;
	}
}

class Serialize extends SerializerProto {
	constructor(coder: DataCoder) {
		super(coder);
	}

	_makePacket(version: number, data: Uint8Array): Buffer {
		return Buffer.concat([
			this.tools.int8UToBuf(version),
			this.tools.int32UToBuf(this.crc32(data)),
			data
		]);
	}

	serializeArray(val: Array<object>): Buffer {
		let keysHashes: { [index: string]: object } = {};

		nTools.iterate(val, (row: object, idx: number) => {
			if (!nTools.isObject(row)) throw {code: 1010, message: 'Array element is not an Object', row, idx};
			keysHashes[Object.keys(row).join('|')] = Object.keys(row);
		});

		const rows = nTools.iterate(val, (row) => [this.serialize(row, true), Object.keys(keysHashes).indexOf(Object.keys(row).join('|'))], []);
		const keys = nTools.iterate(keysHashes, (val) => val, []);
		const data = this.coder.encode([keys, rows]);

		return this._makePacket(this.version + 100, data);
	}

	serialize(val: any, noPacket = false): Buffer | Boolean {
		if (nTools.isArray(val)) {
			return this.serializeArray(val);
		}
		if (!nTools.isObject(val)) {
			return false;
		}

		const data = this.coder.encode(nTools.iterate(val, (row) => row, []));
		return !noPacket ? this._makePacket(this.version, data) : data;
	}
}

class Deserialize extends SerializerProto {
	schema: Array<any>;

	constructor(schema: Array<any>, coder: DataCoder) {
		super(coder);
		this.schema = schema;
	}

	_decodeVersion(val: Buffer | ArrayBuffer | SharedArrayBuffer): number {
		return this.tools.bufToInt8U(Buffer.from(val.slice(0, 1)));
	}

	_decode(val: Buffer | ArrayBuffer | SharedArrayBuffer, noProcess = false): any {
		if (noProcess) return this.coder.decode(val);

		const bufDecoded = Buffer.from(val.slice(5));
		const crcKeys = this.tools.bufToInt32U(Buffer.from(val.slice(1, 5)));
		if (crc32(bufDecoded) !== crcKeys) return false;

		return this.coder.decode(bufDecoded);
	}

	deserializeArray(val: Buffer | ArrayBuffer | SharedArrayBuffer): any {
		val = Buffer.isBuffer(val) ? val : Buffer.from(val);
		if (this._decodeVersion(val) !== this.version + 100) throw {code: 1020, message: 'Wrong packet version for deserializeArray'};

		const decoded = this._decode(val);
		if (!decoded) throw {code: 1022, message: 'Cant decode packet for deserializeArray'};

		const keyHashes = decoded[0];

		return nTools.iterate(decoded[1], (row) => this.deserialize(row[0], keyHashes[row[1]], true), []);
	}

	deserialize(val: Buffer | ArrayBuffer | SharedArrayBuffer, schema?: any, noProcess = false): any {
		schema = !!schema ? schema : this.schema;
		if (!Buffer.isBuffer(val)) val = Buffer.from(val);

		if (!noProcess) {
			const decodedVersion = this._decodeVersion(val);
			if (decodedVersion === this.version + 100) return this.deserializeArray(val);
			if (decodedVersion !== this.version) return false;
		}

		const decoded = this._decode(val, noProcess);
		if (!decoded) return false;

		if (!nTools.isArray(schema)) return decoded;
		if (schema.length !== decoded.length) return false;

		return nTools.iterate(schema, (key, idx, iter) => {
			iter.key(key);
			return decoded[idx];
		}, {});
	}
}

export class Serializer {
	coder: DataCoder;
	serializer: Serialize;
	deserializer: Deserialize;

	constructor(schema: any = false, coder?: DataCoder) {
		this.coder = !!coder ? coder : new DataCoder();
		this.serializer = new Serialize(this.coder);
		this.deserializer = new Deserialize(schema, this.coder);
	}

	use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void {
		this.coder.use(id, detector, encode, decode);
	}

	serialize(args: any): Buffer | Boolean {
		return this.serializer.serialize(args);
	}

	serializeArray(...args: Array<any>): Buffer {
		return this.serializer.serializeArray(args);
	}

	deserialize(args: Buffer | ArrayBuffer | SharedArrayBuffer, schema?: any): any {
		return this.deserializer.deserialize(args, schema);
	}

	deserializeArray(args: Buffer | ArrayBuffer | SharedArrayBuffer): any {
		return this.deserializer.deserializeArray(args);
	}

	encode(...args: Array<any>): Buffer {
		return this.coder.encode(args);
	}

	decode(args: Buffer | ArrayBuffer | SharedArrayBuffer): any {
		return this.coder.decode(args);
	}
}

export * as nTools from '@osmium/tools';
export {coderTools, _Buffer};

export const dataCoder = new DataCoder();
export const serializer = new Serializer();

export default {
	nTools, coderTools, dataCoder, serializer, DataCoder, Serializer, _Buffer
};
