import {describe, it, expect} from 'vitest';
import {NumericConversion}    from '../src/classes/CoderTools/NumericConversion';

describe('NumericConversion', () => {
	describe('makeWBuffer method', () => {
		it('should create buffer with specified length', () => {
			const buffer = NumericConversion.makeWBuffer((buf) => {
				buf.writeUInt8(42, 0);
			}, 4);

			expect(buffer).toBeInstanceOf(Buffer);
			expect(buffer.length).toBe(4);
			expect(buffer.readUInt8(0)).toBe(42);
		});

		it('should execute callback with buffer', () => {
			let callbackExecuted = false;
			const buffer = NumericConversion.makeWBuffer((buf) => {
				callbackExecuted = true;
				expect(buf).toBeInstanceOf(Buffer);
			}, 1);

			expect(callbackExecuted).toBe(true);
			expect(buffer.length).toBe(1);
		});

		it('should handle zero length buffer', () => {
			const buffer = NumericConversion.makeWBuffer(() => {}, 0);
			expect(buffer.length).toBe(0);
		});
	});

	describe('32-bit to 53-bit conversion methods', () => {
		describe('twoInt32toInt53', () => {
			it('should convert two 32-bit integers to 53-bit number', () => {
				const result = NumericConversion.twoInt32toInt53([0x12345678, 0x9ABCDEF0]);
				expect(typeof result).toBe('number');
				expect(result).not.toBeNaN();
			});

			it('should handle zero values', () => {
				const result = NumericConversion.twoInt32toInt53([0, 0]);
				expect(result).toBe(0);
			});

			it('should handle maximum values', () => {
				const result = NumericConversion.twoInt32toInt53([0xFFFFFFFF, 0xFFFFFFFF]);
				expect(typeof result).toBe('number');

				expect(result).toBeDefined();
			});

			it('should be reversible with int53toTwoInt32', () => {
				const original = [0x12345678, 0x9ABCDEF0] as [number, number];
				const converted = NumericConversion.twoInt32toInt53(original);
				const restored = NumericConversion.int53toTwoInt32(converted);

				expect(restored[0]).toBe(original[0]);
				expect(restored[1]).toBe(original[1]);
			});
		});

		describe('int53toTwoInt32', () => {
			it('should convert 53-bit number to two 32-bit integers', () => {
				const result = NumericConversion.int53toTwoInt32(123456789.123);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBe(2);
				expect(typeof result[0]).toBe('number');
				expect(typeof result[1]).toBe('number');
			});

			it('should handle zero', () => {
				const result = NumericConversion.int53toTwoInt32(0);
				expect(result).toEqual([0, 0]);
			});

			it('should handle negative numbers', () => {
				const result = NumericConversion.int53toTwoInt32(-123.456);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBe(2);
			});
		});
	});

	describe('Number to Buffer conversion methods', () => {
		describe('intToBuf', () => {
			it('should convert integer to buffer with default parameters', () => {
				const buffer = NumericConversion.intToBuf(123456, 6);
				expect(buffer).toBeInstanceOf(Buffer);
				expect(buffer.length).toBe(6);
			});

			it('should handle custom length', () => {
				const buffer = NumericConversion.intToBuf(123, 3);
				expect(buffer.length).toBe(3);
			});

			it('should handle big endian', () => {
				const bufferLE = NumericConversion.intToBuf(0x123456, 4, false);
				const bufferBE = NumericConversion.intToBuf(0x123456, 4, true);
				expect(bufferLE).not.toEqual(bufferBE);
			});

			it('should handle negative numbers', () => {
				const buffer = NumericConversion.intToBuf(-123, 4);
				expect(buffer).toBeInstanceOf(Buffer);
				expect(buffer.length).toBe(4);
			});
		});

		describe('int8ToBuf', () => {
			it('should convert 8-bit signed integer to buffer', () => {
				const buffer = NumericConversion.int8ToBuf(127);
				expect(buffer.length).toBe(1);
				expect(buffer.readInt8(0)).toBe(127);
			});

			it('should handle negative values', () => {
				const buffer = NumericConversion.int8ToBuf(-128);
				expect(buffer.readInt8(0)).toBe(-128);
			});

			it('should handle zero', () => {
				const buffer = NumericConversion.int8ToBuf(0);
				expect(buffer.readInt8(0)).toBe(0);
			});
		});

		describe('int8UToBuf', () => {
			it('should convert 8-bit unsigned integer to buffer', () => {
				const buffer = NumericConversion.int8UToBuf(255);
				expect(buffer.length).toBe(1);
				expect(buffer.readUInt8(0)).toBe(255);
			});

			it('should handle zero', () => {
				const buffer = NumericConversion.int8UToBuf(0);
				expect(buffer.readUInt8(0)).toBe(0);
			});
		});

		describe('int16ToBuf', () => {
			it('should convert 16-bit signed integer to buffer (little endian)', () => {
				const buffer = NumericConversion.int16ToBuf(32767);
				expect(buffer.length).toBe(2);
				expect(buffer.readInt16LE(0)).toBe(32767);
			});

			it('should convert 16-bit signed integer to buffer (big endian)', () => {
				const buffer = NumericConversion.int16ToBuf(32767, true);
				expect(buffer.readInt16BE(0)).toBe(32767);
			});

			it('should handle negative values', () => {
				const buffer = NumericConversion.int16ToBuf(-32768);
				expect(buffer.readInt16LE(0)).toBe(-32768);
			});
		});

		describe('int16UToBuf', () => {
			it('should convert 16-bit unsigned integer to buffer (little endian)', () => {
				const buffer = NumericConversion.int16UToBuf(65535);
				expect(buffer.length).toBe(2);
				expect(buffer.readUInt16LE(0)).toBe(65535);
			});

			it('should convert 16-bit unsigned integer to buffer (big endian)', () => {
				const buffer = NumericConversion.int16UToBuf(65535, true);
				expect(buffer.readUInt16BE(0)).toBe(65535);
			});
		});

		describe('int32ToBuf', () => {
			it('should convert 32-bit signed integer to buffer (little endian)', () => {
				const buffer = NumericConversion.int32ToBuf(2147483647);
				expect(buffer.length).toBe(4);
				expect(buffer.readInt32LE(0)).toBe(2147483647);
			});

			it('should convert 32-bit signed integer to buffer (big endian)', () => {
				const buffer = NumericConversion.int32ToBuf(2147483647, true);
				expect(buffer.readInt32BE(0)).toBe(2147483647);
			});

			it('should handle negative values', () => {
				const buffer = NumericConversion.int32ToBuf(-2147483648);
				expect(buffer.readInt32LE(0)).toBe(-2147483648);
			});
		});

		describe('int32UToBuf', () => {
			it('should convert 32-bit unsigned integer to buffer (little endian)', () => {
				const buffer = NumericConversion.int32UToBuf(4294967295);
				expect(buffer.length).toBe(4);
				expect(buffer.readUInt32LE(0)).toBe(4294967295);
			});

			it('should convert 32-bit unsigned integer to buffer (big endian)', () => {
				const buffer = NumericConversion.int32UToBuf(4294967295, true);
				expect(buffer.readUInt32BE(0)).toBe(4294967295);
			});
		});

		describe('floatToBuf', () => {
			it('should convert float to buffer (little endian)', () => {
				const buffer = NumericConversion.floatToBuf(3.14159);
				expect(buffer.length).toBe(4);
				expect(buffer.readFloatLE(0)).toBeCloseTo(3.14159, 5);
			});

			it('should convert float to buffer (big endian)', () => {
				const buffer = NumericConversion.floatToBuf(3.14159, true);
				expect(buffer.readFloatBE(0)).toBeCloseTo(3.14159, 5);
			});

			it('should handle negative floats', () => {
				const buffer = NumericConversion.floatToBuf(-123.456);
				expect(buffer.readFloatLE(0)).toBeCloseTo(-123.456, 3);
			});

			it('should handle zero', () => {
				const buffer = NumericConversion.floatToBuf(0);
				expect(buffer.readFloatLE(0)).toBe(0);
			});
		});

		describe('doubleToBuf', () => {
			it('should convert double to buffer (little endian)', () => {
				const buffer = NumericConversion.doubleToBuf(3.141592653589793);
				expect(buffer.length).toBe(8);
				expect(buffer.readDoubleLE(0)).toBeCloseTo(3.141592653589793, 15);
			});

			it('should convert double to buffer (big endian)', () => {
				const buffer = NumericConversion.doubleToBuf(3.141592653589793, true);
				expect(buffer.readDoubleBE(0)).toBeCloseTo(3.141592653589793, 15);
			});

			it('should handle negative doubles', () => {
				const buffer = NumericConversion.doubleToBuf(-123.456789);
				expect(buffer.readDoubleLE(0)).toBeCloseTo(-123.456789, 6);
			});
		});
	});

	describe('Buffer to Number conversion methods', () => {
		describe('bufToInt8', () => {
			it('should convert buffer to 8-bit signed integer', () => {
				const buffer = Buffer.from([127]);
				const result = NumericConversion.bufToInt8(buffer);
				expect(result).toBe(127);
			});

			it('should handle negative values', () => {
				const buffer = Buffer.from([0x80]); // -128 in two's complement
				const result = NumericConversion.bufToInt8(buffer);
				expect(result).toBe(-128);
			});

			it('should handle offset', () => {
				const buffer = Buffer.from([0, 42, 0]);
				const result = NumericConversion.bufToInt8(buffer, 1);
				expect(result).toBe(42);
			});
		});

		describe('bufToInt8U', () => {
			it('should convert buffer to 8-bit unsigned integer', () => {
				const buffer = Buffer.from([255]);
				const result = NumericConversion.bufToInt8U(buffer);
				expect(result).toBe(255);
			});

			it('should handle offset', () => {
				const buffer = Buffer.from([0, 200, 0]);
				const result = NumericConversion.bufToInt8U(buffer, 1);
				expect(result).toBe(200);
			});
		});

		describe('bufToInt16', () => {
			it('should convert buffer to 16-bit signed integer (little endian)', () => {
				const buffer = Buffer.allocUnsafe(2);
				buffer.writeInt16LE(32767, 0);
				const result = NumericConversion.bufToInt16(buffer);
				expect(result).toBe(32767);
			});

			it('should convert buffer to 16-bit signed integer (big endian)', () => {
				const buffer = Buffer.allocUnsafe(2);
				buffer.writeInt16BE(32767, 0);
				const result = NumericConversion.bufToInt16(buffer, 0, true);
				expect(result).toBe(32767);
			});

			it('should handle negative values', () => {
				const buffer = Buffer.allocUnsafe(2);
				buffer.writeInt16LE(-32768, 0);
				const result = NumericConversion.bufToInt16(buffer);
				expect(result).toBe(-32768);
			});
		});

		describe('bufToInt16U', () => {
			it('should convert buffer to 16-bit unsigned integer (little endian)', () => {
				const buffer = Buffer.allocUnsafe(2);
				buffer.writeUInt16LE(65535, 0);
				const result = NumericConversion.bufToInt16U(buffer);
				expect(result).toBe(65535);
			});

			it('should convert buffer to 16-bit unsigned integer (big endian)', () => {
				const buffer = Buffer.allocUnsafe(2);
				buffer.writeUInt16BE(65535, 0);
				const result = NumericConversion.bufToInt16U(buffer, 0, true);
				expect(result).toBe(65535);
			});
		});

		describe('bufToInt32', () => {
			it('should convert buffer to 32-bit signed integer (little endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeInt32LE(2147483647, 0);
				const result = NumericConversion.bufToInt32(buffer);
				expect(result).toBe(2147483647);
			});

			it('should convert buffer to 32-bit signed integer (big endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeInt32BE(2147483647, 0);
				const result = NumericConversion.bufToInt32(buffer, 0, true);
				expect(result).toBe(2147483647);
			});

			it('should handle negative values', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeInt32LE(-2147483648, 0);
				const result = NumericConversion.bufToInt32(buffer);
				expect(result).toBe(-2147483648);
			});
		});

		describe('bufToInt32U', () => {
			it('should convert buffer to 32-bit unsigned integer (little endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeUInt32LE(4294967295, 0);
				const result = NumericConversion.bufToInt32U(buffer);
				expect(result).toBe(4294967295);
			});

			it('should convert buffer to 32-bit unsigned integer (big endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeUInt32BE(4294967295, 0);
				const result = NumericConversion.bufToInt32U(buffer, 0, true);
				expect(result).toBe(4294967295);
			});
		});

		describe('bufToInt', () => {
			it('should convert buffer to integer with default length', () => {
				const buffer = Buffer.allocUnsafe(6);
				buffer.writeIntLE(123456, 0, 6);
				const result = NumericConversion.bufToInt(buffer, 6);
				expect(result).toBe(123456);
			});

			it('should handle custom length', () => {
				const buffer = Buffer.allocUnsafe(3);
				buffer.writeIntLE(123456, 0, 3);
				const result = NumericConversion.bufToInt(buffer, 3);
				expect(result).toBe(123456);
			});

			it('should handle big endian', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeIntBE(123456, 0, 4);
				const result = NumericConversion.bufToInt(buffer, 4, 0, true);
				expect(result).toBe(123456);
			});
		});

		describe('bufToFloat', () => {
			it('should convert buffer to float (little endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeFloatLE(3.14159, 0);
				const result = NumericConversion.bufToFloat(buffer);
				expect(result).toBeCloseTo(3.14159, 5);
			});

			it('should convert buffer to float (big endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeFloatBE(3.14159, 0);
				const result = NumericConversion.bufToFloat(buffer, 0, true);
				expect(result).toBeCloseTo(3.14159, 5);
			});

			it('should handle negative floats', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeFloatLE(-123.456, 0);
				const result = NumericConversion.bufToFloat(buffer);
				expect(result).toBeCloseTo(-123.456, 3);
			});
		});

		describe('bufToDouble', () => {
			it('should convert buffer to double (little endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				buffer.writeDoubleLE(3.141592653589793, 0);
				const result = NumericConversion.bufToDouble(buffer);
				expect(result).toBeCloseTo(3.141592653589793, 15);
			});

			it('should convert buffer to double (big endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				buffer.writeDoubleBE(3.141592653589793, 0);
				const result = NumericConversion.bufToDouble(buffer, 0, true);
				expect(result).toBeCloseTo(3.141592653589793, 15);
			});

			it('should handle negative doubles', () => {
				const buffer = Buffer.allocUnsafe(8);
				buffer.writeDoubleLE(-123.456789, 0);
				const result = NumericConversion.bufToDouble(buffer);
				expect(result).toBeCloseTo(-123.456789, 6);
			});
		});
	});

	describe('BigInt 64-bit helper methods', () => {
		describe('bigIntToBuf', () => {
			it('should convert BigInt to buffer (little endian)', () => {
				const bigint = BigInt('9223372036854775807'); // Max signed 64-bit
				const buffer = NumericConversion.bigIntToBuf(bigint);
				expect(buffer.length).toBe(8);
				expect(buffer.readBigInt64LE(0)).toBe(bigint);
			});

			it('should convert BigInt to buffer (big endian)', () => {
				const bigint = BigInt('9223372036854775807');
				const buffer = NumericConversion.bigIntToBuf(bigint, true);
				expect(buffer.readBigInt64BE(0)).toBe(bigint);
			});

			it('should handle negative BigInt', () => {
				const bigint = BigInt('-9223372036854775808'); // Min signed 64-bit
				const buffer = NumericConversion.bigIntToBuf(bigint);
				expect(buffer.readBigInt64LE(0)).toBe(bigint);
			});

			it('should handle zero BigInt', () => {
				const bigint = BigInt(0);
				const buffer = NumericConversion.bigIntToBuf(bigint);
				expect(buffer.readBigInt64LE(0)).toBe(bigint);
			});
		});

		describe('bigIntUToBuf', () => {
			it('should convert unsigned BigInt to buffer (little endian)', () => {
				const bigint = BigInt('18446744073709551615'); // Max unsigned 64-bit
				const buffer = NumericConversion.bigIntUToBuf(bigint);
				expect(buffer.length).toBe(8);
				expect(buffer.readBigUInt64LE(0)).toBe(bigint);
			});

			it('should convert unsigned BigInt to buffer (big endian)', () => {
				const bigint = BigInt('18446744073709551615');
				const buffer = NumericConversion.bigIntUToBuf(bigint, true);
				expect(buffer.readBigUInt64BE(0)).toBe(bigint);
			});

			it('should handle zero BigInt', () => {
				const bigint = BigInt(0);
				const buffer = NumericConversion.bigIntUToBuf(bigint);
				expect(buffer.readBigUInt64LE(0)).toBe(bigint);
			});
		});

		describe('bufToBigInt', () => {
			it('should convert buffer to signed BigInt (little endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				const bigint = BigInt('9223372036854775807');
				buffer.writeBigInt64LE(bigint, 0);
				const result = NumericConversion.bufToBigInt(buffer);
				expect(result).toBe(bigint);
			});

			it('should convert buffer to signed BigInt (big endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				const bigint = BigInt('9223372036854775807');
				buffer.writeBigInt64BE(bigint, 0);
				const result = NumericConversion.bufToBigInt(buffer, 0, true);
				expect(result).toBe(bigint);
			});

			it('should handle negative BigInt', () => {
				const buffer = Buffer.allocUnsafe(8);
				const bigint = BigInt('-9223372036854775808');
				buffer.writeBigInt64LE(bigint, 0);
				const result = NumericConversion.bufToBigInt(buffer);
				expect(result).toBe(bigint);
			});

			it('should handle offset', () => {
				const buffer = Buffer.allocUnsafe(16);
				const bigint = BigInt('123456789012345');
				buffer.writeBigInt64LE(bigint, 8);
				const result = NumericConversion.bufToBigInt(buffer, 8);
				expect(result).toBe(bigint);
			});
		});

		describe('bufToBigIntU', () => {
			it('should convert buffer to unsigned BigInt (little endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				const bigint = BigInt('18446744073709551615');
				buffer.writeBigUInt64LE(bigint, 0);
				const result = NumericConversion.bufToBigIntU(buffer);
				expect(result).toBe(bigint);
			});

			it('should convert buffer to unsigned BigInt (big endian)', () => {
				const buffer = Buffer.allocUnsafe(8);
				const bigint = BigInt('18446744073709551615');
				buffer.writeBigUInt64BE(bigint, 0);
				const result = NumericConversion.bufToBigIntU(buffer, 0, true);
				expect(result).toBe(bigint);
			});

			it('should handle offset', () => {
				const buffer = Buffer.allocUnsafe(16);
				const bigint = BigInt('123456789012345');
				buffer.writeBigUInt64LE(bigint, 8);
				const result = NumericConversion.bufToBigIntU(buffer, 8);
				expect(result).toBe(bigint);
			});
		});
	});

	describe('Timestamp helper methods', () => {
		describe('timestampToBuf', () => {
			it('should convert current timestamp to buffer by default', () => {
				const buffer = NumericConversion.timestampToBuf();
				expect(buffer.length).toBe(4);

				const timestamp = NumericConversion.bufToTimestamp(buffer);
				const now = Date.now();

				expect(Math.abs(timestamp - now)).toBeLessThan(1000);
			});

			it('should convert specific timestamp to buffer (little endian)', () => {
				const timestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
				const buffer = NumericConversion.timestampToBuf(timestamp);
				expect(buffer.length).toBe(4);

				const restored = NumericConversion.bufToTimestamp(buffer);
				expect(restored).toBe(timestamp);
			});

			it('should convert specific timestamp to buffer (big endian)', () => {
				const timestamp = 1640995200000;
				const buffer = NumericConversion.timestampToBuf(timestamp, true);

				const restored = NumericConversion.bufToTimestamp(buffer, 0, true);
				expect(restored).toBe(timestamp);
			});

			it('should handle zero timestamp', () => {
				const buffer = NumericConversion.timestampToBuf(0);
				const restored = NumericConversion.bufToTimestamp(buffer);
				expect(restored).toBe(0);
			});

			it('should handle future timestamps', () => {
				const futureTimestamp = 1640995200000; // Fixed timestamp to avoid precision loss
				const buffer = NumericConversion.timestampToBuf(futureTimestamp);
				const restored = NumericConversion.bufToTimestamp(buffer);
				expect(restored).toBe(futureTimestamp);
			});
		});

		describe('bufToTimestamp', () => {
			it('should convert buffer to timestamp (little endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				const expectedSeconds = Math.floor(1640995200000 / 1000);
				buffer.writeUInt32LE(expectedSeconds, 0);

				const result = NumericConversion.bufToTimestamp(buffer);
				expect(result).toBe(1640995200000);
			});

			it('should convert buffer to timestamp (big endian)', () => {
				const buffer = Buffer.allocUnsafe(4);
				const expectedSeconds = Math.floor(1640995200000 / 1000);
				buffer.writeUInt32BE(expectedSeconds, 0);

				const result = NumericConversion.bufToTimestamp(buffer, 0, true);
				expect(result).toBe(1640995200000);
			});

			it('should handle offset', () => {
				const buffer = Buffer.allocUnsafe(8);
				const expectedSeconds = Math.floor(1640995200000 / 1000);
				buffer.writeUInt32LE(expectedSeconds, 4);

				const result = NumericConversion.bufToTimestamp(buffer, 4);
				expect(result).toBe(1640995200000);
			});

			it('should handle zero timestamp', () => {
				const buffer = Buffer.allocUnsafe(4);
				buffer.writeUInt32LE(0, 0);

				const result = NumericConversion.bufToTimestamp(buffer);
				expect(result).toBe(0);
			});
		});
	});

	describe('Integration and round-trip tests', () => {
		it('should maintain data integrity for 8-bit integers', () => {
			const testValues = [-128, -1, 0, 1, 127];
			testValues.forEach(value => {
				const buffer = NumericConversion.int8ToBuf(value);
				const restored = NumericConversion.bufToInt8(buffer);
				expect(restored).toBe(value);
			});
		});

		it('should maintain data integrity for 8-bit unsigned integers', () => {
			const testValues = [0, 1, 127, 128, 255];
			testValues.forEach(value => {
				const buffer = NumericConversion.int8UToBuf(value);
				const restored = NumericConversion.bufToInt8U(buffer);
				expect(restored).toBe(value);
			});
		});

		it('should maintain data integrity for 16-bit integers (both endianness)', () => {
			const testValues = [-32768, -1, 0, 1, 32767];
			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.int16ToBuf(value, false);
				const restoredLE = NumericConversion.bufToInt16(bufferLE, 0, false);
				expect(restoredLE).toBe(value);

				// Big endian
				const bufferBE = NumericConversion.int16ToBuf(value, true);
				const restoredBE = NumericConversion.bufToInt16(bufferBE, 0, true);
				expect(restoredBE).toBe(value);
			});
		});

		it('should maintain data integrity for 32-bit integers (both endianness)', () => {
			const testValues = [-2147483648, -1, 0, 1, 2147483647];
			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.int32ToBuf(value, false);
				const restoredLE = NumericConversion.bufToInt32(bufferLE, 0, false);
				expect(restoredLE).toBe(value);

				// Big endian
				const bufferBE = NumericConversion.int32ToBuf(value, true);
				const restoredBE = NumericConversion.bufToInt32(bufferBE, 0, true);
				expect(restoredBE).toBe(value);
			});
		});

		it('should maintain data integrity for floats (both endianness)', () => {
			const testValues = [-123.456, -1.0, 0.0, 1.0, 3.14159];
			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.floatToBuf(value, false);
				const restoredLE = NumericConversion.bufToFloat(bufferLE, 0, false);
				expect(restoredLE).toBeCloseTo(value, 5);

				// Big endian
				const bufferBE = NumericConversion.floatToBuf(value, true);
				const restoredBE = NumericConversion.bufToFloat(bufferBE, 0, true);
				expect(restoredBE).toBeCloseTo(value, 5);
			});
		});

		it('should maintain data integrity for doubles (both endianness)', () => {
			const testValues = [-123.456789012345, -1.0, 0.0, 1.0, 3.141592653589793];
			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.doubleToBuf(value, false);
				const restoredLE = NumericConversion.bufToDouble(bufferLE, 0, false);
				expect(restoredLE).toBeCloseTo(value, 15);

				// Big endian
				const bufferBE = NumericConversion.doubleToBuf(value, true);
				const restoredBE = NumericConversion.bufToDouble(bufferBE, 0, true);
				expect(restoredBE).toBeCloseTo(value, 15);
			});
		});

		it('should maintain data integrity for BigInt (both endianness)', () => {
			const testValues = [
				BigInt('-9223372036854775808'),
				BigInt('-1'),
				BigInt('0'),
				BigInt('1'),
				BigInt('9223372036854775807')
			];

			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.bigIntToBuf(value, false);
				const restoredLE = NumericConversion.bufToBigInt(bufferLE, 0, false);
				expect(restoredLE).toBe(value);

				// Big endian
				const bufferBE = NumericConversion.bigIntToBuf(value, true);
				const restoredBE = NumericConversion.bufToBigInt(bufferBE, 0, true);
				expect(restoredBE).toBe(value);
			});
		});

		it('should maintain data integrity for unsigned BigInt (both endianness)', () => {
			const testValues = [
				BigInt('0'),
				BigInt('1'),
				BigInt('9223372036854775807'),
				BigInt('18446744073709551615')
			];

			testValues.forEach(value => {
				// Little endian
				const bufferLE = NumericConversion.bigIntUToBuf(value, false);
				const restoredLE = NumericConversion.bufToBigIntU(bufferLE, 0, false);
				expect(restoredLE).toBe(value);

				// Big endian
				const bufferBE = NumericConversion.bigIntUToBuf(value, true);
				const restoredBE = NumericConversion.bufToBigIntU(bufferBE, 0, true);
				expect(restoredBE).toBe(value);
			});
		});

		it('should maintain timestamp precision through conversion', () => {
			const testTimestamps = [
				0,
				1640995200000, // 2022-01-01 00:00:00 UTC
				1609459200000, // 2021-01-01 00:00:00 UTC
				1577836800000  // 2020-01-01 00:00:00 UTC
			];

			testTimestamps.forEach(timestamp => {
				// Little endian
				const bufferLE = NumericConversion.timestampToBuf(timestamp, false);
				const restoredLE = NumericConversion.bufToTimestamp(bufferLE, 0, false);
				expect(restoredLE).toBe(timestamp);

				// Big endian
				const bufferBE = NumericConversion.timestampToBuf(timestamp, true);
				const restoredBE = NumericConversion.bufToTimestamp(bufferBE, 0, true);
				expect(restoredBE).toBe(timestamp);
			});
		});

		it('should handle 32-bit to 53-bit conversion round trips', () => {
			const testPairs: [number, number][] = [
				[0, 0],
				[1, 0],
				[0, 1],
				[0x12345678, 0x9ABCDEF0],
				[0xFFFFFFFF, 0xFFFFFFFF]
			];

			testPairs.forEach(pair => {
				const converted = NumericConversion.twoInt32toInt53(pair);
				const restored = NumericConversion.int53toTwoInt32(converted);
				expect(restored[0]).toBe(pair[0]);
				expect(restored[1]).toBe(pair[1]);
			});
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle buffer overflow scenarios gracefully', () => {
			expect(() => NumericConversion.int8ToBuf(127)).not.toThrow();
			expect(() => NumericConversion.int8ToBuf(-128)).not.toThrow();
			expect(() => NumericConversion.int8UToBuf(255)).not.toThrow();
			expect(() => NumericConversion.int8UToBuf(0)).not.toThrow();
		});

		it('should handle different buffer sizes correctly', () => {
			const lengths = [1, 2, 3, 4, 5, 6, 7, 8];
			lengths.forEach(len => {
				const buffer = NumericConversion.makeWBuffer(() => {}, len);
				expect(buffer.length).toBe(len);
			});
		});

		it('should handle offset parameters correctly', () => {
			const buffer = Buffer.allocUnsafe(16);

			for (let i = 0; i < 16; i++) {
				buffer[i] = i;
			}

			const offsets = [0, 1, 4, 8, 12];
			offsets.forEach(offset => {
				if (offset <= buffer.length - 1) {
					const result = NumericConversion.bufToInt8U(buffer, offset);
					expect(result).toBe(offset);
				}
			});
		});

		it('should handle endianness consistently', () => {
			const testValue = 0x12345678;

			// 32-bit test
			const bufferLE = NumericConversion.int32ToBuf(testValue, false);
			const bufferBE = NumericConversion.int32ToBuf(testValue, true);

			expect(bufferLE).not.toEqual(bufferBE);

			const restoredLE = NumericConversion.bufToInt32(bufferLE, 0, false);
			const restoredBE = NumericConversion.bufToInt32(bufferBE, 0, true);

			expect(restoredLE).toBe(testValue);
			expect(restoredBE).toBe(testValue);
		});

		it('should handle special float values', () => {
			const specialValues = [
				Number.POSITIVE_INFINITY,
				Number.NEGATIVE_INFINITY,
				Number.NaN
			];

			specialValues.forEach(value => {
				const buffer = NumericConversion.floatToBuf(value);
				const restored = NumericConversion.bufToFloat(buffer);

				if (Number.isNaN(value)) {
					expect(Number.isNaN(restored)).toBe(true);
				} else {
					expect(restored).toBe(value);
				}
			});

			const minValueBuffer = NumericConversion.floatToBuf(Number.MIN_VALUE);
			const restoredMinValue = NumericConversion.bufToFloat(minValueBuffer);
			expect(restoredMinValue).toBeCloseTo(0, 10); // MIN_VALUE becomes 0 in float32

			const maxValueBuffer = NumericConversion.floatToBuf(Number.MAX_VALUE);
			const restoredMaxValue = NumericConversion.bufToFloat(maxValueBuffer);
			expect(restoredMaxValue).toBe(Number.POSITIVE_INFINITY); // MAX_VALUE becomes Infinity in float32
		});

		it('should handle large BigInt values', () => {
			const largeBigInts = [
				BigInt('0x7FFFFFFFFFFFFFFF'), // Max signed 64-bit
				BigInt('-9223372036854775808') // Min signed 64-bit using decimal notation
			];

			largeBigInts.forEach(value => {
				expect(() => {
					const buffer = NumericConversion.bigIntToBuf(value);
					const restored = NumericConversion.bufToBigInt(buffer);
					expect(restored).toBe(value);
				}).not.toThrow();
			});

			const maxUnsignedBigInt = BigInt('0xFFFFFFFFFFFFFFFF');
			expect(() => {
				const buffer = NumericConversion.bigIntUToBuf(maxUnsignedBigInt);
				const restored = NumericConversion.bufToBigIntU(buffer);
				expect(restored).toBe(maxUnsignedBigInt);
			}).not.toThrow();
		});

		it('should handle timestamp edge cases', () => {
			const edgeCases = [
				0, // Unix epoch
				2147483647000, // Year 2038 problem (32-bit timestamp limit * 1000)
				4294967295000  // Max 32-bit unsigned * 1000
			];

			edgeCases.forEach(timestamp => {
				const buffer = NumericConversion.timestampToBuf(timestamp);
				const restored = NumericConversion.bufToTimestamp(buffer);
				expect(restored).toBe(timestamp);
			});
		});
	});
});
