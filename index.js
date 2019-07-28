const BaseX = require('./lib/base-x');
const oTools = require('osmium-tools');
const BigNumber = require('bignumber.js/bignumber.min');

const BASE_ALPHABETS = {
	BASE16: '0123456789abcdef',
	BASE32: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
	BASE36: '0123456789abcdefghijklmnopqrstuvwxyz',
	BASE58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
	BASE62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	BASE66: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~'
};

function makeWBuffer(int, name, length) {
	const buf = Buffer.alloc(length);
	buf[name](int);
	return buf;
}

function baseXEncode(what, base, ascii = false) {return BaseX(base).encode(Buffer.isBuffer(what) ? what : Buffer.from(what, ascii ? 'ascii' : 'utf8'));}

function baseXDecode(what, base, asBuffer = false, ascii = false) {
	const b = BaseX(base).decode(what);
	return asBuffer ? b : b.toString(ascii ? 'ascii' : 'utf8');
}


const tools = {
	BASE_ALPHABETS,
	BaseX,
	twoInt32toInt53: (val) => {
		const buffer = new ArrayBuffer(8);
		(new Uint32Array(buffer))[0] = val[0];
		(new Uint32Array(buffer))[1] = val[1];
		return new Float64Array(buffer)[0];
	},
	int53toTwoInt32: (val) => {
		const buf = new ArrayBuffer(8);
		(new Float64Array(buf))[0] = val;
		return [(new Uint32Array(buf))[0], (new Uint32Array(buf))[1]];
	},
	int8ToBuf      : (int) => makeWBuffer(int, 'writeInt8', 1),
	int8UToBuf     : (int) => makeWBuffer(int, 'writeUInt8', 1),
	int16ToBuf     : (int, be = false) => makeWBuffer(int, `writeInt16${be ? 'BE' : 'LE'}`, 2),
	int16UToBuf    : (int, be = false) => makeWBuffer(int, `writeUInt16${be ? 'BE' : 'LE'}`, 2),
	int32ToBuf     : (int, be = false) => makeWBuffer(int, `writeInt32${be ? 'BE' : 'LE'}`, 4),
	int32UToBuf    : (int, be = false) => makeWBuffer(int, `writeUInt32${be ? 'BE' : 'LE'}`, 4),
	intToBuf       : (int, len = 7, be = false) => Buffer.alloc(len)[`writeInt${be ? 'BE' : 'LE'}`](int, 0, len),
	floatToBuf     : (int, be = false) => makeWBuffer(int, `writeFloat${be ? 'BE' : 'LE'}`, 4),
	doubleToBuf    : (int, be = false) => makeWBuffer(int, `writeDouble${be ? 'BE' : 'LE'}`, 8),
	bufToInt8      : (buf, offset = 0) => buf.readInt8(offset),
	bufToInt8U     : (buf, offset = 0) => buf.readUInt8(offset),
	bufToInt16     : (buf, offset = 0, be = false) => buf[`readInt16${be ? 'BE' : 'LE'}`](offset),
	bufToInt16U    : (buf, offset = 0, be = false) => buf[`readUInt16${be ? 'BE' : 'LE'}`](offset),
	bufToInt32     : (buf, offset = 0, be = false) => buf[`readInt32${be ? 'BE' : 'LE'}`](offset),
	bufToInt32U    : (buf, offset = 0, be = false) => buf[`readUInt32${be ? 'BE' : 'LE'}`](offset),
	bufToInt       : (buf, len = 7, offset = 0, be = false) => buf[`readInt${be ? 'BE' : 'LE'}`](offset, len),
	bufToFloat     : (buf, offset = 0, be = false) => buf[`readFloat${be ? 'BE' : 'LE'}`](offset),
	bufToDouble    : (buf, offset = 0, be = false) => buf[`readDouble${be ? 'BE' : 'LE'}`](offset),
	pad            : (str, z = 8) => str.length < z ? tools.pad('0' + str, z) : str,
	bufToBinFlags  : (buf, offset) => tools.pad(tools.bufToInt8U(buf, offset).toString(2)).split('').map(r => r === '1'),
	binFlagsToBuf  : (arr) => tools.int8UToBuf(parseInt(oTools.iterate(Array(8).fill(false, 0, 8), (el, idx) => arr[idx] ? 1 : 0, []).join(''), 2))
};

