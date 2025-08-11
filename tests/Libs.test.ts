import {describe, it, expect}            from 'vitest';
import {CRC32}                           from '../src/lib/crc/crc32';
import {parse, stringify, type Encoding} from '../src/lib/rfc4648/codec';

describe('Libs', () => {
	describe('CRC32', () => {
		it('should match known vector for \'123456789\'', () => {
			// Known CRC32 for "123456789"
			const crc = CRC32.calc('123456789');
			expect(crc >>> 0).toBe(0xCBF43926);
		});

		it('should accept Uint8Array and produce same CRC', () => {
			const data = new TextEncoder().encode('data');
			const crcFromString = CRC32.calc('data');
			const crcFromBytes = CRC32.calc(data);
			expect(crcFromBytes).toBe(crcFromString);
		});
	});

	describe('rfc4648/codec error branches', () => {
		const base64Encoding: Encoding = {
			chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
			bits : 6
		};

		it('parse should throw on invalid padding (strict)', () => {
			// Single base64 character without proper padding => invalid
			expect(() => parse('A', base64Encoding, {loose: false})).toThrowError(/Invalid padding/);
		});

		it('parse should throw on invalid character', () => {
			// Use length divisible by 4 to pass padding check, then include invalid '@'
			expect(() => parse('AA@A', base64Encoding, {loose: false})).toThrowError(/Invalid character/);
		});

		it('stringify should pad correctly and be reversible', () => {
			const input = new Uint8Array([0xfb]); // 0xfb => "+/8=" in std base64
			const out = stringify(input, base64Encoding, {pad: true});
			// Must end with '=' padding
			expect(out.endsWith('=')).toBe(true);
			// parse should succeed round-trip
			const back = parse(out, base64Encoding, {loose: false});
			expect(Array.from(back)).toEqual(Array.from(input));
		});
	});
});
