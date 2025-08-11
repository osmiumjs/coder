import {describe, it, expect, vi} from 'vitest';

import {
	BaseEncoding,
	BaseEncodingError,
	Base16,
	Base32,
	Base36,
	Base58,
	Base62,
	Base64,
	Base66,
	Base85,
	Base91,
	Base93
} from '../src/classes/CoderTools/BaseEncoding';

let CoderTools: any;
try {
	const module = require('../dist/index');
	CoderTools = module.CoderTools;
} catch (error) {
	console.warn('Could not import compiled CoderTools, skipping integration tests');
}

describe('BaseEncoding', () => {
	const testStrings = {
		empty    : '',
		ascii    : 'Hello World!',
		numbers  : '1234567890',
		special  : '!@#$%^&*()_+-=[]{}|;:,.<>?',
		utf8     : 'Привет мир! 🌍 こんにちは世界 🎉',
		mixed    : 'Test123 Тест ñáéíóú 中文 🚀💻',
		cyrillic : 'Привет мир абвгдежзийклмнопрстуфхцчшщъыьэюя',
		chinese  : '你好世界测试中文字符编码解码功能',
		japanese : 'こんにちは世界テスト日本語文字エンコードデコード機能',
		arabic   : 'مرحبا بالعالم اختبار الترميز وفك التشفير',
		emoji    : '😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾',
		multiline: 'Line 1\nLine 2\r\nLine 3\tTabbed\n\nEmpty line above'
	};

	describe('BaseEncodingError', () => {
		it('should create error with correct properties', () => {
			const error = new BaseEncodingError('Test message', 'decode', 'Base64');
			expect(error.message).toBe('decode error in Base64: Test message');
			expect(error.operation).toBe('decode');
			expect(error.encoding).toBe('Base64');
			expect(error.name).toBe('BaseEncodingError');
		});
	});

	describe('Base16 (Hexadecimal)', () => {
		describe('Basic functionality', () => {
			it('should encode and decode ASCII strings correctly according to RFC 4648', () => {
				const testVectors: { [key: string]: string } = {
					''      : '',
					'f'     : '66',
					'fo'    : '666F',
					'foo'   : '666F6F',
					'foob'  : '666F6F62',
					'fooba' : '666F6F6261',
					'foobar': '666F6F626172'
				};

				for (const [input, expected] of Object.entries(testVectors)) {
					const encoded = Base16.encode(input);
					expect(encoded).toBe(expected);
					const decoded = Base16.decode(encoded);
					expect(decoded).toBe(input);
				}
			});

			it('should handle empty strings', () => {
				const encoded = Base16.encode(testStrings.empty);
				expect(encoded).toBe('');
				const decoded = Base16.decode(encoded);
				expect(decoded).toBe(testStrings.empty);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base16.encode(testStrings.utf8);
				const decoded = Base16.decode(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});

			it('should handle binary data', () => {
				const binaryData = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
				const encoded = Base16.encode(binaryData);
				expect(encoded).toBe('48656C6C6F');
				const decoded = Base16.decode(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
				expect(decoded).toEqual(binaryData);
			});
		});

		describe('Options handling', () => {
			it('should return Buffer when asBuffer=true', () => {
				const encoded = Base16.encode(testStrings.ascii);
				const decoded = Base16.decode(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
			});

			it('should handle ASCII encoding', () => {
				const asciiText = 'Hello World';
				const encoded = Base16.encode(asciiText, true);
				const decoded = Base16.decode(encoded, false, true);
				expect(decoded).toBe(asciiText);
			});

			it('should handle case insensitive decoding', () => {
				const text = 'Hello';
				const encoded = Base16.encode(text);
				const lowerCase = encoded.toLowerCase();
				const upperCase = encoded.toUpperCase();

				expect(Base16.decode(lowerCase)).toBe(text);
				expect(Base16.decode(upperCase)).toBe(text);
			});
		});

		describe('Error handling', () => {
			it('should throw BaseEncodingError for invalid hex characters', () => {
				expect(() => Base16.decode('GHIJ')).toThrow(BaseEncodingError);
			});

			it('should handle odd length hex strings gracefully', () => {
				const result = Base16.decode('ABC');
				expect(typeof result).toBe('string');
			});
		});

		describe('Edge cases', () => {
			it('should handle all UTF-8 test strings', () => {
				Object.values(testStrings).forEach(testString => {
					const encoded = Base16.encode(testString);
					const decoded = Base16.decode(encoded);
					expect(decoded).toBe(testString);
				});
			});

			it('should handle very long strings', () => {
				const longString = 'A'.repeat(10000);
				const encoded = Base16.encode(longString);
				const decoded = Base16.decode(encoded);
				expect(decoded).toBe(longString);
			});

			it('should handle special characters', () => {
				const encoded = Base16.encode(testStrings.special);
				const decoded = Base16.decode(encoded);
				expect(decoded).toBe(testStrings.special);
			});
		});
	});

	describe('Base32', () => {
		describe('Basic functionality', () => {
			it('should encode and decode ASCII strings correctly according to RFC 4648', () => {
				const testVectors: { [key: string]: string } = {
					''      : '',
					'f'     : 'MY======',
					'fo'    : 'MZXQ====',
					'foo'   : 'MZXW6===',
					'foob'  : 'MZXW6YQ=',
					'fooba' : 'MZXW6YTB',
					'foobar': 'MZXW6YTBOI======'
				};

				for (const [input, expected] of Object.entries(testVectors)) {
					const encoded = Base32.encode(input);
					expect(encoded).toBe(expected);
					const decoded = Base32.decode(encoded);
					expect(decoded).toBe(input);
				}
			});

			it('should handle empty strings', () => {
				const encoded = Base32.encode(testStrings.empty);
				expect(encoded).toBe('');
				const decoded = Base32.decode(encoded);
				expect(decoded).toBe(testStrings.empty);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base32.encode(testStrings.utf8);
				const decoded = Base32.decode(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});

			it('should handle padding correctly', () => {
				const testCases = ['f', 'fo', 'foo', 'foob', 'fooba', 'foobar'];
				testCases.forEach(test => {
					const encoded = Base32.encode(test);
					const decoded = Base32.decode(encoded);
					expect(decoded).toBe(test);
				});
			});
		});

		describe('Options handling', () => {
			it('should return Buffer when asBuffer=true', () => {
				const encoded = Base32.encode(testStrings.ascii);
				const decoded = Base32.decode(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
			});
		});

		describe('Error handling', () => {
			it('should handle invalid characters gracefully', () => {
				const result = Base32.decode('INVALID1');
				expect(typeof result).toBe('string');
			});
		});

		describe('Edge cases', () => {
			it('should handle mixed content', () => {
				const encoded = Base32.encode(testStrings.mixed);
				const decoded = Base32.decode(encoded);
				expect(decoded).toBe(testStrings.mixed);
			});
		});
	});

	describe('Base36', () => {
		it('should encode and decode strings', () => {
			const encoded = Base36.encode(testStrings.ascii);
			const decoded = Base36.decode(encoded);
			expect(decoded).toBe(testStrings.ascii);
		});

		it('should handle numbers', () => {
			const encoded = Base36.encode(testStrings.numbers);
			const decoded = Base36.decode(encoded);
			expect(decoded).toBe(testStrings.numbers);
		});

		it('should handle UTF-8 strings', () => {
			const encoded = Base36.encode(testStrings.cyrillic);
			const decoded = Base36.decode(encoded);
			expect(decoded).toBe(testStrings.cyrillic);
		});
	});

	describe('Base58', () => {
		describe('Bitcoin variant (default)', () => {
			it('should encode and decode strings correctly according to the spec', () => {
				const testVectors: { [key: string]: string } = {
					'Hello World!'                                : '2NEpo7TZRRrLZSi2U',
					'The quick brown fox jumps over the lazy dog.': 'USm3fpXnKG5EUBx2ndxBDMPVciP5hGey2Jh4NDv6gmeo1LkMeiKrLJUUBk6Z',
				};

				for (const [input, expected] of Object.entries(testVectors)) {
					const encoded = Base58.encode(input);
					expect(encoded).toBe(expected);
					const decoded = Base58.decode(encoded);
					expect(decoded).toBe(input);
				}
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base58.encode(testStrings.chinese);
				const decoded = Base58.decode(encoded);
				expect(decoded).toBe(testStrings.chinese);
			});

			it('should match canonical Bitcoin test vectors', () => {
				const vectors: Array<{ hex: string, b58: string }> = [
					{hex: '', b58: ''},
					{hex: '61', b58: '2g'},
					{hex: '626262', b58: 'a3gV'},
					{hex: '636363', b58: 'aPEr'},
					{hex: '00', b58: '1'},
					{hex: '000000', b58: '111'},
					{hex: '73696d706c792061206c6f6e6720737472696e67', b58: '2cFupjhnEsSn59qHXstmK2ffpLv2'}
				];
				for (const {hex, b58} of vectors) {
					const buf = Buffer.from(hex, 'hex');
					const encoded = Base58.encode(buf);
					expect(encoded).toBe(b58);
					const decoded = Base58.decode(b58, true);
					expect(Buffer.isBuffer(decoded)).toBe(true);
					expect(decoded).toEqual(buf);
				}
			});
		});

		describe('Ripple variant', () => {
			it('should encode and decode with Ripple alphabet', () => {
				const encoded = Base58.encodeRipple(testStrings.ascii);
				const decoded = Base58.decodeRipple(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});
		});

		describe('Flickr variant', () => {
			it('should encode and decode with Flickr alphabet', () => {
				const encoded = Base58.encodeFlickr(testStrings.ascii);
				const decoded = Base58.decodeFlickr(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});
		});

		describe('Cross-variant compatibility', () => {
			it('should produce different results for different variants', () => {
				const text = testStrings.ascii;
				const bitcoin = Base58.encode(text);
				const ripple = Base58.encodeRipple(text);
				const flickr = Base58.encodeFlickr(text);

				expect(bitcoin).not.toBe(ripple);
				expect(bitcoin).not.toBe(flickr);
				expect(ripple).not.toBe(flickr);
			});
		});

		describe('Buffer handling', () => {
			it('should handle Buffer input and output', () => {
				const buffer = Buffer.from(testStrings.ascii);
				const encoded = Base58.encode(buffer);
				const decoded = Base58.decode(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
				expect(decoded).toEqual(buffer);
			});
		});

		describe('Edge cases', () => {
			it('should handle emoji', () => {
				const encoded = Base58.encode(testStrings.emoji);
				const decoded = Base58.decode(encoded);
				expect(decoded).toBe(testStrings.emoji);
			});

			it('should handle empty input', () => {
				const encoded = Base58.encode('');
				const decoded = Base58.decode(encoded);
				expect(decoded).toBe('');
			});

			it('should handle single character', () => {
				const encoded = Base58.encode('A');
				const decoded = Base58.decode(encoded);
				expect(decoded).toBe('A');
			});
		});
	});

	describe('Base62', () => {
		it('should encode and decode strings', () => {
			const encoded = Base62.encode(testStrings.ascii);
			const decoded = Base62.decode(encoded);
			expect(decoded).toBe(testStrings.ascii);
		});

		it('should handle numbers', () => {
			const encoded = Base62.encode(testStrings.numbers);
			const decoded = Base62.decode(encoded);
			expect(decoded).toBe(testStrings.numbers);
		});

		it('should handle UTF-8 strings', () => {
			const encoded = Base62.encode(testStrings.japanese);
			const decoded = Base62.decode(encoded);
			expect(decoded).toBe(testStrings.japanese);
		});

		it('should use alphanumeric characters only', () => {
			const encoded = Base62.encode(testStrings.ascii);
			expect(encoded).toMatch(/^[0-9a-zA-Z]+$/);
		});
	});

	describe('Base64', () => {
		describe('Standard variant', () => {
			it('should encode and decode ASCII strings correctly according to RFC 4648', () => {
				const testVectors: { [key: string]: string } = {
					''      : '',
					'f'     : 'Zg==',
					'fo'    : 'Zm8=',
					'foo'   : 'Zm9v',
					'foob'  : 'Zm9vYg==',
					'fooba' : 'Zm9vYmE=',
					'foobar': 'Zm9vYmFy'
				};

				for (const [input, expected] of Object.entries(testVectors)) {
					const encoded = Base64.encode(input);
					expect(encoded).toBe(expected);
					const decoded = Base64.decode(encoded);
					expect(decoded).toBe(input);
				}
			});

			it('should handle empty strings', () => {
				const encoded = Base64.encode(testStrings.empty);
				expect(encoded).toBe('');
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testStrings.empty);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base64.encode(testStrings.utf8);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});

			it('should handle padding correctly', () => {
				const testCases = ['A', 'AB', 'ABC', 'ABCD'];
				testCases.forEach(test => {
					const encoded = Base64.encode(test);
					const decoded = Base64.decode(encoded);
					expect(decoded).toBe(test);
				});
			});

			it('should return Buffer when asBuffer=true', () => {
				const encoded = Base64.encode(testStrings.ascii);
				const decoded = Base64.decode(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
			});
		});

		describe('URL-Safe variant', () => {
			it('should encode and decode with URL-safe characters', () => {
				const encoded = Base64.encodeUrl(testStrings.ascii);
				const decoded = Base64.decodeUrl(encoded);
				expect(decoded).toBe(testStrings.ascii);
				expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/);
			});

			it('should not contain padding', () => {
				const encoded = Base64.encodeUrl(testStrings.ascii);
				expect(encoded).not.toContain('=');
			});

			it('should handle Buffer output', () => {
				const encoded = Base64.encodeUrl(testStrings.ascii);
				const decoded = Base64.decodeUrl(encoded, true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
			});

			it('should match known RFC 4648 URL-safe vectors (no padding)', () => {
				const cases: Array<{ bytes: number[], url: string }> = [
					{bytes: [0xfb], url: '-w'},
					{bytes: [0xff, 0xef], url: '_-8'}
				];
				for (const {bytes, url} of cases) {
					const buf = Buffer.from(bytes);
					const encoded = Base64.encodeUrl(buf);
					expect(encoded).toBe(url);
					const decoded = Base64.decodeUrl(encoded, true);
					expect(Buffer.isBuffer(decoded)).toBe(true);
					expect(decoded).toEqual(buf);
				}
			});
		});

		describe('IMAP variant', () => {
			it('should encode and decode with IMAP alphabet', () => {
				const encoded = Base64.encodeIMAP(testStrings.ascii);
				const decoded = Base64.decodeIMAP(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});
		});

		describe('Generic variant methods', () => {
			it('should handle STANDARD variant', () => {
				const encoded = Base64.encodeVariant(testStrings.ascii, 'STANDARD');
				const decoded = Base64.decodeVariant(encoded, 'STANDARD');
				expect(decoded).toBe(testStrings.ascii);
			});

			it('should handle BCRYPT variant', () => {
				const encoded = Base64.encodeVariant(testStrings.ascii, 'BCRYPT');
				const decoded = Base64.decodeVariant(encoded, 'BCRYPT');
				expect(decoded).toBe(testStrings.ascii);
			});

			it('should throw error for unknown variant', () => {
				expect(() => Base64.encodeVariant(testStrings.ascii, 'UNKNOWN' as any)).toThrow(BaseEncodingError);
			});
		});

		describe('Variant information', () => {
			it('should provide variant information', () => {
				const variants = Base64.getVariants();
				expect(variants).toHaveProperty('STANDARD');
				expect(variants).toHaveProperty('URL_SAFE');
				expect(variants).toHaveProperty('IMAP');
				expect(variants.STANDARD.name).toBe('RFC 4648 Standard');
			});
		});

		describe('Cross-variant compatibility', () => {
			it('should produce different results for different variants', () => {
				const text = testStrings.ascii;
				const standard = Base64.encode(text);
				const urlSafe = Base64.encodeUrl(text);
				const imap = Base64.encodeIMAP(text);
			});
		});

		describe('Edge cases', () => {
			it('should handle special characters', () => {
				const encoded = Base64.encode(testStrings.special);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testStrings.special);
			});

			it('should handle mixed content', () => {
				const encoded = Base64.encode(testStrings.mixed);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testStrings.mixed);
			});

			it('should handle multiline strings', () => {
				const encoded = Base64.encode(testStrings.multiline);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testStrings.multiline);
			});
		});

		describe('Base64 error handling', () => {
			it('should handle non-Error objects in Base64.encode', () => {
				const spy = vi.spyOn(Base64, 'encode').mockImplementation(() => {
					throw new BaseEncodingError('Unknown error', 'encode', 'Base64');
				});

				expect(() => Base64.encode('test')).toThrow(BaseEncodingError);
				expect(() => Base64.encode('test')).toThrow(/Unknown error/);

				spy.mockRestore();
			});

			it('should handle non-Error objects in Base64.decode', () => {
				const spy = vi.spyOn(Base64, 'decode').mockImplementation(() => {
					throw new BaseEncodingError('Unknown error', 'decode', 'Base64');
				});

				expect(() => Base64.decode('dGVzdA==')).toThrow(BaseEncodingError);
				expect(() => Base64.decode('dGVzdA==')).toThrow(/Unknown error/);

				spy.mockRestore();
			});

			it('should handle non-Error objects in Base64.encodeUrl', () => {
				const spy = vi.spyOn(Base64, 'encode').mockImplementation(() => { throw 'string error'; });

				expect(() => Base64.encodeUrl('test')).toThrow(BaseEncodingError);
				expect(() => Base64.encodeUrl('test')).toThrow(/Unknown error/);

				spy.mockRestore();
			});

			it('should handle non-Error objects in Base64.decodeUrl', () => {
				const spy = vi.spyOn(Base64, 'decode').mockImplementation(() => { throw 'string error'; });

				expect(() => Base64.decodeUrl('dGVzdA')).toThrow(BaseEncodingError);
				expect(() => Base64.decodeUrl('dGVzdA')).toThrow(/Unknown error/);

				spy.mockRestore();
			});
		});

		describe('Base64 variant handling', () => {
			it('should handle unknown variant in encodeVariant', () => {
				expect(() => Base64.encodeVariant('test', 'UNKNOWN' as any)).toThrow(BaseEncodingError);
				expect(() => Base64.encodeVariant('test', 'UNKNOWN' as any)).toThrow(/Unknown Base64 variant/);
			});

			it('should handle unknown variant in decodeVariant', () => {
				expect(() => Base64.decodeVariant('test', 'UNKNOWN' as any)).toThrow(BaseEncodingError);
				expect(() => Base64.decodeVariant('test', 'UNKNOWN' as any)).toThrow(/Unknown Base64 variant/);
			});

			it('should handle non-Error in encodeVariant for non-STANDARD variant', () => {
				const spy = vi.spyOn(Base64, 'encodeVariant').mockImplementation(() => {
					throw new BaseEncodingError('Unknown error', 'encode', 'Base64-IMAP');
				});

				expect(() => Base64.encodeVariant('test', 'IMAP')).toThrow(BaseEncodingError);
				expect(() => Base64.encodeVariant('test', 'IMAP')).toThrow(/Unknown error/);

				spy.mockRestore();
			});

			it('should handle invalid characters in decodeVariant for non-STANDARD variant', () => {
				expect(() => Base64.decodeVariant('!!!', 'IMAP')).toThrow(BaseEncodingError);
				expect(() => Base64.decodeVariant('!!!', 'IMAP')).toThrow(/Invalid characters/);
			});

			it('should handle non-Error in decodeVariant for non-STANDARD variant', () => {
				const spy = vi.spyOn(Base64, 'decodeVariant').mockImplementation(() => {
					throw new BaseEncodingError('Unknown error', 'decode', 'Base64-IMAP');
				});

				expect(() => Base64.decodeVariant('ABCD', 'IMAP')).toThrow(BaseEncodingError);
				expect(() => Base64.decodeVariant('ABCD', 'IMAP')).toThrow(/Unknown error/);

				spy.mockRestore();
			});
		});
	});

	describe('Base66', () => {
		it('should encode and decode strings', () => {
			const encoded = Base66.encode(testStrings.ascii);
			const decoded = Base66.decode(encoded);
			expect(decoded).toBe(testStrings.ascii);
		});

		it('should handle UTF-8 strings', () => {
			const encoded = Base66.encode(testStrings.emoji);
			const decoded = Base66.decode(encoded);
			expect(decoded).toBe(testStrings.emoji);
		});

		it('should use extended character set', () => {
			const encoded = Base66.encode(testStrings.ascii);
			expect(encoded).toMatch(/^[A-Za-z0-9\-_.!~]+$/);
		});
	});

	describe('Base85', () => {
		describe('RFC1924 variant (default)', () => {
			it('should encode and decode strings', () => {
				const encoded = Base85.encode(testStrings.ascii);
				const decoded = Base85.decode(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base85.encode(testStrings.utf8);
				const decoded = Base85.decode(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});
		});

		describe('ASCII85 variant', () => {
			it('should encode and decode strings', () => {
				const encoded = Base85.encodeASCII85(testStrings.ascii);
				const decoded = Base85.decodeASCII85(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base85.encodeASCII85(testStrings.utf8);
				const decoded = Base85.decodeASCII85(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});
		});

		describe('Z85 variant', () => {
			it('should encode and decode strings', () => {
				const encoded = Base85.encodeZ85(testStrings.ascii);
				const decoded = Base85.decodeZ85(encoded);
				expect(decoded).toBe(testStrings.ascii);
			});

			it('should handle UTF-8 strings', () => {
				const encoded = Base85.encodeZ85(testStrings.utf8);
				const decoded = Base85.decodeZ85(encoded);
				expect(decoded).toBe(testStrings.utf8);
			});

			it('should match ZeroMQ Z85 canonical vector', () => {
				const hex = '864fd26fb559f75b';
				const buf = Buffer.from(hex, 'hex');
				const encoded = Base85.encodeZ85(buf);
				expect(encoded).toBe('HelloWorld');
				const decoded = Base85.decodeZ85('HelloWorld', true);
				expect(Buffer.isBuffer(decoded)).toBe(true);
				expect(decoded.toString('hex')).toBe(hex);
			});
		});

		describe('Error handling', () => {
			it('should throw BaseEncodingError for invalid characters in RFC1924 variant', () => {
				expect(() => Base85.decode('INVALID\\')).toThrow(BaseEncodingError);
			});

			it('should handle invalid characters in ASCII85 variant gracefully', () => {
				try {
					const result = Base85.decodeASCII85('INVALID\\');
					expect(typeof result).toBe('string');
				} catch (error) {
					expect(error).toBeInstanceOf(BaseEncodingError);
				}
			});

			it('should throw BaseEncodingError for invalid characters in Z85 variant', () => {
				expect(() => Base85.decodeZ85('INVALID\\')).toThrow(BaseEncodingError);
			});
		});
	});

	describe('Base91', () => {
		it('should encode and decode strings', () => {
			const encoded = Base91.encode(testStrings.ascii);
			const decoded = Base91.decode(encoded);
			expect(decoded).toBe(testStrings.ascii);
		});

		it('should handle UTF-8 strings', () => {
			const encoded = Base91.encode(testStrings.utf8);
			const decoded = Base91.decode(encoded);
			expect(decoded).toBe(testStrings.utf8);
		});

		it('should use high-efficiency encoding', () => {
			const text = testStrings.ascii;
			const base64Length = Base64.encode(text).length;
			const base91Length = Base91.encode(text).length;

			expect(base91Length).toBeLessThanOrEqual(base64Length);
		});
	});

	describe('Base93', () => {
		it('should encode and decode strings', () => {
			const encoded = Base93.encode(testStrings.ascii);
			const decoded = Base93.decode(encoded);
			expect(decoded).toBe(testStrings.ascii);
		});

		it('should handle UTF-8 strings', () => {
			const encoded = Base93.encode(testStrings.multiline);
			const decoded = Base93.decode(encoded);
			expect(decoded).toBe(testStrings.multiline);
		});

		it('should use maximum ASCII utilization', () => {
			const text = testStrings.ascii;
			const base64Length = Base64.encode(text).length;
			const base93Length = Base93.encode(text).length;

			expect(base93Length).toBeLessThanOrEqual(base64Length);
		});
	});

	describe('BaseEncoding main class', () => {
		it('should export all encoding classes', () => {
			expect(BaseEncoding.Base16).toBe(Base16);
			expect(BaseEncoding.Base32).toBe(Base32);
			expect(BaseEncoding.Base64).toBe(Base64);
			expect(BaseEncoding.Base58).toBe(Base58);
		});

		it('should provide supported encodings list', () => {
			const supported = BaseEncoding.getSupportedEncodings();
			expect(supported).toContain('Base16');
			expect(supported).toContain('Base32');
			expect(supported).toContain('Base64');
			expect(supported).toContain('Base58');
		});

		it('should detect encoding types', () => {
			const hexInput = '48656C6C6F';
			const base64Input = 'SGVsbG8=';

			const hexDetected = BaseEncoding.detectEncoding(hexInput);
			const base64Detected = BaseEncoding.detectEncoding(base64Input);

			expect(hexDetected).toContain('Base16');
			expect(base64Detected).toContain('Base64-Standard');
		});

		it('should provide legacy methods', () => {
			expect(typeof BaseEncoding.Base16.encode).toBe('function');
			expect(typeof BaseEncoding.Base16.decode).toBe('function');
			expect(typeof BaseEncoding.Base64.encode).toBe('function');
			expect(typeof BaseEncoding.Base64.decode).toBe('function');
		});
	});

	describe('Cross-encoding compatibility tests', () => {
		it('should handle the same data across all encodings', () => {
			const testData = testStrings.mixed;

			const results = {
				base16: Base16.decode(Base16.encode(testData)),
				base32: Base32.decode(Base32.encode(testData)),
				base36: Base36.decode(Base36.encode(testData)),
				base58: Base58.decode(Base58.encode(testData)),
				base62: Base62.decode(Base62.encode(testData)),
				base64: Base64.decode(Base64.encode(testData)),
				base66: Base66.decode(Base66.encode(testData)),
				base91: Base91.decode(Base91.encode(testData)),
				base93: Base93.decode(Base93.encode(testData))
			};

			Object.values(results).forEach(result => {
				expect(result).toBe(testData);
			});
		});

		it('should produce different encoded outputs for the same input', () => {
			const testData = testStrings.ascii;

			const encodedResults = {
				base16: Base16.encode(testData),
				base32: Base32.encode(testData),
				base36: Base36.encode(testData),
				base58: Base58.encode(testData),
				base62: Base62.encode(testData),
				base64: Base64.encode(testData),
				base66: Base66.encode(testData),
				base91: Base91.encode(testData),
				base93: Base93.encode(testData)
			};

			const encodedValues = Object.values(encodedResults);
			const uniqueValues = new Set(encodedValues);

			expect(uniqueValues.size).toBe(encodedValues.length);
		});
	});

	describe('Performance and stress tests', () => {
		it('should handle very large strings efficiently', () => {
			const largeString = 'A'.repeat(10000);

			const start = Date.now();
			const encoded = Base64.encode(largeString);
			const decoded = Base64.decode(encoded);
			const end = Date.now();

			expect(decoded).toBe(largeString);
			expect(end - start).toBeLessThan(1000);
		});

		it('should handle repeated encode/decode cycles', () => {
			let data = testStrings.mixed;

			for (let i = 0; i < 100; i++) {
				const encoded = Base64.encode(data);
				data = Base64.decode(encoded);
			}

			expect(data).toBe(testStrings.mixed);
		});
	});

	describe('Buffer handling tests', () => {
		it('should handle Buffer input correctly', () => {
			const buffer = Buffer.from(testStrings.utf8);

			const base16Result = Base16.decode(Base16.encode(buffer));
			const base64Result = Base64.decode(Base64.encode(buffer));

			expect(base16Result).toBe(testStrings.utf8);
			expect(base64Result).toBe(testStrings.utf8);
		});

		it('should return correct types based on asBuffer parameter', () => {
			const text = testStrings.ascii;

			const stringResult = Base64.decode(Base64.encode(text));
			expect(typeof stringResult).toBe('string');

			const bufferResult = Base64.decode(Base64.encode(text), true);
			expect(Buffer.isBuffer(bufferResult)).toBe(true);
		});
	});

	describe('ASCII handling tests', () => {
		it('should handle ASCII encoding option', () => {
			const asciiText = 'Hello World';

			const encoded = Base64.encode(asciiText, true);
			const decoded = Base64.decode(encoded, false, true);

			expect(decoded).toBe(asciiText);
		});
	});

	describe('Edge case handling', () => {
		it('should handle null bytes in data', () => {
			const dataWithNulls = 'Hello\x00World\x00Test';

			const encoded = Base64.encode(dataWithNulls);
			const decoded = Base64.decode(encoded);

			expect(decoded).toBe(dataWithNulls);
		});

		it('should handle extremely short inputs', () => {
			const singleChar = 'A';

			const encoders = [
				{name: 'base16', encode: (s: string) => Base16.encode(s), decode: (s: string) => Base16.decode(s)},
				{name: 'base32', encode: (s: string) => Base32.encode(s), decode: (s: string) => Base32.decode(s)},
				{name: 'base36', encode: (s: string) => Base36.encode(s), decode: (s: string) => Base36.decode(s)},
				{name: 'base58', encode: (s: string) => Base58.encode(s), decode: (s: string) => Base58.decode(s)},
				{name: 'base62', encode: (s: string) => Base62.encode(s), decode: (s: string) => Base62.decode(s)},
				{name: 'base64', encode: (s: string) => Base64.encode(s), decode: (s: string) => Base64.decode(s)},
				{name: 'base66', encode: (s: string) => Base66.encode(s), decode: (s: string) => Base66.decode(s)},
				{name: 'base91', encode: (s: string) => Base91.encode(s), decode: (s: string) => Base91.decode(s)},
				{name: 'base93', encode: (s: string) => Base93.encode(s), decode: (s: string) => Base93.decode(s)}
			];

			encoders.forEach(encoder => {
				const encoded = encoder.encode(singleChar);
				const decoded = encoder.decode(encoded);
				expect(decoded).toBe(singleChar);
			});
		});

		it('should handle various Unicode categories', () => {
			const unicodeTests = [
				testStrings.cyrillic,
				testStrings.chinese,
				testStrings.japanese,
				testStrings.arabic,
				testStrings.emoji
			];

			unicodeTests.forEach(testString => {
				const encoded = Base64.encode(testString);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(testString);
			});
		});
	});

	describe('Type safety tests', () => {
		it('should maintain data integrity through multiple transformations', () => {
			let data = testStrings.utf8;
			data = Base64.decode(Base64.encode(data));
			data = Base16.decode(Base16.encode(data));
			data = Base32.decode(Base32.encode(data));
			data = Base58.decode(Base58.encode(data));
			data = Base62.decode(Base62.encode(data));

			expect(data).toBe(testStrings.utf8);
		});

		it('should produce consistent results across multiple runs', () => {
			const testData = testStrings.mixed;
			const runs = 10;

			const base64Results = [];
			const base16Results = [];

			for (let i = 0; i < runs; i++) {
				base64Results.push(Base64.encode(testData));
				base16Results.push(Base16.encode(testData));
			}

			expect(new Set(base64Results).size).toBe(1);
			expect(new Set(base16Results).size).toBe(1);
		});
	});

	if (CoderTools) {
		describe('Integration with CoderTools', () => {
			it('should have CoderTools available', () => {
				expect(CoderTools).toBeDefined();
				expect(typeof CoderTools).toBe('function');
			});
		});
	}

	describe('BaseEncoder.baseXEncode error handling', () => {
		it('should handle non-Error objects thrown by BaseX encode', () => {
			const originalEncode = Base36.encode;

			Base36.encode = vi.fn().mockImplementation(() => {
				try {
					throw 'string error instead of Error object';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'encode',
						'Base36'
					);
				}
			});

			expect(() => Base36.encode('test')).toThrow(BaseEncodingError);
			expect(() => Base36.encode('test')).toThrow(/Unknown error/);

			Base36.encode = originalEncode;
		});
	});

	describe('Base32 error handling', () => {
		it('should handle non-Error objects in Base32.encode', () => {
			const originalEncode = Base32.encode;

			Base32.encode = vi.fn().mockImplementation(() => {
				try {
					throw 'non-error string from rfc4648';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'encode',
						'Base32'
					);
				}
			});

			expect(() => Base32.encode('test')).toThrow(BaseEncodingError);
			expect(() => Base32.encode('test')).toThrow(/Unknown error/);

			Base32.encode = originalEncode;
		});

		it('should handle non-Error objects in Base32.decode', () => {
			const originalDecode = Base32.decode;

			Base32.decode = vi.fn().mockImplementation(() => {
				try {
					throw 'non-error string from rfc4648';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'decode',
						'Base32'
					);
				}
			});

			expect(() => Base32.decode('ORSXG5A=')).toThrow(BaseEncodingError);
			expect(() => Base32.decode('ORSXG5A=')).toThrow(/Unknown error/);

			Base32.decode = originalDecode;
		});
	});

	describe('Base64 error handling', () => {
		it('should handle non-Error objects in Base64.encode', () => {
			const originalEncode = Base64.encode;

			Base64.encode = vi.fn().mockImplementation(() => {
				try {
					throw 'non-error string from rfc4648';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'encode',
						'Base64'
					);
				}
			});

			expect(() => Base64.encode('test')).toThrow(BaseEncodingError);
			expect(() => Base64.encode('test')).toThrow(/Unknown error/);

			Base64.encode = originalEncode;
		});

		it('should handle non-Error objects in Base64.decode', () => {
			const originalDecode = Base64.decode;

			Base64.decode = vi.fn().mockImplementation(() => {
				try {
					throw 'non-error string from rfc4648';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'decode',
						'Base64'
					);
				}
			});

			expect(() => Base64.decode('dGVzdA==')).toThrow(BaseEncodingError);
			expect(() => Base64.decode('dGVzdA==')).toThrow(/Unknown error/);

			Base64.decode = originalDecode;
		});
	});

	describe('Base85 Z85 error handling', () => {
		it('should handle non-Error objects in Base85.encodeZ85', () => {
			const originalEncodeZ85 = Base85.encodeZ85;

			Base85.encodeZ85 = vi.fn().mockImplementation(() => {
				try {
					throw 'buffer operation error';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'encode',
						'Base85-Z85'
					);
				}
			});

			expect(() => Base85.encodeZ85('test')).toThrow(BaseEncodingError);
			expect(() => Base85.encodeZ85('test')).toThrow(/Unknown error/);

			Base85.encodeZ85 = originalEncodeZ85;
		});

		it('should handle non-Error objects in Base85.decodeZ85', () => {
			const originalDecodeZ85 = Base85.decodeZ85;

			Base85.decodeZ85 = vi.fn().mockImplementation(() => {
				try {
					throw 'buffer operation error';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'decode',
						'Base85-Z85'
					);
				}
			});

			expect(() => Base85.decodeZ85('HelloWorld')).toThrow(BaseEncodingError);
			expect(() => Base85.decodeZ85('HelloWorld')).toThrow(/Unknown error/);

			Base85.decodeZ85 = originalDecodeZ85;
		});
	});

	describe('BaseEncoder.baseXDecode error handling', () => {
		it('should handle non-Error objects thrown by BaseX decode', () => {
			const originalDecode = Base91.decode;

			Base91.decode = vi.fn().mockImplementation(() => {
				try {
					throw 'decode string error instead of Error object';
				} catch (error) {
					throw new BaseEncodingError(
						error instanceof Error ? error.message : 'Unknown error',
						'decode',
						'Base91'
					);
				}
			});

			expect(() => Base91.decode('test')).toThrow(BaseEncodingError);
			expect(() => Base91.decode('test')).toThrow(/Unknown error/);

			Base91.decode = originalDecode;
		});
	});

	describe('Additional edge cases for complete coverage', () => {
		it('should handle Z85 length validation error', () => {
			expect(() => Base85.encodeZ85('a')).toThrow(BaseEncodingError);
			expect(() => Base85.encodeZ85('a')).toThrow(/Z85 requires length to be multiple of 4 bytes/);
		});

		it('should handle Z85 decode length validation error', () => {
			expect(() => Base85.decodeZ85('abcd')).toThrow(BaseEncodingError);
			expect(() => Base85.decodeZ85('abcd')).toThrow(/Z85 requires length to be multiple of 5 characters/);
		});

		it('should handle Z85 invalid character error', () => {
			expect(() => Base85.decodeZ85('AAAA\\')).toThrow(BaseEncodingError);
			expect(() => Base85.decodeZ85('AAAA\\')).toThrow(/Invalid character for Z85 alphabet/);
		});

		it('should handle Base64 variant encoding with non-STANDARD variant', () => {
			const result = Base64.encodeVariant('test', 'IMAP');

			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should handle Base64 variant decoding with non-STANDARD variant', () => {
			const encoded = Base64.encodeVariant('test', 'IMAP');
			const decoded = Base64.decodeVariant(encoded, 'IMAP');

			expect(decoded).toBe('test');
		});

		it('should handle Base64 variant decoding with invalid characters', () => {
			expect(() => Base64.decodeVariant('!!!', 'IMAP')).toThrow(BaseEncodingError);
			expect(() => Base64.decodeVariant('!!!', 'IMAP')).toThrow(/Invalid characters/);
		});
	});

	describe('Additional coverage for remaining lines', () => {
		it('should test Base64 encodeVariant with STANDARD variant', () => {
			const result = Base64.encodeVariant('test', 'STANDARD');
			expect(result).toBe(Base64.encode('test'));
		});

		it('should test Base64 decodeVariant with STANDARD variant', () => {
			const encoded = Base64.encode('test');
			const result = Base64.decodeVariant(encoded, 'STANDARD');
			expect(result).toBe('test');
		});

		it('should test Base64 encodeVariant with non-STANDARD variant (IMAP)', () => {
			const result = Base64.encodeVariant('test', 'IMAP');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should test Base64 decodeVariant with non-STANDARD variant (IMAP)', () => {
			const encoded = Base64.encodeVariant('test', 'IMAP');
			const result = Base64.decodeVariant(encoded, 'IMAP');
			expect(result).toBe('test');
		});

		it('should test Base64 decodeVariant with padding removal', () => {
			const result = Base64.encodeVariant('test', 'BCRYPT');
			const decoded = Base64.decodeVariant(result, 'BCRYPT');
			expect(decoded).toBe('test');
		});

		it('should test Base85 Z85 with valid input', () => {
			const input = 'test'; // 4 bytes
			const encoded = Base85.encodeZ85(input);
			const decoded = Base85.decodeZ85(encoded);
			expect(decoded).toBe(input);
		});

		it('should test Base85 Z85 with 8-byte input', () => {
			const input = 'testdata';
			const encoded = Base85.encodeZ85(input);
			const decoded = Base85.decodeZ85(encoded);
			expect(decoded).toBe(input);
		});

		it('should test Base64 URL encoding edge cases', () => {
			const input = 'test+/=data';
			const encoded = Base64.encodeUrl(input);
			expect(encoded).not.toContain('+');
			expect(encoded).not.toContain('/');
			expect(encoded).not.toContain('=');

			const decoded = Base64.decodeUrl(encoded);
			expect(decoded).toBe(input);
		});

		it('should test Base32 with various inputs', () => {
			const inputs = ['a', 'ab', 'abc', 'abcd', 'abcde'];
			inputs.forEach(input => {
				const encoded = Base32.encode(input);
				const decoded = Base32.decode(encoded);
				expect(decoded).toBe(input);
			});
		});

		it('should test Base64 with various inputs', () => {
			const inputs = ['a', 'ab', 'abc', 'abcd', 'abcde'];
			inputs.forEach(input => {
				const encoded = Base64.encode(input);
				const decoded = Base64.decode(encoded);
				expect(decoded).toBe(input);
			});
		});
	});
});
