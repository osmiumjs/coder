'use strict';

const TYPE = require('./types');
const MICRO_OPT_LEN = 32;

function utf8Write(arr, offset, str) {
	let c = 0;
	for (let i = 0, l = str.length; i < l; i++) {
		c = str.charCodeAt(i);
		if (c < 0x80) {
			arr[offset++] = c;
		} else if (c < 0x800) {
			arr[offset++] = 0xc0 | (c >> 6);
			arr[offset++] = 0x80 | (c & 0x3f);
		} else if (c < 0xd800 || c >= 0xe000) {
			arr[offset++] = 0xe0 | (c >> 12);
			arr[offset++] = 0x80 | (c >> 6) & 0x3f;
			arr[offset++] = 0x80 | (c & 0x3f);
		} else {
			i++;
			c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
			arr[offset++] = 0xf0 | (c >> 18);
			arr[offset++] = 0x80 | (c >> 12) & 0x3f;
			arr[offset++] = 0x80 | (c >> 6) & 0x3f;
			arr[offset++] = 0x80 | (c & 0x3f);
		}
	}
}

function utf8Length(str) {
	let c = 0, length = 0;
	for (let i = 0, l = str.length; i < l; i++) {
		c = str.charCodeAt(i);
		if (c < 0x80) {
			length += 1;
		} else if (c < 0x800) {
			length += 2;
		} else if (c < 0xd800 || c >= 0xe000) {
			length += 3;
		} else {
			i++;
			length += 4;
		}
	}
	return length;
}

function _encode(bytes, defers, value, customs = []) {
	let hi = 0, lo = 0, length = 0, size = 0;

	for (let custom of customs) {
		if (typeof custom.detector !== 'function') continue;
		if (!custom.detector(value)) continue;

		value = custom.encode(value);
		if (!(value instanceof Buffer)) {
			throw new Error('Custom encode: encoded value not Buffer');
		}

		length = value.length;

		if (length <= 0xff) {
			bytes.push(TYPE.CUSTOM8, length, custom.id);
			size = 3;
		} else if (length <= 0xffff) {
			bytes.push(TYPE.CUSTOM16, length, length >> 8, custom.id);
			size = 4;
		} else if (length <= 0xffffffff) {
			bytes.push(TYPE.CUSTOM32, length, length >> 8, length >> 16, length >> 24, custom.id);
			size = 6;
		} else {
			throw new Error('Custom too large');
		}

		defers.push({bin: value, length: length, offset: bytes.length});
		return size + length;
	}

	switch (typeof value) {
		case 'string':
			length = value.length > MICRO_OPT_LEN ? Buffer.byteLength(value) : utf8Length(value);

			if (length <= 0xff) {
				bytes.push(TYPE.STR8, length);
				size = 2;
			} else if (length <= 0xffff) {
				bytes.push(TYPE.STR16, length, length >> 8);
				size = 3;
			} else if (length <= 0xffffffff) {
				bytes.push(TYPE.STR32, length, length >> 8, length >> 16, length >> 24);
				size = 5;
			} else {
				throw new Error('String too long');
			}
			defers.push({str: value, length: length, offset: bytes.length});
			return size + length;

		case 'number':
			if (value === 0) {
				bytes.push(TYPE.ZERO);
				return 1;
			}
			if (value === Infinity) {
				bytes.push(TYPE.INFINITY);
				return 1;
			}
			if (value === -Infinity) {
				bytes.push(TYPE.NINFINITY);
				return 1;
			}
			if (isNaN(value)) {
				bytes.push(TYPE.NAN);
				return 1;
			}

			if (Math.floor(value) !== value || !isFinite(value)) {
				bytes.push(TYPE.DOUBLE);
				defers.push({float: value, length: 8, offset: bytes.length});
				return 9;
			}

			if (value >= 0) {
				if (value <= 0xff) {
					bytes.push(TYPE.UINT8, value);
					return 2;
				}

				if (value <= 0xffff) {
					bytes.push(TYPE.UINT16, value, value >> 8);
					return 3;
				}

				if (value <= 0xffffffff) {
					bytes.push(TYPE.UINT32, value, value >> 8, value >> 16, value >> 24);
					return 5;
				}

				if (value <= Number.MAX_SAFE_INTEGER) {
					//UINT64
					hi = (value / Math.pow(2, 32)) >> 0;
					lo = value >>> 0;

					bytes.push(TYPE.UINT53, lo, lo >> 8, lo >> 16, lo >> 24, hi, hi >> 8, hi >> 16, hi >> 24);
					return 9;
				} else {
					throw new Error('Integer too long');
				}
			} else {
				if (value >= -0xff) {
					value = value * -1;
					bytes.push(TYPE.NUINT8, value);
					return 2;
				}

				if (value >= -0xffff) {
					value = value * -1;
					bytes.push(TYPE.NUINT16, value, value >> 8);
					return 3;
				}

				if (value >= -0xffffffff) {
					value = value * -1;
					bytes.push(TYPE.NUINT32, value, value >> 8, value >> 16, value >> 24);
					return 5;
				}

				if (Number.MIN_SAFE_INTEGER >= value) {
					value = value * -1;
					lo = value >>> 0;
					hi = (value / Math.pow(2, 32)) >> 0;

					bytes.push(TYPE.NUINT53, lo, lo >> 8, lo >> 16, lo >> 24, hi, hi >> 8, hi >> 16, hi >> 24);
					return 9;
				} else {
					throw new Error('Negative integer too long');
				}
			}

		case 'object':
			//NULL
			if (value === null) {
				bytes.push(TYPE.NULL);
				return 1;
			}

			if (Array.isArray(value)) {
				length = value.length;

				if (length <= 0xff) {
					bytes.push(TYPE.ARRAY8, length);
					size = 2;
				} else if (length <= 0xffff) {
					bytes.push(TYPE.ARRAY16, length, length >> 8);
					size = 3;
				} else if (length <= 0xffffffff) {
					bytes.push(TYPE.ARRAY32, length, length >> 8, length >> 16, length >> 24);
					size = 5;
				} else {
					throw new Error('Array too large');
				}
				for (let i = 0; i < length; i++) {
					size += _encode(bytes, defers, value[i], customs);
				}
				return size;
			}

			if (value instanceof Date) {
				const time = value.getTime();
				hi = Math.floor(time / Math.pow(2, 32));
				lo = time >>> 0;

				bytes.push(TYPE.DATE, lo, lo >> 8, lo >> 16, lo >> 24, hi, hi >> 8, hi >> 16, hi >> 24);
				return 9;
			}

			if (value instanceof Buffer) {
				length = value.length;

				if (length <= 0xff) {
					bytes.push(TYPE.BUFFER8, length);
					size = 2;
				} else if (length <= 0xffff) {
					bytes.push(TYPE.BUFFER16, length, length >> 8);
					size = 3;
				} else if (length <= 0xffffffff) {
					bytes.push(TYPE.BUFFER32, length, length >> 8, length >> 16, length >> 24);
					size = 5;
				} else {
					throw new Error('Buffer too large');
				}

				defers.push({bin: value, length: length, offset: bytes.length});
				return size + length;
			}

			if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
				const arraybuffer = value.buffer || value;
				length = arraybuffer.byteLength;

				if (length <= 0xff) {
					bytes.push(TYPE.ARRAYBUFFER8, length, 0);
					size = 3;
				} else if (length <= 0xffff) {
					bytes.push(TYPE.ARRAYBUFFER16, length, length >> 8, 0);
					size = 4;
				} else if (length <= 0xffffffff) {
					bytes.push(TYPE.ARRAYBUFFER32, length, length >> 8, length >> 16, length >> 24, 0);
					size = 6;
				} else {
					throw new Error('ArrayBuffer too large');
				}
				defers.push({arraybuffer: arraybuffer, length: length, offset: bytes.length});
				return size + length;
			}

			if (typeof value.toJSON === 'function') {
				return _encode(bytes, defers, value.toJSON(), customs);
			}

			const
				keys = [],
				allKeys = Object.keys(value);
			let key = '';

			for (let i = 0, l = allKeys.length; i < l; i++) {
				key = allKeys[i];
				if (typeof value[key] !== 'function') {
					keys.push(key);
				}
			}
			length = keys.length;

			if (length <= 0xff) {
				bytes.push(TYPE.OBJECT8, length);
				size = 2;
			} else if (length <= 0xffff) {
				bytes.push(TYPE.OBJECT16, length, length >> 8);
				size = 3;
			} else if (length <= 0xffffffff) {
				bytes.push(TYPE.OBJECT32, length, length >> 8, length >> 16, length >> 24);
				size = 5;
			} else {
				throw new Error('Object too large');
			}

			for (let i = 0; i < length; i++) {
				key = keys[i];
				size += _encode(bytes, defers, key, customs);
				size += _encode(bytes, defers, value[key], customs);
			}
			return size;

		case 'boolean':
			bytes.push(value ? TYPE.TRUE : TYPE.FALSE);
			return 1;

		case 'undefined':
			bytes.push(TYPE.UNDEFINED);
			return 1;

		default:
			throw new Error('Could not encode');
	}
}