oTools.iterate(BASE_ALPHABETS, (base, name) => {
	tools[`${name.toLowerCase()}Encode`] = (what) => baseXEncode(what, base);
	tools[`${name.toLowerCase()}Decode`] = (what, asBuffer = false) => baseXDecode(what, base, asBuffer);
});

class CoderConst {
	constructor() {
		this.tools = tools;
		this.type = {
			UNDEFINED  : 0,
			BINFLAGS   : 1,
			BOOLF      : 11,
			BOOLT      : 12,
			INT8       : 21,
			INT16      : 22,
			INT32      : 23,
			INT53      : 24,
			NINT8      : 31,
			NINT16     : 32,
			NINT32     : 33,
			NINT53     : 34,
			FLOAT      : 41,
			DOUBLE     : 42,
			STR8       : 51,
			STR16      : 52,
			STR32      : 53,
			STRA8      : 54,
			STRA16     : 55,
			STRA32     : 56,
			CHAR       : 59,
			BINARY8    : 91,
			BINARY16   : 92,
			BINARY32   : 93,
			OBJECT8    : 101,
			OBJECT16   : 101,
			OBJECT32   : 102,
			ARRAY8     : 111,
			ARRAY16    : 112,
			ARRAY32    : 113,
			DATE       : 121,
			BIGNUM     : 150,
			NULL       : 201,
			NAN        : 202,
			INFINITY   : 203,
			NINFINITY  : 204,
			CUSTOM8_8  : 211,
			CUSTOM8_16 : 212,
			CUSTOM8_32 : 213,
			CUSTOM16_8 : 214,
			CUSTOM16_16: 215,
			CUSTOM16_32: 216,
			CUSTOM32_8 : 217,
			CUSTOM32_16: 218,
			CUSTOM32_32: 219
		};
	}

	isBigNumber(val) {
		if (!oTools.isObject(val)) return false;
		if (oTools.isUndefined(val.s) || oTools.isUndefined(val.e) || !oTools.isArray(val.c)) return false;
		return val.toFixed && val.toPrecision && val.exponentiatedBy && val.minus;
	}

	isDate(date) {
		return date instanceof Date && !isNaN(date.valueOf());
	}

	isBinFlags(val) {
		if (!oTools.isArray(val) || val.length > 8 || val.length < 1) return false;
		let ret = true;
		oTools.iterate(val, (row) => { if (!oTools.isBoolean(row)) ret = false; });
		return ret;
	}

	isBuffer(val) {
		return Buffer.isBuffer(val) || (val && val.constructor && oTools.isFunction(val.constructor.toString) && !val.constructor.toString().indexOf('function Buffer'));
	}
}

class DataEncoder extends CoderConst {
	constructor() {
		super();
		this.customHandlers = [];
	}

	make(type, val) {
		try {
			let res = tools.int8UToBuf(type);
			if (!oTools.isUndefined(val)) res = Buffer.concat([res, val]);
			return res;
		} catch (e) {
			throw Error('Decoder error: make');
		}
	}

	registerCustom(id, encode, detector) {
		this.customHandlers.push({id, encode, detector});
	}

	custom(handler, val) {
		try {
			const _custom = (type, id) => {
				const msg = Buffer.from(handler.encode(val));
				const len = msg.length <= 0xff ? 8 : msg.length <= 0xffff ? 16 : msg.length <= 0xffffffff ? 32 : false;
				if (len === false) return;
				let cLen = tools[msg.length <= 0xff ? 'int8UToBuf' : msg.length <= 0xffff ? 'int16UToBuf' : 'int32UToBuf'](msg.length);

				return this.make(this.type[`CUSTOM${type}_${len}`], Buffer.concat([id, cLen, msg]));
			};

			if (oTools.isString(handler)) {
				handler = oTools.iterate(this.customHandlers, (el) => el.id === handler ? el : undefined, false);
			}
			if (handler.id <= 0xff) return _custom(8, tools.int8UToBuf(handler.id));
			if (handler.id <= 0xffff) return _custom(16, tools.int16UToBuf(handler.id));
			if (handler.id <= 0xffffffff) return _custom(32, tools.int32UToBuf(handler.id));
			return undefined;

		} catch (e) {
			throw Error(`Decoder error: custom [${handler.id}]`);
		}
	}

