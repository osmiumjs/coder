import {base32, base64} from '../../lib/rfc4648';
import BaseX            from '../../lib/base-x/index';

export type EncodingResult<TAsBuffer extends boolean = false> = TAsBuffer extends true ? Buffer : string;
export type InputData = string | Buffer;

export interface Base64Variant {
	alphabet: string;
	padding: string;
	name: string;
}

export class BaseEncodingError extends Error {
	constructor(message: string, public readonly operation: string, public readonly encoding: string) {
		super(`${operation} error in ${encoding}: ${message}`);
		this.name = 'BaseEncodingError';
	}
}

/**
 * Base class for all encoding implementations
 */
abstract class BaseEncoder {
	protected static toBuffer(what: InputData, ascii: boolean = false): Buffer {
		const encoding = ascii ? 'ascii' : 'utf8';
		return Buffer.isBuffer(what) ? what : Buffer.from(what, encoding);
	}

	protected static isValidForAlphabet(input: string, alphabet: string): boolean {
		const alphabetSet = new Set(alphabet);
		return Array.from(input).every(char => alphabetSet.has(char));
	}

	protected static baseXEncode(what: InputData, base: string, asAscii: boolean = false, encodingName: string): string {
		try {
			return BaseX(base).encode(BaseEncoder.toBuffer(what, asAscii));
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				encodingName
			);
		}
	}

	protected static baseXDecode<TAsBuffer extends boolean = false>(what: string, base: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false, encodingName: string)
		: EncodingResult<TAsBuffer> {
		try {
			if (!BaseEncoder.isValidForAlphabet(what, base)) {
				throw new Error(`Invalid characters for ${encodingName} alphabet`);
			}

			const b = BaseX(base).decode(what);
			const encoding = asAscii ? 'ascii' : 'utf8';
			return (asBuffer ? b : b.toString(encoding)) as EncodingResult<TAsBuffer>;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				encodingName
			);
		}
	}
}

/**
 * Base16 (Hexadecimal) encoding
 */
export class Base16 extends BaseEncoder {
	private static readonly ALPHABET = '0123456789ABCDEF';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base16.ALPHABET, asAscii, 'Base16');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what.toUpperCase(), Base16.ALPHABET, asBuffer, asAscii, 'Base16');
	}
}

/**
 * Base32 encoding (RFC 4648)
 */
export class Base32 extends BaseEncoder {
	static encode(what: InputData, asAscii = false): string {
		try {
			return base32.stringify(BaseEncoder.toBuffer(what, asAscii));
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				'Base32'
			);
		}
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		try {
			const result = base32.parse(what, {loose: true});
			const encoding = asAscii ? 'ascii' : 'utf8';
			return (asBuffer ? Buffer.from(result) : Buffer.from(result).toString(encoding)) as EncodingResult<TAsBuffer>;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				'Base32'
			);
		}
	}
}

/**
 * Base36 encoding
 */
export class Base36 extends BaseEncoder {
	private static readonly ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base36.ALPHABET, asAscii, 'Base36');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base36.ALPHABET, asBuffer, asAscii, 'Base36');
	}
}

/**
 * Base58 encoding with variants
 */
export class Base58 extends BaseEncoder {
	private static readonly ALPHABETS = {
		BITCOIN: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
		RIPPLE : 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz',
		FLICKR : '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
	};

	// Default Bitcoin variant
	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base58.ALPHABETS.BITCOIN, asAscii, 'Base58');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base58.ALPHABETS.BITCOIN, asBuffer, asAscii, 'Base58');
	}

	// Ripple variant
	static encodeRipple(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base58.ALPHABETS.RIPPLE, asAscii, 'Base58-Ripple');
	}

	static decodeRipple<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base58.ALPHABETS.RIPPLE, asBuffer, asAscii, 'Base58-Ripple');
	}

	// Flickr variant
	static encodeFlickr(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base58.ALPHABETS.FLICKR, asAscii, 'Base58-Flickr');
	}

	static decodeFlickr<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base58.ALPHABETS.FLICKR, asBuffer, asAscii, 'Base58-Flickr');
	}
}

/**
 * Base62 encoding
 */
export class Base62 extends BaseEncoder {
	private static readonly ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base62.ALPHABET, asAscii, 'Base62');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base62.ALPHABET, asBuffer, asAscii, 'Base62');
	}
}

/**
 * Base64 encoding with variants
 */