function encode(value, customs = []) {
	const
		bytes = [],
		defers = [],
		size = _encode(bytes, defers, value, customs);
	const buf = Buffer.allocUnsafe(size);

	let deferIndex = 0,
		deferWritten = 0,
		nextOffset = -1;

	if (defers.length > 0) {
		nextOffset = defers[0].offset;
	}

	let defer,
		deferLength = 0,
		offset = 0;
	for (let i = 0, l = bytes.length; i < l; i++) {
		buf[deferWritten + i] = bytes[i];
		if (i + 1 !== nextOffset) continue;

		defer = defers[deferIndex];
		deferLength = defer.length;
		offset = deferWritten + nextOffset;
		if (defer.bin) {
			if (deferLength > MICRO_OPT_LEN) {
				defer.bin.copy(buf, offset, 0, deferLength);
			} else {
				const bin = defer.bin;
				for (let j = 0; j < deferLength; j++) {
					buf[offset + j] = bin[j];
				}
			}
		} else if (defer.str) {
			if (deferLength > MICRO_OPT_LEN) {
				buf.write(defer.str, offset, deferLength, 'utf8');
			} else {
				utf8Write(buf, offset, defer.str);
			}
		} else if (defer.float !== undefined) {
			buf.writeDoubleLE(defer.float, offset);
		} else if (defer.arraybuffer) {
			const arr = new Uint8Array(defer.arraybuffer);
			for (let k = 0; k < deferLength; k++) {
				buf[offset + k] = arr[k];
			}
		}

		deferIndex++;
		deferWritten += deferLength;
		if (defers[deferIndex]) {
			nextOffset = defers[deferIndex].offset;
		}
	}
	return buf;
}

module.exports = encode;
