import {describe, it, expect} from 'vitest';

import pkg, {CoderTools, DataCoder, Serializer, _Buffer, dataCoder, serializer} from '../src/index';

describe('src/index exports', () => {
	it('should export all expected symbols', () => {
		expect(CoderTools).toBeDefined();
		expect(DataCoder).toBeDefined();
		expect(Serializer).toBeDefined();
		expect(_Buffer).toBeDefined();
		expect(dataCoder).toBeInstanceOf(DataCoder);
		expect(serializer).toBeInstanceOf(Serializer);
	});

	it('default export should contain public API', () => {
		expect(pkg).toHaveProperty('CoderTools');
		expect(pkg).toHaveProperty('DataCoder');
		expect(pkg).toHaveProperty('Serializer');
		expect(pkg).toHaveProperty('_Buffer');
		expect(pkg).toHaveProperty('dataCoder');
		expect(pkg).toHaveProperty('serializer');
	});

	it('dataCoder instance should encode/decode simple object', () => {
		const obj = {a: 1, b: 'x'};
		const encoded = dataCoder.encode(obj);
		const decoded = dataCoder.decode(encoded);
		expect(decoded).toEqual(obj);
	});

	it('serializer instance should serialize/deserialize simple object', () => {
		const obj = {x: 1, y: 'y'};
		const buf = serializer.serialize(obj);
		const back = serializer.deserialize(buf) as any;

		expect(Array.isArray(back)).toBe(true);
		expect(back).toEqual([1, 'y']);
	});

	it('_Buffer should be Node Buffer constructor', () => {
		const b = new _Buffer('hi');
		expect(b.toString()).toBe('hi');
	});
});
