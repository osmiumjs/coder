import {describe, it, expect, vi} from 'vitest';
import {Validations}              from '../src/classes/CoderTools';

describe('Validations', () => {
	it('isValidBase64 should detect valid/invalid strings', () => {
		// Valid base64
		expect(Validations.isValidBase64('')).toBe(true); // empty string treated as valid round-trip
		expect(Validations.isValidBase64('SGVsbG8=')).toBe(true); // "Hello"
		expect(Validations.isValidBase64('TQ==')).toBe(true); // "M"
		expect(Validations.isValidBase64('YWJjZA==')).toBe(true); // "abcd"

		// Invalid base64
		expect(Validations.isValidBase64('invalid base64!')).toBe(false);
		expect(Validations.isValidBase64('****')).toBe(false);
	});

	it('isValidHex should validate hex strings (even length only)', () => {
		expect(Validations.isValidHex('')).toBe(true);
		expect(Validations.isValidHex('0A1B')).toBe(true);
		expect(Validations.isValidHex('0a1b')).toBe(true);
		expect(Validations.isValidHex('ABCDEF012345')).toBe(true);

		// Odd length or bad chars
		expect(Validations.isValidHex('A')).toBe(false);
		expect(Validations.isValidHex('ZZ')).toBe(false);
	});

	it('isValidBinary should validate binary strings', () => {
		expect(Validations.isValidBinary('')).toBe(true);
		expect(Validations.isValidBinary('010101')).toBe(true);
		expect(Validations.isValidBinary('10101000')).toBe(true);
		expect(Validations.isValidBinary('0102')).toBe(false);
	});

	it('urlSafeEncode/urlSafeDecode round-trip', () => {
		const original = 'Hello World!:/?#[]@!$&\'()*+,;=';
		const encoded = Validations.urlSafeEncode(original);
		const decoded = Validations.urlSafeDecode(encoded);
		expect(decoded).toBe(original);

		expect(encoded).toMatch(/%[0-9A-F]{2}/);
	});

	it('generateUUID should produce valid v4 UUID and isValidUUID should verify it', () => {
		const uuid = Validations.generateUUID();
		expect(typeof uuid).toBe('string');
		expect(Validations.isValidUUID(uuid)).toBe(true);

		expect(Validations.isValidUUID('not-a-uuid')).toBe(false);
		expect(Validations.isValidUUID('12345678-1234-1234-1234-1234567890ab')).toBe(false); // wrong version nibble
	});

	it('isValidBase64 should return false when Buffer.from throws', () => {
		const spy = vi.spyOn(Buffer, 'from').mockImplementationOnce(() => { throw new Error('boom'); });
		expect(Validations.isValidBase64('SGVsbG8=')).toBe(false);
		spy.mockRestore();
	});
});