export class Base64 extends BaseEncoder {
	private static readonly VARIANTS: Record<string, Base64Variant> = {
		STANDARD: {
			alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
			padding : '=',
			name    : 'RFC 4648 Standard'
		},
		URL_SAFE: {
			alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
			padding : '=',
			name    : 'RFC 4648 URL-Safe'
		},
		IMAP    : {
			alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+,',
			padding : '=',
			name    : 'RFC 3501 IMAP'
		},
		BCRYPT  : {
			alphabet: './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
			padding : '',
			name    : 'bcrypt'
		},
		BASH64  : {
			alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@_',
			padding : '=',
			name    : 'bash64'
		}
	};

	// Standard Base64 (RFC 4648)
	static encode(what: InputData, asAscii = false): string {
		try {
			return base64.stringify(BaseEncoder.toBuffer(what, asAscii));
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				'Base64'
			);
		}
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		try {
			const result = base64.parse(what, {loose: true});
			const encoding = asAscii ? 'ascii' : 'utf8';
			return (asBuffer ? Buffer.from(result) : Buffer.from(result).toString(encoding)) as EncodingResult<TAsBuffer>;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				'Base64'
			);
		}
	}

	// URL-Safe variant
	static encodeUrl(what: InputData, asAscii = false): string {
		try {
			return Base64.encode(what, asAscii).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				'Base64URL'
			);
		}
	}

	static decodeUrl<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		try {
			const padded = what + '='.repeat((4 - what.length % 4) % 4);
			const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
			return Base64.decode(base64, asBuffer, asAscii);
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				'Base64URL'
			);
		}
	}

	// IMAP variant
	static encodeIMAP(what: InputData, asAscii = false): string {
		return Base64.encodeVariant(what, 'IMAP', asAscii);
	}

	static decodeIMAP<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return Base64.decodeVariant(what, 'IMAP', asBuffer, asAscii);
	}

	// Generic variant methods
	static encodeVariant(what: InputData, variant: keyof typeof Base64.VARIANTS, asAscii = false): string {
		try {
			const variantConfig = Base64.VARIANTS[variant];
			if (!variantConfig) {
				throw new Error(`Unknown Base64 variant: ${variant}`);
			}

			if (variant === 'STANDARD') {
				return Base64.encode(what, asAscii);
			}

			return BaseX(variantConfig.alphabet).encode(BaseEncoder.toBuffer(what, asAscii));
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				`Base64-${variant}`
			);
		}
	}

	static decodeVariant<TAsBuffer extends boolean = false>(what: string, variant: keyof typeof Base64.VARIANTS, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		try {
			const variantConfig = Base64.VARIANTS[variant];
			if (!variantConfig) {
				throw new Error(`Unknown Base64 variant: ${variant}`);
			}

			if (variant === 'STANDARD') {
				return Base64.decode(what, asBuffer, asAscii);
			}

			const validChars = variantConfig.alphabet + variantConfig.padding;
			if (!BaseEncoder.isValidForAlphabet(what, validChars)) {
				throw new Error(`Invalid characters for Base64-${variant} variant`);
			}

			const b = BaseX(variantConfig.alphabet).decode(what.replace(new RegExp(`\\${variantConfig.padding}+$`), ''));
			const encoding = asAscii ? 'ascii' : 'utf8';
			return (asBuffer ? b : b.toString(encoding)) as EncodingResult<TAsBuffer>;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				`Base64-${variant}`
			);
		}
	}

	static getVariants(): Record<string, Base64Variant> {
		return {...Base64.VARIANTS};
	}
}

/**
 * Base66 encoding
 */
export class Base66 extends BaseEncoder {
	private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base66.ALPHABET, asAscii, 'Base66');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base66.ALPHABET, asBuffer, asAscii, 'Base66');
	}
}

/**
 * Base85 encoding with variants
 */
export class Base85 extends BaseEncoder {
	private static readonly ALPHABETS = {
		RFC1924: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~',
		ASCII85: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu',
		Z85    : '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'
	};