	auto(val) {
		const custom = oTools.iterate(this.customHandlers, (h) => h.detector(val) ? this.custom(h, val) : undefined, false);
		if (custom) return custom;

		if (this.isBigNumber(val) || oTools.isFloat(val) || oTools.isNumber(val) || val === Infinity || val === -Infinity) return this.int(val);
		if (this.isBuffer(val)) return this.bin(Buffer.from(val));
		if (oTools.isUndefined(val)) return this.undef();
		if (oTools.isBoolean(val)) return this.bool(val);
		if (oTools.isNull(val)) return this.nil();
		if (this.isDate(val)) return this.date(val);
		if (oTools.isString(val)) return this.str(val);
		if (oTools.isArray(val)) return this.arr(val);
		if (oTools.isObject(val)) return this.obj(val);

		throw Error('Decoder error: unknown type');
	}

	encode(val) {
		return this.auto(val);
	}

	date(val) {
		try {
			const int53arr = tools.int53toTwoInt32(val.getTime());
			return this.make(this.type.DATE, Buffer.concat([
				tools.int32UToBuf(int53arr[0]),
				tools.int32UToBuf(int53arr[1])
			]));
		} catch (e) {
			throw Error('Decoder error: date');
		}
	}

	nil() {
		return this.make(this.type.NULL);
	}

	nan() {
		return this.make(this.type.NAN);
	}

	undef() {
		return this.make(this.type.UNDEFINED);
	}

	infinity(negatvie = false) {
		return this.make(negatvie ? this.type.NINFINITY : this.type.INFINITY);
	}

	bin(val) {
		try {
			const _bin = (type, len, row) => this.make(type, Buffer.concat([len, row]));

			if (val.length <= 0xff) return _bin(this.type.BINARY8, tools.int8UToBuf(val.length), val);
			if (val.length <= 0xffff) return _bin(this.type.BINARY16, tools.int16UToBuf(val.length), val);
			return _bin(this.type.BINARY32, tools.int32UToBuf(val.length), val);
		} catch (e) {
			throw Error('Decoder error: bin');
		}
	}

	binFlags(val) {
		try {
			return this.make(this.type.BINFLAGS, this.tools.binFlagsToBuf(val));
		} catch (e) {
			throw Error('Decoder error: binFlags');
		}
	}

	obj(val) {
		try {
			const _obj = (type, len, rows) => this.make(type, Buffer.concat([len, ...rows]));

			const rows = oTools.iterate(val, (row, idx) => Buffer.concat([this.auto(idx), this.auto(row)]), []);
			const len = Object.keys(rows).length;

			if (len <= 0xff) return _obj(this.type.OBJECT8, tools.int8UToBuf(len), rows);
			if (len <= 0xffff) return _obj(this.type.OBJECT16, tools.int16UToBuf(len), rows);
			return _obj(this.type.OBJECT32, tools.int32UToBuf(len), rows);
		} catch (e) {
			throw Error('Decoder error: obj');
		}
	}

	arr(val) {
		try {
			const _arr = (type, len, rows) => this.make(type, Buffer.concat([len, ...rows]));

			const rows = oTools.iterate(val, (row) => this.auto(row), []);

			if (rows.length <= 0xff) return _arr(this.type.ARRAY8, tools.int8UToBuf(rows.length), rows);
			if (rows.length <= 0xffff) return _arr(this.type.ARRAY16, tools.int16UToBuf(rows.length), rows);
			return _arr(this.type.ARRAY32, tools.int32UToBuf(rows.length), rows);
		} catch (e) {
			throw Error('Decoder error: arr');
		}
	}

	bool(val) {
		return this.make(!!val ? this.type.BOOLT : this.type.BOOLF);
	}

	char(val) {
		try {
			if (!oTools.isString(val) || !val) return false;
			return this.make(this.type.CHAR, Buffer.from(val[0], 'ascii'));
		} catch (e) {
			throw Error('Decoder error: char');
		}
	}

	str(val, ascii = false) {
		try {
			const _make = (stype, blen, bstr) => {
				return this.make(stype, Buffer.concat([Buffer.from(blen), bstr]));
			};

			const str = Buffer.from(val, ascii ? 'ascii' : 'utf8');

			if (str.length <= 0xff) return _make(ascii ? this.type.STRA8 : this.type.STR8, tools.int8UToBuf(str.length), str);
			if (str.length <= 0xffff) return _make(ascii ? this.type.STRA16 : this.type.STR16, tools.int16UToBuf(str.length), str);
			return _make(ascii ? this.type.STRA32 : this.type.STR32, tools.int32UToBuf(str.length), str);
		} catch (e) {
			throw Error('Decoder error: str');
		}
	}

