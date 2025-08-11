import {describe, it, expect, beforeEach} from 'vitest';
import {BitOperations}                    from '../src/classes/CoderTools';

describe('BitOperations', () => {
	describe('pad method', () => {
		it('should pad string with zeros to specified length', () => {
			expect(BitOperations.pad('101', 8)).toBe('00000101');
			expect(BitOperations.pad('1111', 8)).toBe('00001111');
			expect(BitOperations.pad('11111111', 8)).toBe('11111111');
		});

		it('should pad number with zeros to specified length', () => {
			expect(BitOperations.pad(5, 8)).toBe('00000005');
			expect(BitOperations.pad(255, 8)).toBe('00000255');
			expect(BitOperations.pad(1000, 8)).toBe('00001000');
		});

		it('should not truncate if string is longer than specified length', () => {
			expect(BitOperations.pad('123456789', 8)).toBe('123456789');
			expect(BitOperations.pad(123456789, 8)).toBe('123456789');
		});

		it('should use default padding of 8 when not specified', () => {
			expect(BitOperations.pad('1')).toBe('00000001');
			expect(BitOperations.pad(1)).toBe('00000001');
		});

		it('should handle edge cases', () => {
			expect(BitOperations.pad('', 5)).toBe('00000');
			expect(BitOperations.pad(0, 4)).toBe('0000');
		});
	});

	describe('bufToBinFlags method', () => {
		it('should convert buffer to binary flags array', () => {
			const buf = Buffer.from([170]); // 10101010 in binary
			const result = BitOperations.bufToBinFlags(buf);
			expect(result).toEqual([true, false, true, false, true, false, true, false]);
		});

		it('should convert buffer with offset', () => {
			const buf = Buffer.from([255, 170]); // [11111111, 10101010]
			const result = BitOperations.bufToBinFlags(buf, 1);
			expect(result).toEqual([true, false, true, false, true, false, true, false]);
		});

		it('should convert number to binary flags array', () => {
			const result = BitOperations.bufToBinFlags(170);
			expect(result).toEqual([true, false, true, false, true, false, true, false]);
		});

		it('should handle edge cases', () => {
			expect(BitOperations.bufToBinFlags(0)).toEqual([false, false, false, false, false, false, false, false]);
			expect(BitOperations.bufToBinFlags(255)).toEqual([true, true, true, true, true, true, true, true]);
		});

		it('should handle small numbers with proper padding', () => {
			expect(BitOperations.bufToBinFlags(1)).toEqual([false, false, false, false, false, false, false, true]);
			expect(BitOperations.bufToBinFlags(3)).toEqual([false, false, false, false, false, false, true, true]);
		});
	});

	describe('binFlagsToBuf method', () => {
		it('should convert binary flags array to buffer', () => {
			const flags = [true, false, true, false, true, false, true, false];
			const result = BitOperations.binFlagsToBuf(flags);
			expect(result.readUInt8(0)).toBe(170);
		});

		it('should handle all false flags', () => {
			const flags = [false, false, false, false, false, false, false, false];
			const result = BitOperations.binFlagsToBuf(flags);
			expect(result.readUInt8(0)).toBe(0);
		});

		it('should handle all true flags', () => {
			const flags = [true, true, true, true, true, true, true, true];
			const result = BitOperations.binFlagsToBuf(flags);
			expect(result.readUInt8(0)).toBe(255);
		});

		it('should handle partial arrays (less than 8 elements)', () => {
			const flags = [true, false, true];
			const result = BitOperations.binFlagsToBuf(flags);
			expect(result.readUInt8(0)).toBe(160); // 10100000 = 160 (bits are placed from left)
		});

		it('should be reversible with bufToBinFlags', () => {
			const originalFlags = [true, false, true, true, false, false, true, false];
			const buf = BitOperations.binFlagsToBuf(originalFlags);
			const convertedFlags = BitOperations.bufToBinFlags(buf);
			expect(convertedFlags).toEqual(originalFlags);
		});
	});

	describe('bytesToBinary method', () => {
		it('should convert Uint8Array to binary string', () => {
			const bytes = new Uint8Array([170, 85]); // 10101010 01010101
			const result = BitOperations.bytesToBinary(bytes);
			expect(result).toBe('1010101001010101');
		});

		it('should convert Buffer to binary string', () => {
			const buf = Buffer.from([255, 0, 128]);
			const result = BitOperations.bytesToBinary(buf);
			expect(result).toBe('111111110000000010000000');
		});

		it('should handle single byte', () => {
			const bytes = new Uint8Array([42]);
			const result = BitOperations.bytesToBinary(bytes);
			expect(result).toBe('00101010');
		});

		it('should handle empty array', () => {
			const bytes = new Uint8Array([]);
			const result = BitOperations.bytesToBinary(bytes);
			expect(result).toBe('');
		});
	});

	describe('binaryToBytes method', () => {
		it('should convert binary string to Uint8Array', () => {
			const binary = '1010101001010101';
			const result = BitOperations.binaryToBytes(binary);
			expect(Array.from(result)).toEqual([170, 85]);
		});

		it('should handle single byte binary', () => {
			const binary = '00101010';
			const result = BitOperations.binaryToBytes(binary);
			expect(Array.from(result)).toEqual([42]);
		});

		it('should handle incomplete last byte (padding with zeros)', () => {
			const binary = '101'; // Should be treated as 10100000 but actually treated as 00000101
			const result = BitOperations.binaryToBytes(binary);
			expect(Array.from(result)).toEqual([5]); // 00000101 = 5
		});

		it('should be reversible with bytesToBinary', () => {
			const originalBytes = new Uint8Array([123, 45, 67, 89]);
			const binary = BitOperations.bytesToBinary(originalBytes);
			const convertedBytes = BitOperations.binaryToBytes(binary);
			expect(Array.from(convertedBytes)).toEqual(Array.from(originalBytes));
		});
	});

	describe('stringToBinary method', () => {
		it('should convert ASCII string to binary', () => {
			const result = BitOperations.stringToBinary('A'); // ASCII 65 = 01000001
			expect(result).toBe('01000001');
		});

		it('should convert multi-character string', () => {
			const result = BitOperations.stringToBinary('AB');
			expect(result).toBe('0100000101000010'); // A=65, B=66
		});

		it('should handle different encodings', () => {
			const result = BitOperations.stringToBinary('A', 'ascii');
			expect(result).toBe('01000001');
		});

		it('should handle empty string', () => {
			const result = BitOperations.stringToBinary('');
			expect(result).toBe('');
		});

		it('should handle special characters', () => {
			const result = BitOperations.stringToBinary('!@#');
			expect(result.length).toBe(24); // 3 characters * 8 bits each
		});
	});

	describe('binaryToString method', () => {
		it('should convert binary to ASCII string', () => {
			const binary = '01000001'; // ASCII 65 = 'A'
			const result = BitOperations.binaryToString(binary);
			expect(result).toBe('A');
		});

		it('should convert multi-byte binary to string', () => {
			const binary = '0100000101000010'; // 'AB'
			const result = BitOperations.binaryToString(binary);
			expect(result).toBe('AB');
		});

		it('should be reversible with stringToBinary', () => {
			const originalString = 'Hello World!';
			const binary = BitOperations.stringToBinary(originalString);
			const convertedString = BitOperations.binaryToString(binary);
			expect(convertedString).toBe(originalString);
		});

		it('should handle different encodings', () => {
			const binary = '01000001';
			const result = BitOperations.binaryToString(binary, 'ascii');
			expect(result).toBe('A');
		});
	});

	describe('setBit method', () => {
		it('should set bit at specified position', () => {
			expect(BitOperations.setBit(0, 0)).toBe(1); // 00000001
			expect(BitOperations.setBit(0, 3)).toBe(8); // 00001000
			expect(BitOperations.setBit(5, 1)).toBe(7); // 00000101 -> 00000111
		});

		it('should not change already set bit', () => {
			expect(BitOperations.setBit(7, 0)).toBe(7);
			expect(BitOperations.setBit(15, 3)).toBe(15);
		});

		it('should handle large numbers', () => {
			expect(BitOperations.setBit(1000, 10)).toBe(1000 | (1 << 10));
		});
	});

	describe('clearBit method', () => {
		it('should clear bit at specified position', () => {
			expect(BitOperations.clearBit(7, 0)).toBe(6); // 00000111 -> 00000110
			expect(BitOperations.clearBit(15, 3)).toBe(7); // 00001111 -> 00000111
		});

		it('should not change already cleared bit', () => {
			expect(BitOperations.clearBit(6, 0)).toBe(6);
			expect(BitOperations.clearBit(0, 5)).toBe(0);
		});

		it('should handle large numbers', () => {
			const num = 1024; // bit 10 is set
			expect(BitOperations.clearBit(num, 10)).toBe(0);
		});
	});

	describe('toggleBit method', () => {
		it('should toggle bit at specified position', () => {
			expect(BitOperations.toggleBit(0, 0)).toBe(1); // 0 -> 1
			expect(BitOperations.toggleBit(1, 0)).toBe(0); // 1 -> 0
			expect(BitOperations.toggleBit(5, 1)).toBe(7); // 101 -> 111
			expect(BitOperations.toggleBit(7, 1)).toBe(5); // 111 -> 101
		});

		it('should be reversible', () => {
			const original = 42;
			const position = 3;
			const toggled = BitOperations.toggleBit(original, position);
			const restored = BitOperations.toggleBit(toggled, position);
			expect(restored).toBe(original);
		});
	});

	describe('getBit method', () => {
		it('should return true for set bits', () => {
			expect(BitOperations.getBit(1, 0)).toBe(true); // 00000001
			expect(BitOperations.getBit(8, 3)).toBe(true); // 00001000
			expect(BitOperations.getBit(255, 7)).toBe(true); // 11111111
		});

		it('should return false for cleared bits', () => {
			expect(BitOperations.getBit(0, 0)).toBe(false); // 00000000
			expect(BitOperations.getBit(6, 0)).toBe(false); // 00000110
			expect(BitOperations.getBit(127, 7)).toBe(false); // 01111111
		});

		it('should work with large numbers', () => {
			const num = 1 << 20; // bit 20 is set
			expect(BitOperations.getBit(num, 20)).toBe(true);
			expect(BitOperations.getBit(num, 19)).toBe(false);
		});
	});

	describe('countSetBits method', () => {
		it('should count set bits correctly', () => {
			expect(BitOperations.countSetBits(0)).toBe(0);
			expect(BitOperations.countSetBits(1)).toBe(1); // 00000001
			expect(BitOperations.countSetBits(3)).toBe(2); // 00000011
			expect(BitOperations.countSetBits(7)).toBe(3); // 00000111
			expect(BitOperations.countSetBits(15)).toBe(4); // 00001111
			expect(BitOperations.countSetBits(255)).toBe(8); // 11111111
		});

		it('should handle large numbers', () => {
			expect(BitOperations.countSetBits(1023)).toBe(10); // 1111111111
			expect(BitOperations.countSetBits(1024)).toBe(1); // 10000000000
		});

		it('should handle alternating patterns', () => {
			expect(BitOperations.countSetBits(170)).toBe(4); // 10101010
			expect(BitOperations.countSetBits(85)).toBe(4); // 01010101
		});
	});

	describe('swapEndian16 method', () => {
		it('should swap bytes in 16-bit number', () => {
			expect(BitOperations.swapEndian16(0x1234)).toBe(0x3412);
			expect(BitOperations.swapEndian16(0xABCD)).toBe(0xCDAB);
			expect(BitOperations.swapEndian16(0x00FF)).toBe(0xFF00);
		});

		it('should handle edge cases', () => {
			expect(BitOperations.swapEndian16(0)).toBe(0);
			expect(BitOperations.swapEndian16(0xFFFF)).toBe(0xFFFF);
		});

		it('should be reversible', () => {
			const original = 0x1234;
			const swapped = BitOperations.swapEndian16(original);
			const restored = BitOperations.swapEndian16(swapped);
			expect(restored).toBe(original);
		});
	});

	describe('swapEndian32 method', () => {
		it('should swap bytes in 32-bit number', () => {
			expect(BitOperations.swapEndian32(0x12345678)).toBe(0x78563412);
			expect(BitOperations.swapEndian32(0xABCDEF01)).toBe(0x01EFCDAB);
		});

		it('should handle edge cases', () => {
			expect(BitOperations.swapEndian32(0)).toBe(0);
			expect(BitOperations.swapEndian32(0xFFFFFFFF) >>> 0).toBe(0xFFFFFFFF);
		});

		it('should be reversible', () => {
			const original = 0x12345678;
			const swapped = BitOperations.swapEndian32(original);
			const restored = BitOperations.swapEndian32(swapped);
			expect(restored).toBe(original);
		});

		it('should handle smaller numbers', () => {
			expect(BitOperations.swapEndian32(0x000000FF) >>> 0).toBe(0xFF000000);
			expect(BitOperations.swapEndian32(0x0000FF00)).toBe(0x00FF0000);
		});
	});

	describe('Integration tests', () => {
		it('should handle complete bit manipulation workflow', () => {
			let num = 0;

			num = BitOperations.setBit(num, 0);
			num = BitOperations.setBit(num, 2);
			num = BitOperations.setBit(num, 4);

			expect(num).toBe(21); // 00010101
			expect(BitOperations.countSetBits(num)).toBe(3);

			num = BitOperations.toggleBit(num, 1);
			expect(num).toBe(23); // 00010111
			expect(BitOperations.countSetBits(num)).toBe(4);

			num = BitOperations.clearBit(num, 4);
			expect(num).toBe(7); // 00000111
			expect(BitOperations.countSetBits(num)).toBe(3);
		});

		it('should handle string to binary and back conversion', () => {
			const testStrings = ['Hello', 'World!', '123', '@#$%', ''];

			testStrings.forEach(str => {
				const binary = BitOperations.stringToBinary(str);
				const restored = BitOperations.binaryToString(binary);
				expect(restored).toBe(str);
			});
		});

		it('should handle buffer to flags and back conversion', () => {
			const testValues = [0, 1, 85, 170, 255];

			testValues.forEach(val => {
				const flags = BitOperations.bufToBinFlags(val);
				const buf = BitOperations.binFlagsToBuf(flags);
				expect(buf.readUInt8(0)).toBe(val);
			});
		});

		it('should handle endianness swapping consistency', () => {
			const test16Values = [0x1234, 0xABCD, 0x00FF, 0xFF00];
			const test32Values = [0x12345678, 0x000000FF, 0xFF000000];

			test16Values.forEach(val => {
				const swapped = BitOperations.swapEndian16(val);
				const restored = BitOperations.swapEndian16(swapped);
				expect(restored).toBe(val);
			});

			test32Values.forEach(val => {
				const swapped = BitOperations.swapEndian32(val);
				const restored = BitOperations.swapEndian32(swapped);
				expect(restored >>> 0).toBe(val >>> 0);
			});
		});
	});

	describe('Error handling and edge cases', () => {
		it('should handle negative bit positions gracefully', () => {
			expect(() => BitOperations.setBit(5, -1)).not.toThrow();
			expect(() => BitOperations.clearBit(5, -1)).not.toThrow();
			expect(() => BitOperations.toggleBit(5, -1)).not.toThrow();
			expect(() => BitOperations.getBit(5, -1)).not.toThrow();
		});

		it('should handle very large bit positions', () => {
			const largePos = 31;
			expect(() => BitOperations.setBit(0, largePos)).not.toThrow();
			expect(() => BitOperations.clearBit(0, largePos)).not.toThrow();
			expect(() => BitOperations.toggleBit(0, largePos)).not.toThrow();
			expect(() => BitOperations.getBit(0, largePos)).not.toThrow();
		});

		it('should handle invalid binary strings', () => {
			expect(Array.from(BitOperations.binaryToBytes(''))).toEqual([]);
		});

		it('should handle buffer edge cases', () => {
			const emptyBuf = Buffer.alloc(0);
			expect(() => BitOperations.bufToBinFlags(emptyBuf)).toThrow();
		});
	});
});
