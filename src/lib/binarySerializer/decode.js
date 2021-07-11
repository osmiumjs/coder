'use strict';

const TYPE = require('./types');

function Decoder(buffer) {
	this.offset = 0;
	/**
	 * @type Buffer
	 */
	this.buffer = buffer;
}

Decoder.prototype.array = function (length, customs) {
	const value = new Array(length);
	for (let i = 0; i < length; i++) {
		value[i] = this.parse(customs);
	}
	return value;
};

Decoder.prototype.map = function (length, customs) {
	let key = '', value = {};
	for (let i = 0; i < length; i++) {
		key = this.parse(customs);
		value[key] = this.parse(customs);
	}
	return value;
};

Decoder.prototype.str = function (length) {
	const value = this.buffer.toString('utf8', this.offset, this.offset + length);
	this.offset += length;
	return value;
};

Decoder.prototype.bin = function (length) {
	const value = this.buffer.slice(this.offset, this.offset + length);
	this.offset += length;
	return value;
};

Decoder.prototype.arraybuffer = function (length) {
	const buffer = new ArrayBuffer(length);
	const view = new Uint8Array(buffer);
	for (let j = 0; j < length; j++) {
		view[j] = this.buffer[this.offset + j];
	}
	this.offset += length;
	return buffer;
};


function decodeCustom(customs, id, value) {
	if (!customs[id]) throw new Error('Decoder error - custom - unknown typeId ' + id);

	return customs[id].decode(value);
}

Decoder.prototype.parse = function (customs = {}) {
	const prefix = this.buffer[this.offset++];
	let value, length = 0, type = 0, hi = 0, lo = 0;

	switch (prefix) {
		case TYPE.UNDEFINED:
			return undefined;
		case TYPE.NULL:
			return null;
		case TYPE.ZERO:
			return 0;
		case TYPE.FALSE:
			return false;
		case TYPE.TRUE:
			return true;
		case TYPE.INFINITY:
			return Infinity;
		case TYPE.NINFINITY:
			return -Infinity;
		case TYPE.NAN:
			return NaN;

		case TYPE.BUFFER8:
			length = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return this.bin(length);
		case TYPE.BUFFER16:
			length = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return this.bin(length);
		case TYPE.BUFFER32:
			length = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return this.bin(length);

		case TYPE.CUSTOM8:
			length = this.buffer.readUInt8(this.offset);

			this.offset += 2;
			return decodeCustom(customs, this.buffer.readUInt8(this.offset - 1), this.bin(length));
		case TYPE.CUSTOM16:
			length = this.buffer.readUInt16LE(this.offset);

			this.offset += 3;
			return decodeCustom(customs, this.buffer.readUInt8(this.offset - 1), this.bin(length));
		case TYPE.CUSTOM32:
			length = this.buffer.readUInt32LE(this.offset);

			this.offset += 5;
			return decodeCustom(customs, this.buffer.readUInt8(this.offset - 1), this.bin(length));

		case TYPE.ARRAYBUFFER8:
			length = this.buffer.readUInt8(this.offset);
			type = this.buffer.readInt8(this.offset + 1);
			this.offset += 2;
			return type === 0 ? this.arraybuffer(length) : [type, this.bin(length)];
		case TYPE.ARRAYBUFFER16:
			length = this.buffer.readUInt16LE(this.offset);
			type = this.buffer.readInt8(this.offset + 2);
			this.offset += 3;
			return type === 0 ? this.arraybuffer(length) : [type, this.bin(length)];
		case TYPE.ARRAYBUFFER32:
			length = this.buffer.readUInt32LE(this.offset);
			type = this.buffer.readInt8(this.offset + 4);
			this.offset += 5;
			return type === 0 ? this.arraybuffer(length) : [type, this.bin(length)];

		case TYPE.FLOAT:
			value = this.buffer.readFloatLE(this.offset);
			this.offset += 4;
			return value;
		case TYPE.DOUBLE:
			value = this.buffer.readDoubleLE(this.offset);
			this.offset += 8;
			return value;

		case TYPE.UINT8:
			value = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return value;
		case TYPE.UINT16:
			value = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return value;
		case TYPE.UINT32:
			value = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return value;
		case TYPE.UINT53:
			lo = this.buffer.readUInt32LE(this.offset);
			hi = this.buffer.readUInt32LE(this.offset + 4) * Math.pow(2, 32);
			this.offset += 8;
			return hi + lo;

		case TYPE.NUINT8:
			value = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return value * -1;
		case TYPE.NUINT16:
			value = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return value * -1;
		case TYPE.NUINT32:
			value = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return value * -1;
		case TYPE.NUINT53:
			lo = this.buffer.readUInt32LE(this.offset);
			hi = this.buffer.readUInt32LE(this.offset + 4) * Math.pow(2, 32);
			this.offset += 8;
			return (hi + lo) * -1;

		case TYPE.DATE:
			type = this.buffer.readInt8(this.offset);

			lo = this.buffer.readUInt32LE(this.offset);
			hi = this.buffer.readUInt32LE(this.offset + 4) * Math.pow(2, 32);
			this.offset += 8;
			return new Date(hi + lo);

		case TYPE.STR8:
			length = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return this.str(length);
		case TYPE.STR16:
			length = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return this.str(length);
		case TYPE.STR32:
			length = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return this.str(length);

		case TYPE.ARRAY8:
			length = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return this.array(length, customs);
		case TYPE.ARRAY16:
			length = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return this.array(length, customs);
		case TYPE.ARRAY32:
			length = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return this.array(length, customs);

		case TYPE.OBJECT8:
			length = this.buffer.readUInt8(this.offset);
			this.offset += 1;
			return this.map(length, customs);
		case TYPE.OBJECT16:
			length = this.buffer.readUInt16LE(this.offset);
			this.offset += 2;
			return this.map(length, customs);
		case TYPE.OBJECT32:
			length = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return this.map(length, customs);
	}

	throw new Error('Could not parse');
};

function decode(buffer, customs) {
	const decoder = new Decoder(buffer);
	const value = decoder.parse(customs);
	if (decoder.offset !== buffer.length) {
		throw new Error((buffer.length - decoder.offset) + ' trailing bytes');
	}
	return value;
}

module.exports = decode;
