import {describe, it, expect} from 'vitest';
import {BufferUtils}          from '../src/classes/CoderTools/BufferUtils';

describe('BufferUtils', () => {
	describe('isBuffer method', () => {
		it('should return true for Buffer', () => {
			expect(BufferUtils.isBuffer(Buffer.from('a'))).toBe(true);
		});

		it('should return true for Uint8Array', () => {
			expect(BufferUtils.isBuffer(new Uint8Array([1]))).toBe(true);
		});

		it('should return false for string', () => {
			expect(BufferUtils.isBuffer('a')).toBe(false);
		});

		it('should return false for null', () => {
			expect(BufferUtils.isBuffer(null)).toBe(false);
		});
	});

	describe('makeWBuffer method', () => {
		it('should create buffer', () => {
			const result = BufferUtils.makeWBuffer(() => {}, 2);
			expect(result.length).toBe(2);
		});

		it('should allow modification', () => {
			const result = BufferUtils.makeWBuffer((buf) => {
				buf.writeUInt8(65, 0);
			}, 1);
			expect(result.readUInt8(0)).toBe(65);
		});
	});

	describe('toBuffer method', () => {
		it('should convert string', () => {
			const result = BufferUtils.toBuffer('A');
			expect(result.toString()).toBe('A');
		});

		it('should return buffer as-is', () => {
			const buf = Buffer.from('A');
			expect(BufferUtils.toBuffer(buf)).toBe(buf);
		});
	});

	describe('concatBuffers method', () => {
		it('should concat two buffers', () => {
			const buf1 = Buffer.from('A');
			const buf2 = Buffer.from('B');
			const result = BufferUtils.concatBuffers(buf1, buf2);
			expect(result.toString()).toBe('AB');
		});
	});

	describe('splitBuffer method', () => {
		it('should split buffer', () => {
			const buf = Buffer.from('AB');
			const result = BufferUtils.splitBuffer(buf, 1);
			expect(result).toHaveLength(2);
			expect(result[0].toString()).toBe('A');
		});
	});

	describe('stringToBytes method', () => {
		it('should convert to bytes', () => {
			const result = BufferUtils.stringToBytes('A');
			expect(result[0]).toBe(65);
		});
	});

	describe('bytesToString method', () => {
		it('should convert to string', () => {
			const bytes = new Uint8Array([65]);
			const result = BufferUtils.bytesToString(bytes);
			expect(result).toBe('A');
		});
	});

	describe('Additional coverage', () => {
		it('toBuffer should honor ascii encoding when ascii=true', () => {
			const asciiInput = '\x41\x42\x43';
			const bufAscii = BufferUtils.toBuffer(asciiInput, true);
			const bufUtf8 = BufferUtils.toBuffer(asciiInput, false);

			expect(Buffer.isBuffer(bufAscii)).toBe(true);
			expect(Buffer.isBuffer(bufUtf8)).toBe(true);
			expect(bufAscii.toString('ascii')).toBe(asciiInput);
			expect(bufUtf8.toString('utf8')).toBe(asciiInput);
		});
	});
});