	int(val) {
		try {
			const _toBigNum = (bnInst) => {
				const bigNumStr = bnInst.toString();
				return this.make(this.type.BIGNUM, Buffer.concat([tools.int8UToBuf(bigNumStr.length), Buffer.from(bigNumStr, 'ascii')]));
			};

			if (isNaN(val)) return this.nan();
			if (val === Infinity) return this.infinity();
			if (val === -Infinity) return this.infinity(true);
			if (this.isBigNumber(val)) return _toBigNum(val);
			if (oTools.isString(val)) return _toBigNum(new BigNumber(val));
			if (oTools.isFloat(val)) return this.make(this.type.DOUBLE, tools.doubleToBuf(val));
			let negative = false;
			if (!oTools.isPositiveInteger(val)) negative = true;
			val = negative ? val * -1 : val;
			if (val <= 0xff) return this.make(negative ? this.type.NINT8 : this.type.INT8, tools.int8UToBuf(val));
			if (val <= 0xffff) return this.make(negative ? this.type.NINT16 : this.type.INT16, tools.int16UToBuf(val));
			if (val <= 0xffffffff) return this.make(negative ? this.type.NINT32 : this.type.INT32, tools.int32UToBuf(val));
			if (val <= Number.MAX_SAFE_INTEGER) {
				const int53arr = tools.int53toTwoInt32(val);
				return this.make(negative ? this.type.NINT53 : this.type.INT53, Buffer.concat([
					tools.int32UToBuf(int53arr[0]),
					tools.int32UToBuf(int53arr[1])
				]));
			}
			return _toBigNum(new BigNumber(val));
		} catch (e) {
			throw Error('Decoder error: int');
		}
	}
}

class DataDecoder extends CoderConst {
	constructor() {
		super();
		this.customHandlers = [];
	}

	decode(msg) {
		return this.decodeWLen(msg)[0];
	}

	extract(msg, start, end) {
		return Buffer.from(msg.subarray(start, end));
	}

	registerCustom(id, decode) {
		this.customHandlers.push({id, decode});
	}

