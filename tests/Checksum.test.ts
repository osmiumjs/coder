import {describe, it, expect} from 'vitest';
import {Checksum}             from '../src/classes/CoderTools';

describe('Checksum', () => {
	describe('xorChecksum method', () => {
		it('should calculate XOR checksum for string', () => {
			const result = Checksum.xorChecksum('A');
			expect(result).toBe(65); // ASCII code of 'A'
		});

		it('should calculate XOR checksum for Buffer', () => {
			const buf = Buffer.from('A');
			const result = Checksum.xorChecksum(buf);
			expect(result).toBe(65);
		});

		it('should calculate XOR checksum for Uint8Array', () => {
			const uint8 = new Uint8Array([65]); // 'A'
			const result = Checksum.xorChecksum(uint8);
			expect(result).toBe(65);
		});

		it('should handle empty string', () => {
			const result = Checksum.xorChecksum('');
			expect(result).toBe(0);
		});

		it('should handle two identical bytes', () => {
			const result = Checksum.xorChecksum('AA');
			expect(result).toBe(0); // 65 XOR 65 = 0
		});

		it('should handle multiple bytes', () => {
			const result = Checksum.xorChecksum('AB');
			expect(result).toBe(3); // 65 XOR 66 = 3
		});

		it('should be commutative', () => {
			const result1 = Checksum.xorChecksum('AB');
			const result2 = Checksum.xorChecksum('BA');
			expect(result1).toBe(result2);
		});
	});

	describe('djb2Hash method', () => {
		it('should calculate DJB2 hash for string', () => {
			const result = Checksum.djb2Hash('A');
			expect(typeof result).toBe('number');
			expect(result).toBeGreaterThanOrEqual(0);
		});

		it('should handle empty string', () => {
			const result = Checksum.djb2Hash('');
			expect(result).toBe(5381); // Initial hash value
		});

		it('should return same result for same input', () => {
			const str = 'test';
			const result1 = Checksum.djb2Hash(str);
			const result2 = Checksum.djb2Hash(str);
			expect(result1).toBe(result2);
		});

		it('should return different results for different inputs', () => {
			const result1 = Checksum.djb2Hash('A');
			const result2 = Checksum.djb2Hash('B');
			expect(result1).not.toBe(result2);
		});

		it('should handle single character', () => {
			const result = Checksum.djb2Hash('A');
			expect(result).toBe(177638); // Actual calculated value
		});

		it('should be case sensitive', () => {
			const result1 = Checksum.djb2Hash('a');
			const result2 = Checksum.djb2Hash('A');
			expect(result1).not.toBe(result2);
		});
	});

	describe('sdbmHash method', () => {
		it('should calculate SDBM hash for string', () => {
			const result = Checksum.sdbmHash('A');
			expect(typeof result).toBe('number');
			expect(result).toBeGreaterThanOrEqual(0);
		});

		it('should handle empty string', () => {
			const result = Checksum.sdbmHash('');
			expect(result).toBe(0); // Initial hash value
		});

		it('should return same result for same input', () => {
			const str = 'test';
			const result1 = Checksum.sdbmHash(str);
			const result2 = Checksum.sdbmHash(str);
			expect(result1).toBe(result2);
		});

		it('should return different results for different inputs', () => {
			const result1 = Checksum.sdbmHash('A');
			const result2 = Checksum.sdbmHash('B');
			expect(result1).not.toBe(result2);
		});

		it('should handle single character', () => {
			const result = Checksum.sdbmHash('A');
			expect(result).toBe(65); // ASCII value of 'A'
		});

		it('should be case sensitive', () => {
			const result1 = Checksum.sdbmHash('a');
			const result2 = Checksum.sdbmHash('A');
			expect(result1).not.toBe(result2);
		});
	});

	describe('Integration tests', () => {
		it('should handle same data across hash methods', () => {
			const data = 'test';

			const xorResult = Checksum.xorChecksum(data);
			const djb2Result = Checksum.djb2Hash(data);
			const sdbmResult = Checksum.sdbmHash(data);

			expect(typeof xorResult).toBe('number');
			expect(typeof djb2Result).toBe('number');
			expect(typeof sdbmResult).toBe('number');

			const results = [xorResult, djb2Result, sdbmResult];
			const uniqueResults = new Set(results);
			expect(uniqueResults.size).toBeGreaterThan(1);
		});

		it('should handle different data types for XOR', () => {
			const str = 'A';
			const buf = Buffer.from(str);
			const uint8 = new Uint8Array([65]);

			const xorStr = Checksum.xorChecksum(str);
			const xorBuf = Checksum.xorChecksum(buf);
			const xorUint8 = Checksum.xorChecksum(uint8);

			expect(xorStr).toBe(xorBuf);
			expect(xorBuf).toBe(xorUint8);
		});

		it('should be deterministic', () => {
			const testData = ['', 'A', 'test'];

			testData.forEach(data => {
				const xorResults = [Checksum.xorChecksum(data), Checksum.xorChecksum(data)];
				const djb2Results = [Checksum.djb2Hash(data), Checksum.djb2Hash(data)];
				const sdbmResults = [Checksum.sdbmHash(data), Checksum.sdbmHash(data)];

				expect(xorResults[0]).toBe(xorResults[1]);
				expect(djb2Results[0]).toBe(djb2Results[1]);
				expect(sdbmResults[0]).toBe(sdbmResults[1]);
			});
		});
	});

	describe('Edge cases', () => {
		it('should handle special characters', () => {
			const specialChars = '!@#';

			expect(() => Checksum.xorChecksum(specialChars)).not.toThrow();
			expect(() => Checksum.djb2Hash(specialChars)).not.toThrow();
			expect(() => Checksum.sdbmHash(specialChars)).not.toThrow();
		});

		it('should return unsigned 32-bit integers for hash methods', () => {
			const data = 'test';

			const djb2Result = Checksum.djb2Hash(data);
			const sdbmResult = Checksum.sdbmHash(data);

			expect(djb2Result).toBeGreaterThanOrEqual(0);
			expect(djb2Result).toBeLessThanOrEqual(0xFFFFFFFF);

			expect(sdbmResult).toBeGreaterThanOrEqual(0);
			expect(sdbmResult).toBeLessThanOrEqual(0xFFFFFFFF);
		});

		it('should handle XOR checksum properties', () => {
			const data = 'test';
			const checksum = Checksum.xorChecksum(data);

			const combined = Buffer.concat([Buffer.from(data), Buffer.from([checksum])]);
			const result = Checksum.xorChecksum(combined);
			expect(result).toBe(0);
		});
	});
});