	// Default RFC 1924 variant
	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base85.ALPHABETS.RFC1924, asAscii, 'Base85');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base85.ALPHABETS.RFC1924, asBuffer, asAscii, 'Base85');
	}

	// ASCII85 variant
	static encodeASCII85(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base85.ALPHABETS.ASCII85, asAscii, 'Base85-ASCII85');
	}

	static decodeASCII85<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base85.ALPHABETS.ASCII85, asBuffer, asAscii, 'Base85-ASCII85');
	}

	// Z85 variant
	static encodeZ85(what: InputData, asAscii = false): string {
		try {
			const buf = BaseEncoder.toBuffer(what, asAscii);
			if (buf.length % 4 !== 0) {
				throw new Error('Z85 requires length to be multiple of 4 bytes');
			}
			const alphabet = Base85.ALPHABETS.Z85;
			const divisors = [52200625, 614125, 7225, 85, 1];
			let out = '';
			for (let i = 0; i < buf.length; i += 4) {
				let value = ((buf[i] * 256 + buf[i + 1]) * 256 + buf[i + 2]) * 256 + buf[i + 3];
				for (let j = 0; j < 5; j++) {
					const div = divisors[j];
					const idx = Math.floor(value / div);
					value = value % div;
					out += alphabet[idx];
				}
			}
			return out;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'encode',
				'Base85-Z85'
			);
		}
	}

	static decodeZ85<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		try {
			if (what.length % 5 !== 0) {
				throw new Error('Z85 requires length to be multiple of 5 characters');
			}
			const alphabet = Base85.ALPHABETS.Z85;
			const divisors = [52200625, 614125, 7225, 85, 1];
			const map: Record<string, number> = {};
			for (let i = 0; i < alphabet.length; i++) map[alphabet[i]] = i;

			const out = Buffer.alloc((what.length / 5) * 4);
			let bi = 0;
			for (let i = 0; i < what.length; i += 5) {
				let value = 0;
				for (let j = 0; j < 5; j++) {
					const ch = what[i + j];
					const idx = map[ch];
					if (idx === undefined) {
						throw new Error('Invalid character for Z85 alphabet');
					}
					value += idx * divisors[j];
				}

				out[bi++] = Math.floor(value / 16777216) % 256;
				value %= 16777216;
				out[bi++] = Math.floor(value / 65536) % 256;
				value %= 65536;
				out[bi++] = Math.floor(value / 256) % 256;
				out[bi++] = value % 256;
			}

			const encoding = asAscii ? 'ascii' : 'utf8';
			return (asBuffer ? out : out.toString(encoding)) as EncodingResult<TAsBuffer>;
		} catch (error) {
			throw new BaseEncodingError(
				error instanceof Error ? error.message : 'Unknown error',
				'decode',
				'Base85-Z85'
			);
		}
	}
}

/**
 * Base91 encoding
 */
export class Base91 extends BaseEncoder {
	private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base91.ALPHABET, asAscii, 'Base91');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base91.ALPHABET, asBuffer, asAscii, 'Base91');
	}
}

/**
 * Base93 encoding
 */
export class Base93 extends BaseEncoder {
	private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<>?@[\\]^_`{|}~';

	static encode(what: InputData, asAscii = false): string {
		return BaseEncoder.baseXEncode(what, Base93.ALPHABET, asAscii, 'Base93');
	}

	static decode<TAsBuffer extends boolean = false>(what: string, asBuffer: TAsBuffer = false as TAsBuffer, asAscii = false): EncodingResult<TAsBuffer> {
		return BaseEncoder.baseXDecode(what, Base93.ALPHABET, asBuffer, asAscii, 'Base93');
	}
}

/**
 * Main BaseEncoding class that exports all encoders
 * Maintains backward compatibility while providing new structure
 */
export class BaseEncoding {
	// Export all encoding classes
	static Base16 = Base16;
	static Base32 = Base32;
	static Base36 = Base36;
	static Base58 = Base58;
	static Base62 = Base62;
	static Base64 = Base64;
	static Base66 = Base66;
	static Base85 = Base85;
	static Base91 = Base91;
	static Base93 = Base93;

	/**
	 * Utility methods
	 */
	static getSupportedEncodings(): string[] {
		return [
			'Base16', 'Base32', 'Base36', 'Base58', 'Base62', 'Base64', 'Base66', 'Base85', 'Base91', 'Base93'
		];
	}

	/**
	 * Auto-detect encoding type based on input characteristics
	 */
	static detectEncoding(input: string): string[] {
		const possibleEncodings: string[] = [];

		// Check for Base16 (hex)
		if (/^[0-9A-Fa-f]+$/.test(input)) {
			possibleEncodings.push('Base16');
		}

		// Check for Base32
		if (/^[A-Z2-7]+=*$/.test(input)) {
			possibleEncodings.push('Base32');
		}

		// Check for Base64 variants
		if (/^[A-Za-z0-9+/]+=*$/.test(input)) {
			possibleEncodings.push('Base64-Standard');
		}
		if (/^[A-Za-z0-9\-_]+=*$/.test(input)) {
			possibleEncodings.push('Base64-URL-Safe');
		}

		// Check for Base58
		const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
		const alphabetSet = new Set(base58Alphabet);
		if (Array.from(input).every(char => alphabetSet.has(char))) {
			possibleEncodings.push('Base58');
		}

		return possibleEncodings;
	}
}
