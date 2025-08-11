/* eslint-disable @typescript-eslint/strict-boolean-expressions */

export interface Encoding {
	bits: number;
	chars: string;
	codes?: { [char: string]: number };
}

export interface ParseOptions {
	loose?: boolean;
	out?: new (size: number) => { [index: number]: number };
}

export interface StringifyOptions {
	pad?: boolean;
}

export function parse(
	string: string,
	encoding: Encoding,
	opts: ParseOptions = {}
): Uint8Array {
	if (!encoding.codes) {
		encoding.codes = {};
		for (let i = 0; i < encoding.chars.length; ++i) {
			encoding.codes[encoding.chars[i]] = i;
		}
	}

	if (!opts.loose && (string.length * encoding.bits) & 7) {
		throw new SyntaxError('Invalid padding');
	}

	let end = string.length;
	while (string[end - 1] === '=') {
		--end;

		if (!opts.loose && !(((string.length - end) * encoding.bits) & 7)) {
			throw new SyntaxError('Invalid padding');
		}
	}

	const out = new (opts.out || Uint8Array)(
		((end * encoding.bits) / 8) | 0
	) as Uint8Array;

	let bits = 0;
	let buffer = 0;
	let written = 0;
	for (let i = 0; i < end; ++i) {
		const value = encoding.codes[string[i]];
		if (value === undefined) {
			throw new SyntaxError('Invalid character ' + string[i]);
		}

		buffer = (buffer << encoding.bits) | value;
		bits += encoding.bits;

		if (bits >= 8) {
			bits -= 8;
			out[written++] = 0xff & (buffer >> bits);
		}
	}

	if (bits >= encoding.bits || 0xff & (buffer << (8 - bits))) {
		throw new SyntaxError('Unexpected end of data');
	}

	return out;
}

export function stringify(
	data: ArrayLike<number>,
	encoding: Encoding,
	opts: StringifyOptions = {}
): string {
	const {pad = true} = opts;
	const mask = (1 << encoding.bits) - 1;
	let out = '';

	let bits = 0;
	let buffer = 0;

	for (let i = 0; i < data.length; ++i) {
		buffer = (buffer << 8) | (0xff & data[i]);
		bits += 8;

		while (bits > encoding.bits) {
			bits -= encoding.bits;
			out += encoding.chars[mask & (buffer >> bits)];
		}
	}

	if (bits) {
		out += encoding.chars[mask & (buffer << (encoding.bits - bits))];
	}

	if (pad) {
		while ((out.length * encoding.bits) & 7) {
			out += '=';
		}
	}

	return out;
}