	decodeWLen(msg) {
		msg = Buffer.from(msg);
		const type = tools.bufToInt8U(msg);
		switch (type) {
			case this.type.UNDEFINED:
				return [undefined, 1];

			case this.type.NULL:
				return [null, 1];

			case this.type.BOOLF:
				return [false, 1];

			case this.type.BOOLT:
				return [true, 1];

			case this.type.BINFLAGS:
				return [tools.bufToBinFlags(this.extract(msg, 1, 2)), 2];

			case this.type.BINARY8:
				const bin8len = tools.bufToInt8U(msg, 1) + 2;
				return [this.extract(msg, 2, bin8len), bin8len];

			case this.type.BINARY16:
				const bin16len = tools.bufToInt16U(msg, 1) + 3;
				return [this.extract(msg, 3, bin16len), bin16len];

			case this.type.BINARY32:
				const bin32len = tools.bufToInt32U(msg, 1) + 5;
				return [this.extract(msg, 5, bin32len), bin32len];

			case this.type.NINT8:
			case this.type.INT8:
				return [tools.bufToInt8U(msg, 1) * (type === this.type.NINT8 ? -1 : 1), 2];

			case this.type.NINT16:
			case this.type.INT16:
				return [tools.bufToInt16U(msg, 1) * (type === this.type.NINT16 ? -1 : 1), 3];

			case this.type.NINT32:
			case this.type.INT32:
				return [tools.bufToInt32U(msg, 1) * (type === this.type.NINT32 ? -1 : 1), 5];

			case this.type.NINT53:
			case this.type.INT53:
				return [tools.twoInt32toInt53([tools.bufToInt32U(msg, 1), tools.bufToInt32U(msg, 5)]) * (type === this.type.NINT53 ? -1 : 1), 9];

			case this.type.FLOAT:
				return [tools.bufToFloat(msg, 1), 5];

			case this.type.DOUBLE:
				return [tools.bufToDouble(msg, 1), 9];

			case this.type.STRA8:
			case this.type.STR8:
				const str8len = tools.bufToInt8U(msg, 1) + 2;
				return [this.extract(msg, 2, str8len).toString(type === this.type.STRA8 ? 'ascii' : 'utf8'), str8len];

			case this.type.STRA16:
			case this.type.STR16:
				const str16len = tools.bufToInt16U(msg, 1) + 3;
				return [this.extract(msg, 3, str16len).toString(type === this.type.STRA16 ? 'ascii' : 'utf8'), str16len];

			case this.type.STRA32:
			case this.type.STR32:
				const str32len = tools.bufToInt32U(msg, 1) + 5;
				return [this.extract(msg, 5, str32len).toString(type === this.type.STRA32 ? 'ascii' : 'utf8'), str32len];

			case this.type.CHAR:
				return [this.extract(msg, 1, 2).toString('ascii'), 2];

			case this.type.BIGNUM:
				const bnlen = tools.bufToInt8U(msg, 1) + 2;
				return [new BigNumber((this.extract(msg, 2, bnlen)).toString('ascii')), bnlen];

			case this.type.NAN:
				return [NaN, 1];

			case this.type.INFINITY:
			case this.type.NINFINITY:
				return [type === this.type.INFINITY ? Infinity : -Infinity, 1];

			case this.type.DATE:
				return [new Date(tools.twoInt32toInt53([tools.bufToInt32U(msg, 1), tools.bufToInt32U(msg, 5)])), 9];

			case this.type.ARRAY8:
			case this.type.ARRAY16:
			case this.type.ARRAY32:
				let alen = 1 + ((type === this.type.ARRAY8) ? 1 : type === this.type.ARRAY16 ? 2 : 4);
				const aret = oTools.iterate(
					tools[(type === this.type.ARRAY8) ? 'bufToInt8U' : type === this.type.ARRAY16 ? 'bufToInt16U' : 'bufToInt32U'](msg, 1), () => {
						const decoded = this.decodeWLen(this.extract(msg, alen, msg.length));
						alen += decoded[1];
						return decoded[0];
					}, []);
				return [aret, alen];

			case this.type.OBJECT8:
			case this.type.OBJECT16:
			case this.type.OBJECT32:
				let olen = 1 + ((type === this.type.OBJECT8) ? 1 : type === this.type.OBJECT16 ? 2 : 4);
				const oret = oTools.iterate(
					tools[(type === this.type.OBJECT8) ? 'bufToInt8U' : type === this.type.OBJECT16 ? 'bufToInt16U' : 'bufToInt32U'](msg, 1), (_, __, iter) => {
						const key = this.decodeWLen(this.extract(msg, olen, msg.length));
						olen += key[1];
						const val = this.decodeWLen(this.extract(msg, olen, msg.length));
						olen += val[1];
						iter.key(key[0]);
						return val[0];
					}, {});
				return [oret, olen];

			case this.type.CUSTOM8_8:
			case this.type.CUSTOM8_16:
			case this.type.CUSTOM8_32:
			case this.type.CUSTOM16_8:
			case this.type.CUSTOM16_16:
			case this.type.CUSTOM16_32:
			case this.type.CUSTOM32_8:
			case this.type.CUSTOM32_16:
			case this.type.CUSTOM32_32:
				let cType = oTools.iterate(this.type, (val, idx) => val === type ? idx : undefined, false);
				let cIdLen = !!~cType.indexOf('CUSTOM8') ? 1 : !!~cType.indexOf('CUSTOM16') ? 2 : 4;
				let cDataLen = !!~cType.indexOf('_8') ? 1 : !!~cType.indexOf('_16') ? 2 : 4;
				let cId = tools[(!!~cType.indexOf('CUSTOM8')) ? 'bufToInt8U' : !!~cType.indexOf('CUSTOM16') ? 'bufToInt16U' : 'bufToInt32U'](msg, 1);
				let cLen = tools[(!!~cType.indexOf('_8')) ? 'bufToInt8U' : !!~cType.indexOf('_16') ? 'bufToInt16U' : 'bufToInt32U'](msg, 1 + cIdLen);
				let cMsg = this.extract(msg, 1 + cIdLen + cDataLen, 1 + cIdLen + cDataLen + cLen);
				return [oTools.iterate(this.customHandlers, (row) => row.id === cId ? row.decode(cMsg) : undefined, false), 1 + cIdLen + cDataLen + cLen];

			default:
				return [undefined, 0];
		}
	}
}

class DataCoder {
	constructor() {
		this.decoder = new DataDecoder();
		this.encoder = new DataEncoder();
		this.tools = tools;
		this.oTools = oTools;
	}

	use(id, decode, encode, detector) {
		this.decoder.registerCustom(id, decode);
		this.encoder.registerCustom(id, encode, detector);
	}
}

module.exports = {
	DataEncoder,
	DataDecoder,
	DataCoder,
	dataCoder: new DataCoder(),
	oTools,
	tools
};
