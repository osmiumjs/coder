export class NumericConversion {
	static makeWBuffer(cb: (arg: Buffer) => void, length: number): Buffer {
		const buf = Buffer.alloc(length);
		cb(buf);
		return buf;
	}

	// 32-bit to 53-bit conversion
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

	// Number to Buffer conversions
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

	// Buffer to Number conversions
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

	// BigInt 64-bit helpers
	static bigIntToBuf(bigint: bigint, be = false): Buffer {
		const buf = Buffer.allocUnsafe(8);
		if (be) {
			buf.writeBigInt64BE(bigint, 0);
		} else {
			buf.writeBigInt64LE(bigint, 0);
		}
		return buf;
	}

	static bigIntUToBuf(bigint: bigint, be = false): Buffer {
		const buf = Buffer.allocUnsafe(8);
		if (be) {
			buf.writeBigUInt64BE(bigint, 0);
		} else {
			buf.writeBigUInt64LE(bigint, 0);
		}
		return buf;
	}

	static bufToBigInt(buf: Buffer, offset = 0, be = false): bigint {
		return be ? buf.readBigInt64BE(offset) : buf.readBigInt64LE(offset);
	}

	static bufToBigIntU(buf: Buffer, offset = 0, be = false): bigint {
		return be ? buf.readBigUInt64BE(offset) : buf.readBigUInt64LE(offset);
	}

	// Timestamp helpers (seconds, 32-bit)
	static timestampToBuf(timestamp: number = Date.now(), be = false): Buffer {
		return this.int32UToBuf(Math.floor(timestamp / 1000), be);
	}

	static bufToTimestamp(buf: Buffer, offset = 0, be = false): number {
		return this.bufToInt32U(buf, offset, be) * 1000;
	}
}
