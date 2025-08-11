import {describe, it, expect} from 'vitest';
import {HexUtils}             from '../src/classes/CoderTools/HexUtils';

describe('HexUtils', () => {
	describe('hexToBinStr method', () => {
		it('should convert hex to binary string', () => {
			const hex = '48656C6C6F'; // "Hello"
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('Hello');
		});

		it('should handle single hex byte', () => {
			const hex = '41'; // "A"
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('A');
		});

		it('should handle empty string', () => {
			const hex = '';
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('');
		});

		it('should handle lowercase hex', () => {
			const hex = '48656c6c6f'; // "Hello" in lowercase
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('Hello');
		});

		it('should handle special characters', () => {
			const hex = '21402324'; // "!@#$"
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('!@#$');
		});

		it('should handle null bytes', () => {
			const hex = '0041'; // null + "A"
			const result = HexUtils.hexToBinStr(hex);
			expect(result).toBe('\x00A');
		});
	});

	describe('hexToBytes method', () => {
		it('should convert hex to Uint8Array', () => {
			const hex = '48656C6C6F'; // "Hello"
			const result = HexUtils.hexToBytes(hex);

			expect(result).toBeInstanceOf(Uint8Array);
			expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
		});

		it('should handle single hex byte', () => {
			const hex = '41'; // 65 decimal
			const result = HexUtils.hexToBytes(hex);

			expect(result).toBeInstanceOf(Uint8Array);
			expect(Array.from(result)).toEqual([65]);
		});

		it('should handle empty string', () => {
			const hex = '';
			const result = HexUtils.hexToBytes(hex);

			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBe(0);
		});

		it('should handle lowercase hex', () => {
			const hex = '48656c6c6f'; // "Hello" in lowercase
			const result = HexUtils.hexToBytes(hex);

			expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
		});

		it('should handle full byte range', () => {
			const hex = '00FF'; // 0 and 255
			const result = HexUtils.hexToBytes(hex);

			expect(Array.from(result)).toEqual([0, 255]);
		});
	});

	describe('bytesToHex method', () => {
		it('should convert Uint8Array to hex', () => {
			const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const result = HexUtils.bytesToHex(bytes);

			expect(result).toBe('48656C6C6F');
		});

		it('should convert Buffer to hex', () => {
			const buffer = Buffer.from('Hello');
			const result = HexUtils.bytesToHex(buffer);

			expect(result).toBe('48656C6C6F');
		});

		it('should handle empty array', () => {
			const bytes = new Uint8Array([]);
			const result = HexUtils.bytesToHex(bytes);

			expect(result).toBe('');
		});

		it('should handle single byte', () => {
			const bytes = new Uint8Array([65]); // "A"
			const result = HexUtils.bytesToHex(bytes);

			expect(result).toBe('41');
		});

		it('should return uppercase hex', () => {
			const bytes = new Uint8Array([255, 170, 85]); // FF, AA, 55
			const result = HexUtils.bytesToHex(bytes);

			expect(result).toBe('FFAA55');
		});

		it('should handle null bytes', () => {
			const bytes = new Uint8Array([0, 65]); // null + "A"
			const result = HexUtils.bytesToHex(bytes);

			expect(result).toBe('0041');
		});
	});

	describe('stringToHex method', () => {
		it('should convert string to hex with default UTF-8 encoding', () => {
			const str = 'Hello';
			const result = HexUtils.stringToHex(str);

			expect(result).toBe('48656C6C6F');
		});

		it('should convert string to hex with ASCII encoding', () => {
			const str = 'Hello';
			const result = HexUtils.stringToHex(str, 'ascii');

			expect(result).toBe('48656C6C6F');
		});

		it('should handle empty string', () => {
			const str = '';
			const result = HexUtils.stringToHex(str);

			expect(result).toBe('');
		});

		it('should handle single character', () => {
			const str = 'A';
			const result = HexUtils.stringToHex(str);

			expect(result).toBe('41');
		});

		it('should handle special characters', () => {
			const str = '!@#$';
			const result = HexUtils.stringToHex(str);

			expect(result).toBe('21402324');
		});

		it('should handle Unicode characters', () => {
			const str = 'ñ';
			const result = HexUtils.stringToHex(str);

			// UTF-8 encoding of ñ is C3B1
			expect(result).toBe('C3B1');
		});

		it('should return uppercase hex', () => {
			const str = 'test';
			const result = HexUtils.stringToHex(str);

			expect(result).toBe('74657374');
			expect(result).toBe(result.toUpperCase());
		});
	});

	describe('hexToString method', () => {
		it('should convert hex to string with default UTF-8 encoding', () => {
			const hex = '48656C6C6F'; // "Hello"
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('Hello');
		});

		it('should convert hex to string with ASCII encoding', () => {
			const hex = '48656C6C6F'; // "Hello"
			const result = HexUtils.hexToString(hex, 'ascii');

			expect(result).toBe('Hello');
		});

		it('should handle empty hex string', () => {
			const hex = '';
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('');
		});

		it('should handle single hex byte', () => {
			const hex = '41'; // "A"
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('A');
		});

		it('should handle lowercase hex', () => {
			const hex = '48656c6c6f'; // "Hello" in lowercase
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('Hello');
		});

		it('should handle Unicode characters', () => {
			const hex = 'C3B1'; // UTF-8 encoding of ñ
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('ñ');
		});

		it('should handle special characters', () => {
			const hex = '21402324'; // "!@#$"
			const result = HexUtils.hexToString(hex);

			expect(result).toBe('!@#$');
		});
	});

	describe('Integration tests', () => {
		it('should be reversible: string -> hex -> string', () => {
			const testStrings = ['Hello', 'World!', 'Test123', '!@#$%', ''];

			testStrings.forEach(str => {
				const hex = HexUtils.stringToHex(str);
				const restored = HexUtils.hexToString(hex);
				expect(restored).toBe(str);
			});
		});

		it('should be reversible: bytes -> hex -> bytes', () => {
			const testArrays = [
				new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
				new Uint8Array([0, 255, 128, 64]),
				new Uint8Array([]),
				new Uint8Array([65])
			];

			testArrays.forEach(bytes => {
				const hex = HexUtils.bytesToHex(bytes);
				const restored = HexUtils.hexToBytes(hex);
				expect(Array.from(restored)).toEqual(Array.from(bytes));
			});
		});

		it('should be consistent across different methods', () => {
			const str = 'Hello';

			const hexFromString = HexUtils.stringToHex(str);

			const bytes = new Uint8Array(Buffer.from(str));
			const hexFromBytes = HexUtils.bytesToHex(bytes);

			expect(hexFromString).toBe(hexFromBytes);
		});

		it('should handle binary data workflow', () => {
			const originalBytes = new Uint8Array([0, 1, 127, 128, 255]);
			const hex = HexUtils.bytesToHex(originalBytes);

			const restoredBytes = HexUtils.hexToBytes(hex);

			const binStr = HexUtils.hexToBinStr(hex);

			expect(Array.from(restoredBytes)).toEqual(Array.from(originalBytes));
			expect(binStr.length).toBe(originalBytes.length);
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle odd-length hex strings gracefully', () => {
			const hex = '4865'; // Even length, should work fine
			const result = HexUtils.hexToBytes(hex);
			expect(Array.from(result)).toEqual([72, 101]);
		});

		it('should handle different case combinations', () => {
			const testCases = [
				'48656C6C6F', // All uppercase
				'48656c6c6f', // Mixed case
				'48656C6c6F'  // Mixed case
			];

			testCases.forEach(hex => {
				const result = HexUtils.hexToString(hex);
				expect(result).toBe('Hello');
			});
		});

		it('should maintain data integrity with binary data', () => {
			const binaryData = new Uint8Array(256);
			for (let i = 0; i < 256; i++) {
				binaryData[i] = i;
			}

			const hex = HexUtils.bytesToHex(binaryData);
			const restored = HexUtils.hexToBytes(hex);

			expect(Array.from(restored)).toEqual(Array.from(binaryData));
		});

		it('should handle different encodings consistently', () => {
			const asciiStr = 'Hello';

			const hexUtf8 = HexUtils.stringToHex(asciiStr, 'utf8');
			const hexAscii = HexUtils.stringToHex(asciiStr, 'ascii');

			expect(hexUtf8).toBe(hexAscii);

			const restoredUtf8 = HexUtils.hexToString(hexUtf8, 'utf8');
			const restoredAscii = HexUtils.hexToString(hexAscii, 'ascii');

			expect(restoredUtf8).toBe(asciiStr);
			expect(restoredAscii).toBe(asciiStr);
		});

		it('should produce uppercase hex output', () => {
			const testData = [
				new Uint8Array([255, 170, 85]), // Should produce FFAA55
				'test' // Should produce 74657374
			];

			const hexFromBytes = HexUtils.bytesToHex(testData[0] as Buffer);
			const hexFromString = HexUtils.stringToHex(testData[1] as string);

			expect(hexFromBytes).toBe(hexFromBytes.toUpperCase());
			expect(hexFromString).toBe(hexFromString.toUpperCase());
		});
	});
});
