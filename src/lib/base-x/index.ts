// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

const _Buffer = require('buffer').Buffer;

function base(ALPHABET: string): base.BaseConverter {
	if (ALPHABET.length >= 255) throw new TypeError('Alphabet too long');

	const BASE_MAP = new Uint8Array(256);
	for (let j = 0; j < BASE_MAP.length; j++) {
		BASE_MAP[j] = 255;
	}

	for (let i = 0; i < ALPHABET.length; i++) {
		const x = ALPHABET.charAt(i);
		const xc = x.charCodeAt(0);

		if (BASE_MAP[xc] !== 255) throw new TypeError(`${x} is ambiguous`);
		BASE_MAP[xc] = i;
	}

	const BASE = ALPHABET.length;
	const LEADER = ALPHABET.charAt(0);
	const FACTOR = Math.log(BASE) / Math.log(256);
	const iFACTOR = Math.log(256) / Math.log(BASE);

	function encode(source: Buffer | number[] | Uint8Array): string {
		if (Array.isArray(source) || source instanceof Uint8Array) source = _Buffer.from(source);
		if (!_Buffer.isBuffer(source)) throw new TypeError('Expected Buffer');
		if (source.length === 0) return '';

		let zeroes = 0;
		let length = 0;
		let pbegin = 0;
		const pend = source.length;

		while (pbegin !== pend && source[pbegin] === 0) {
			pbegin++;
			zeroes++;
		}

		const size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
		const b58 = new Uint8Array(size);

		while (pbegin !== pend) {
			let carry = source[pbegin];

			let i = 0;
			for (let it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
				carry += (256 * b58[it1]) >>> 0;
				b58[it1] = (carry % BASE) >>> 0;
				carry = (carry / BASE) >>> 0;
			}

			if (carry !== 0) throw new Error('Non-zero carry');
			length = i;
			pbegin++;
		}

		let it2 = size - length;
		while (it2 !== size && b58[it2] === 0) {
			it2++;
		}

		let str = LEADER.repeat(zeroes);
		for (; it2 < size; ++it2) str += ALPHABET.charAt(b58[it2]);

		return str;
	}

	function decodeUnsafe(source: string): Buffer | undefined {
		if (typeof source !== 'string') throw new TypeError('Expected String');
		if (source.length === 0) return _Buffer.alloc(0);

		let psz = 0;

		if (source[psz] === ' ') return;

		let zeroes = 0;
		let length = 0;
		while (source[psz] === LEADER) {
			zeroes++;
			psz++;
		}

		const size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
		const b256 = new Uint8Array(size);

		while (source[psz]) {
			let carry = BASE_MAP[source.charCodeAt(psz)];

			if (carry === 255) return;

			let i = 0;
			for (let it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
				carry += (BASE * b256[it3]) >>> 0;
				b256[it3] = (carry % 256) >>> 0;
				carry = (carry / 256) >>> 0;
			}

			if (carry !== 0) throw new Error('Non-zero carry');
			length = i;
			psz++;
		}

		if (source[psz] === ' ') return;

		let it4 = size - length;
		while (it4 !== size && b256[it4] === 0) {
			it4++;
		}

		const vch = _Buffer.allocUnsafe(zeroes + (size - it4));
		vch.fill(0x00, 0, zeroes);

		let j = zeroes;
		while (it4 !== size) {
			vch[j++] = b256[it4++];
		}

		return vch;
	}

	function decode(string: string): Buffer {
		const buffer = decodeUnsafe(string);
		if (buffer) return buffer;

		throw new Error(`Non-base${BASE} character`);
	}

	return {
		encode      : encode,
		decodeUnsafe: decodeUnsafe,
		decode      : decode
	};
}

export default base;

declare namespace base {
	interface BaseConverter {
		encode(buffer: Buffer | number[] | Uint8Array): string;

		decodeUnsafe(string: string): Buffer | undefined;

		decode(string: string): Buffer;
	}
}
