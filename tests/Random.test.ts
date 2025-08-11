import {describe, it, expect} from 'vitest';
import {Random}               from '../src/classes/CoderTools/Random';

describe('Random', () => {
	describe('randomBytes method', () => {
		it('should generate buffer with specified length', () => {
			const lengths = [0, 1, 8, 16, 32, 64, 128, 256];

			lengths.forEach(length => {
				const buffer = Random.randomBytes(length);
				expect(buffer).toBeInstanceOf(Buffer);
				expect(buffer.length).toBe(length);
			});
		});

		it('should generate different random bytes on each call', () => {
			const length = 16;
			const buffer1 = Random.randomBytes(length);
			const buffer2 = Random.randomBytes(length);

			expect(buffer1.equals(buffer2)).toBe(false);
		});

		it('should generate bytes in valid range (0-255)', () => {
			const buffer = Random.randomBytes(100);

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer[i]).toBeGreaterThanOrEqual(0);
				expect(buffer[i]).toBeLessThanOrEqual(255);
				expect(Number.isInteger(buffer[i])).toBe(true);
			}
		});

		it('should handle zero length', () => {
			const buffer = Random.randomBytes(0);
			expect(buffer.length).toBe(0);
			expect(buffer).toBeInstanceOf(Buffer);
		});

		it('should generate statistically distributed bytes', () => {
			const buffer = Random.randomBytes(1000);
			const counts = new Array(256).fill(0);

			for (let i = 0; i < buffer.length; i++) {
				counts[buffer[i]]++;
			}

			const uniqueValues = counts.filter(count => count > 0).length;
			expect(uniqueValues).toBeGreaterThan(100); // Should have good distribution
		});
	});

	describe('randomHex method', () => {
		it('should generate hex string with correct length', () => {
			const lengths = [0, 1, 8, 16, 32, 64];

			lengths.forEach(length => {
				const hex = Random.randomHex(length);
				expect(typeof hex).toBe('string');
				expect(hex.length).toBe(length * 2); // Each byte becomes 2 hex characters
			});
		});

		it('should generate valid hex characters only', () => {
			const hex = Random.randomHex(32);
			expect(/^[0-9A-F]*$/.test(hex)).toBe(true);
		});

		it('should generate uppercase hex', () => {
			const hex = Random.randomHex(16);
			expect(hex).toBe(hex.toUpperCase());
			expect(hex).not.toBe(hex.toLowerCase());
		});

		it('should generate different hex strings on each call', () => {
			const hex1 = Random.randomHex(16);
			const hex2 = Random.randomHex(16);

			expect(hex1).not.toBe(hex2);
		});

		it('should handle zero length', () => {
			const hex = Random.randomHex(0);
			expect(hex).toBe('');
		});

		it('should be convertible back to buffer', () => {
			const originalLength = 16;
			const hex = Random.randomHex(originalLength);
			const buffer = Buffer.from(hex, 'hex');

			expect(buffer.length).toBe(originalLength);
			expect(buffer.toString('hex').toUpperCase()).toBe(hex);
		});

		it('should generate statistically different hex strings', () => {
			const hexStrings = Array.from({length: 100}, () => Random.randomHex(8));
			const uniqueStrings = new Set(hexStrings);

			expect(uniqueStrings.size).toBe(100);
		});
	});

	describe('randomBase64 method', () => {
		it('should generate base64 string with appropriate length', () => {
			const lengths = [0, 1, 3, 6, 12, 24, 48];

			lengths.forEach(length => {
				const base64 = Random.randomBase64(length);
				expect(typeof base64).toBe('string');

				const expectedLength = Math.ceil(length / 3) * 4;
				expect(base64.length).toBe(expectedLength);
			});
		});

		it('should generate valid base64 characters only', () => {
			const base64 = Random.randomBase64(32);
			expect(/^[A-Za-z0-9+/]*={0,2}$/.test(base64)).toBe(true);
		});

		it('should generate different base64 strings on each call', () => {
			const base64_1 = Random.randomBase64(16);
			const base64_2 = Random.randomBase64(16);

			expect(base64_1).not.toBe(base64_2);
		});

		it('should handle zero length', () => {
			const base64 = Random.randomBase64(0);
			expect(base64).toBe('');
		});

		it('should be convertible back to buffer', () => {
			const originalLength = 15;
			const base64 = Random.randomBase64(originalLength);
			const buffer = Buffer.from(base64, 'base64');

			expect(buffer.length).toBe(originalLength);
			expect(buffer.toString('base64')).toBe(base64);
		});

		it('should handle padding correctly', () => {
			const testCases = [
				{length: 1, expectedPadding: 2}, // 1 byte -> 4 chars with == padding
				{length: 2, expectedPadding: 1}, // 2 bytes -> 4 chars with = padding
				{length: 3, expectedPadding: 0}, // 3 bytes -> 4 chars with no padding
			];

			testCases.forEach(({length, expectedPadding}) => {
				const base64 = Random.randomBase64(length);
				const paddingCount = (base64.match(/=/g) || []).length;
				expect(paddingCount).toBe(expectedPadding);
			});
		});

		it('should generate statistically different base64 strings', () => {
			const base64Strings = Array.from({length: 50}, () => Random.randomBase64(12));
			const uniqueStrings = new Set(base64Strings);

			expect(uniqueStrings.size).toBe(50);
		});
	});

	describe('Integration tests', () => {
		it('should maintain consistency between methods', () => {
			const length = 16;
			const buffer = Random.randomBytes(length);
			const hex = Random.randomHex(length);
			const base64 = Random.randomBase64(length);

			expect(buffer.length).toBe(length);
			expect(Buffer.from(hex, 'hex').length).toBe(length);
			expect(Buffer.from(base64, 'base64').length).toBe(length);
		});

		it('should generate cryptographically diverse output', () => {
			const samples = Array.from({length: 100}, () => ({
				bytes : Random.randomBytes(8),
				hex   : Random.randomHex(8),
				base64: Random.randomBase64(8)
			}));

			const uniqueHex = new Set(samples.map(s => s.hex));
			const uniqueBase64 = new Set(samples.map(s => s.base64));

			expect(uniqueHex.size).toBe(100);
			expect(uniqueBase64.size).toBe(100);
		});

		it('should handle large data generation efficiently', () => {
			const startTime = Date.now();

			const largeBuffer = Random.randomBytes(1024);
			const largeHex = Random.randomHex(512);
			const largeBase64 = Random.randomBase64(512);

			const endTime = Date.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(1000);
			expect(largeBuffer.length).toBe(1024);
			expect(largeHex.length).toBe(1024);
			expect(largeBase64.length).toBeGreaterThan(0);
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle negative lengths gracefully', () => {
			expect(() => Random.randomBytes(-1)).not.toThrow();
			expect(() => Random.randomHex(-1)).not.toThrow();
			expect(() => Random.randomBase64(-1)).not.toThrow();
		});

		it('should handle very large lengths', () => {
			const largeLength = 10000;

			expect(() => {
				const buffer = Random.randomBytes(largeLength);
				expect(buffer.length).toBe(largeLength);
			}).not.toThrow();

			expect(() => {
				const hex = Random.randomHex(1000);
				expect(hex.length).toBe(2000);
			}).not.toThrow();

			expect(() => {
				const base64 = Random.randomBase64(1000);
				expect(base64.length).toBeGreaterThan(0);
			}).not.toThrow();
		});

		it('should maintain randomness quality across multiple calls', () => {
			const batches = Array.from({length: 10}, () =>
				Array.from({length: 10}, () => Random.randomHex(4))
			);

			const allHex = batches.flat();
			const uniqueHex = new Set(allHex);

			expect(uniqueHex.size).toBeGreaterThan(95);
		});

		it('should generate valid output for boundary lengths', () => {
			const boundaryLengths = [1, 2, 3, 4, 5, 15, 16, 17, 31, 32, 33];

			boundaryLengths.forEach(length => {
				const buffer = Random.randomBytes(length);
				const hex = Random.randomHex(length);
				const base64 = Random.randomBase64(length);

				expect(buffer.length).toBe(length);
				expect(hex.length).toBe(length * 2);
				expect(Buffer.from(base64, 'base64').length).toBe(length);
			});
		});
	});
});
