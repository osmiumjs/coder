import {fail}                 from 'node:assert';
import {describe, it, expect} from 'vitest';

import {
	BaseEncoding,
	Base16,
	Base32,
	Base64,
	Base58,
	BaseEncodingError
} from '../src/classes/CoderTools/BaseEncoding';

describe('BaseEncoding Usage Examples', () => {
	describe('Basic Usage Patterns', () => {
		it('should demonstrate simple string encoding/decoding', () => {
			const originalText = 'Hello, World!';

			const base64Encoded = Base64.encode(originalText);
			const base64Decoded = Base64.decode(base64Encoded);

			expect(base64Decoded).toBe(originalText);
			expect(base64Encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
		});

		it('should demonstrate binary data handling', () => {
			const binaryData = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"

			const encoded = Base16.encode(binaryData);
			expect(encoded).toBe('48656C6C6F');

			const decoded = Base16.decode(encoded, true); // asBuffer = true
			expect(Buffer.isBuffer(decoded)).toBe(true);
			expect(decoded).toEqual(binaryData);
		});

		it('should demonstrate UTF-8 text handling', () => {
			const utf8Text = 'Привет, мир! 🌍 你好世界';

			const base64Result = Base64.decode(Base64.encode(utf8Text));
			const base32Result = Base32.decode(Base32.encode(utf8Text));
			const base16Result = Base16.decode(Base16.encode(utf8Text));

			expect(base64Result).toBe(utf8Text);
			expect(base32Result).toBe(utf8Text);
			expect(base16Result).toBe(utf8Text);
		});
	});

	describe('Advanced Usage Patterns', () => {
		it('should demonstrate Base64 URL-safe encoding', () => {
			const textWithSpecialChars = 'Hello+World/Test=';
			const standardEncoded = Base64.encode(textWithSpecialChars);

			const urlSafeEncoded = Base64.encodeUrl(textWithSpecialChars);
			const urlSafeDecoded = Base64.decodeUrl(urlSafeEncoded);

			expect(urlSafeDecoded).toBe(textWithSpecialChars);
			expect(urlSafeEncoded).not.toMatch(/[+/=]/);
		});

		it('should demonstrate Base58 variants', () => {
			const data = 'Bitcoin address data';

			const bitcoinEncoded = Base58.encode(data);           // Default Bitcoin
			const rippleEncoded = Base58.encodeRipple(data);      // Ripple network
			const flickrEncoded = Base58.encodeFlickr(data);      // Flickr URLs

			expect(Base58.decode(bitcoinEncoded)).toBe(data);
			expect(Base58.decodeRipple(rippleEncoded)).toBe(data);
			expect(Base58.decodeFlickr(flickrEncoded)).toBe(data);

			expect(bitcoinEncoded).not.toBe(rippleEncoded);
			expect(bitcoinEncoded).not.toBe(flickrEncoded);
		});

		it('should demonstrate encoding detection', () => {
			const originalText = 'Test data';
			const hexEncoded = Base16.encode(originalText);      // "546573742064617461"
			const base32Encoded = Base32.encode(originalText);   // "KRSXG5BAORUGKIDUN5XGO==="
			const base64Encoded = Base64.encode(originalText);   // "VGVzdCBkYXRh"

			const hexDetected = BaseEncoding.detectEncoding(hexEncoded);
			const base32Detected = BaseEncoding.detectEncoding(base32Encoded);
			const base64Detected = BaseEncoding.detectEncoding(base64Encoded);

			expect(hexDetected).toContain('Base16');
			expect(base32Detected).toContain('Base32');
			expect(base64Detected).toContain('Base64-Standard');
		});

		it('should demonstrate error handling patterns', () => {
			try {
				Base16.decode('INVALID_HEX_G'); // Contains invalid character 'G'
				fail('Should have thrown an error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);

				expect((error as BaseEncodingError).encoding).toBe('Base16');
				expect((error as BaseEncodingError).message).toContain('Invalid characters');
			}
		});
	});

	describe('Performance Optimization Examples', () => {
		it('should demonstrate efficient large data handling', () => {
			const largeData = 'x'.repeat(10000);

			const startTime = performance.now();

			const encoded = Base64.encode(largeData);
			const decoded = Base64.decode(encoded);

			const endTime = performance.now();
			const processingTime = endTime - startTime;

			expect(decoded).toBe(largeData);
			expect(processingTime).toBeLessThan(100);
		});

		it('should demonstrate batch processing pattern', () => {
			const dataItems = [
				'Item 1 data',
				'Item 2 with UTF-8: 测试',
				'Item 3 with emoji: 🚀',
				'Item 4 with special chars: !@#$%'
			];

			const encodedItems = dataItems.map(item => Base64.encode(item));
			const decodedItems = encodedItems.map(encoded => Base64.decode(encoded));

			expect(decodedItems).toEqual(dataItems);
		});
	});

	describe('Integration Examples', () => {
		it('should demonstrate chaining different encodings', () => {
			const originalData = 'Multi-step encoding test 🔄';

			let processed = originalData;
			processed = Base64.encode(processed);
			processed = Base16.encode(processed);
			processed = Base32.encode(processed);

			processed = Base32.decode(processed) as string;
			processed = Base16.decode(processed) as string;
			processed = Base64.decode(processed) as string;

			expect(processed).toBe(originalData);
		});

		it('should demonstrate data validation workflow', () => {
			const userData = 'User input data: 用户数据 🔐';
			const encoded = Base64.encode(userData);

			const detectedEncodings = BaseEncoding.detectEncoding(encoded);
			expect(detectedEncodings).toContain('Base64-Standard');

			const decoded = Base64.decode(encoded);
			expect(decoded).toBe(userData);

			expect(decoded.length).toBe(userData.length);
		});

		it('should demonstrate format conversion', () => {
			const binaryData = Buffer.from('Binary data example', 'utf8');

			const formats = {
				hex   : Base16.encode(binaryData),
				base32: Base32.encode(binaryData),
				base64: Base64.encode(binaryData),
				base58: Base58.encode(binaryData)
			};

			expect(Base16.decode(formats.hex, true)).toEqual(binaryData);
			expect(Base32.decode(formats.base32, true)).toEqual(binaryData);
			expect(Base64.decode(formats.base64, true)).toEqual(binaryData);
			expect(Base58.decode(formats.base58, true)).toEqual(binaryData);

			const formatValues = Object.values(formats);
			const uniqueFormats = new Set(formatValues);
			expect(uniqueFormats.size).toBe(formatValues.length);
		});
	});

	describe('Real-world Use Cases', () => {
		it('should demonstrate URL-safe identifier generation', () => {
			const userId = 'user_12345';
			const timestamp = Date.now().toString();
			const sessionData = `${userId}:${timestamp}`;

			const token = Base64.encodeUrl(sessionData);

			expect(token).not.toMatch(/[+/=]/);

			const decodedSession = Base64.decodeUrl(token);
			expect(decodedSession).toBe(sessionData);

			const [decodedUserId, decodedTimestamp] = decodedSession.split(':');
			expect(decodedUserId).toBe(userId);
			expect(decodedTimestamp).toBe(timestamp);
		});

		it('should demonstrate file content encoding', () => {
			const fileContent = JSON.stringify({
				filename: 'test_файл.txt',
				content : 'File content with UTF-8: 测试内容 🗂️',
				metadata: {
					size   : 1024,
					created: new Date().toISOString()
				}
			});

			const encodedContent = Base64.encode(fileContent);

			const decodedContent = Base64.decode(encodedContent);
			const parsedContent = JSON.parse(decodedContent);

			expect(parsedContent.filename).toBe('test_файл.txt');
			expect(parsedContent.content).toContain('测试内容 🗂️');
			expect(parsedContent.metadata.size).toBe(1024);
		});

		it('should demonstrate cryptocurrency address encoding', () => {
			const addressData = 'cryptocurrency_address_data_example';

			const bitcoinAddress = Base58.encode(addressData);
			const rippleAddress = Base58.encodeRipple(addressData);

			expect(bitcoinAddress).not.toMatch(/[0OIl]/);

			expect(Base58.decode(bitcoinAddress)).toBe(addressData);
			expect(Base58.decodeRipple(rippleAddress)).toBe(addressData);

			expect(bitcoinAddress).not.toBe(rippleAddress);
		});

		it('should demonstrate data integrity verification', () => {
			const importantData = 'Critical system data 🔒 重要数据';
			const transmittedData = Base64.encode(importantData);

			try {
				const decoded = Base64.decode(transmittedData);
				expect(decoded).toBe(importantData);

				expect(decoded.length).toBe(importantData.length);
				expect(decoded.includes('🔒')).toBe(true);
				expect(decoded.includes('重要数据')).toBe(true);

			} catch (error) {
				fail('Data integrity check failed');
			}
		});
	});

	describe('Best Practices Examples', () => {
		it('should demonstrate graceful error handling', () => {
			const testCases = [
				{input: 'INVALID_HEX_G', decoder: Base16.decode, encoding: 'Base16'},
				{input: '189', decoder: Base32.decode, encoding: 'Base32'},
				{input: '!!!', decoder: Base64.decode, encoding: 'Base64'}
			];

			testCases.forEach(({input, decoder, encoding}) => {
				try {
					decoder(input);
				} catch (error) {
					expect(error).toBeInstanceOf(Error);
				}
			});
		});

		it('should demonstrate input validation', () => {
			const validateAndEncode = (input: string, encoding: 'base64' | 'base16' | 'base32') => {
				if (typeof input !== 'string') {
					throw new Error('Input must be a string');
				}

				if (input.length === 0) {
					return '';
				}

				try {
					switch (encoding) {
						case 'base64':
							return Base64.encode(input);
						case 'base16':
							return Base16.encode(input);
						case 'base32':
							return Base32.encode(input);
						default:
							throw new Error('Unsupported encoding');
					}
				} catch (error) {
					throw new Error(`Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			};

			expect(validateAndEncode('test', 'base64')).toBe('dGVzdA==');
			expect(validateAndEncode('', 'base64')).toBe('');

			expect(() => validateAndEncode('test', 'invalid' as any)).toThrow('Unsupported encoding');
		});

		it('should demonstrate performance monitoring', () => {
			const performanceTest = (data: string, iterations: number = 1000) => {
				const results = {
					encoding   : 0,
					decoding   : 0,
					totalTime  : 0,
					averageTime: 0
				};

				const startTime = performance.now();

				const encodeStart = performance.now();
				let encoded = '';
				for (let i = 0; i < iterations; i++) {
					encoded = Base64.encode(data);
				}
				results.encoding = performance.now() - encodeStart;

				const decodeStart = performance.now();
				let decoded = '';
				for (let i = 0; i < iterations; i++) {
					decoded = Base64.decode(encoded) as string;
				}
				results.decoding = performance.now() - decodeStart;

				results.totalTime = performance.now() - startTime;
				results.averageTime = results.totalTime / iterations;

				expect(decoded).toBe(data);

				return results;
			};

			const testData = 'Performance test data 性能测试 🚀';
			const results = performanceTest(testData, 100);

			expect(results.averageTime).toBeLessThan(1);
			expect(results.totalTime).toBeLessThan(100);
		});
	});
});
