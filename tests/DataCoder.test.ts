import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {DataCoder, DataCoderOptions}                     from '../src/classes/DataCoder';

describe('DataCoder', () => {
	let dataCoder: DataCoder;

	beforeEach(() => {
		dataCoder = new DataCoder();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should create instance with default options', () => {
			const coder = new DataCoder();
			expect(coder).toBeInstanceOf(DataCoder);
		});

		it('should create instance with custom options', () => {
			const options = {
				encodeUndefinedAsNil: true,
				largeBigIntToFloat  : true,
				structuredClone     : false
			};
			const coder = new DataCoder(options);
			expect(coder).toBeInstanceOf(DataCoder);
		});

		it('should accept external packr instance', () => {
			const {Packr} = require('msgpackr');
			const externalPackr = new Packr();
			const coder = new DataCoder({}, externalPackr);
			expect(coder).toBeInstanceOf(DataCoder);
		});
	});

	describe('Basic encoding/decoding', () => {
		it('should encode and decode primitives', () => {
			const testValues = [
				null,
				undefined,
				true,
				false,
				0,
				42,
				-42,
				3.14,
				'hello',
				'',
				'🚀 Unicode test'
			];

			testValues.forEach(value => {
				const encoded = dataCoder.encode(value);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(value);
			});
		});

		it('should encode and decode arrays', () => {
			const testArrays = [
				[],
				[1, 2, 3],
				['a', 'b', 'c'],
				[null, undefined, true, false],
				[[1, 2], [3, 4]],
				[{a: 1}, {b: 2}]
			];

			testArrays.forEach(array => {
				const encoded = dataCoder.encode(array);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(array);
			});
		});

		it('should encode and decode objects', () => {
			const testObjects = [
				{},
				{a: 1, b: 2},
				{nested: {deep: {value: 42}}},
				{array: [1, 2, 3], string: 'test', number: 42}
			];

			testObjects.forEach(obj => {
				const encoded = dataCoder.encode(obj);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(obj);
			});
		});

		it('should encode and decode Buffers', () => {
			const testBuffers = [
				Buffer.from(''),
				Buffer.from('hello'),
				Buffer.from([1, 2, 3, 4, 5]),
				Buffer.alloc(1000, 0x42)
			];

			testBuffers.forEach(buffer => {
				const encoded = dataCoder.encode(buffer);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(buffer);
			});
		});

		it('should encode and decode Dates', () => {
			const testDates = [
				new Date(),
				new Date('2023-01-01'),
				new Date(0),
				new Date('1970-01-01T00:00:00.000Z')
			];

			testDates.forEach(date => {
				const encoded = dataCoder.encode(date);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(date);
			});
		});
	});

	describe('Built-in Map and Set support', () => {
		it('should encode and decode Maps', () => {
			const testMaps = [
				new Map(),
				new Map([['key1', 'value1'], ['key2', 'value2']]),
				new Map([[1, 'one'], [2, 'two'], [3, 'three']]),
				new Map([
					[{complex: 'key'}, {complex: 'value'}],
					[[1, 2, 3], [4, 5, 6]]
				])
			];

			testMaps.forEach(map => {
				const encoded = dataCoder.encode(map);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(map);
				expect(decoded).toBeInstanceOf(Map);
			});
		});

		it('should encode and decode Sets', () => {
			const testSets = [
				new Set(),
				new Set([1, 2, 3]),
				new Set(['a', 'b', 'c']),
				new Set([{a: 1}, {b: 2}, {c: 3}])
			];

			testSets.forEach(set => {
				const encoded = dataCoder.encode(set);
				const decoded = dataCoder.decode(encoded);
				expect(decoded).toEqual(set);
				expect(decoded).toBeInstanceOf(Set);
			});
		});
	});

	describe('Custom type extensions', () => {
		class TestClass {
			constructor(public value: any) {}

			getValue() {
				return this.value;
			}
		}

		it('should register and use custom type extensions', () => {
			dataCoder.use(
				0x10,
				TestClass,
				(instance: TestClass) => instance.value,
				(data: any) => new TestClass(data)
			);

			const original = new TestClass('test data');
			const encoded = dataCoder.encode(original);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toBeInstanceOf(TestClass);
			expect(decoded.getValue()).toBe('test data');
		});

		it('should handle multiple custom types', () => {
			class TypeA {
				constructor(public data: string) {}
			}

			class TypeB {
				constructor(public data: number) {}
			}

			dataCoder.use(0x20, TypeA, (instance: TypeA) => instance.data, (data: string) => new TypeA(data));
			dataCoder.use(0x21, TypeB, (instance: TypeB) => instance.data, (data: number) => new TypeB(data));

			const objA = new TypeA('hello');
			const objB = new TypeB(42);
			const combined = {a: objA, b: objB};

			const encoded = dataCoder.encode(combined);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded.a).toBeInstanceOf(TypeA);
			expect(decoded.b).toBeInstanceOf(TypeB);
			expect(decoded.a.data).toBe('hello');
			expect(decoded.b.data).toBe(42);
		});
	});

	describe('Error handling', () => {
		it('should handle invalid input gracefully', () => {
			expect(() => dataCoder.decode(Buffer.from([0xFF, 0xFF, 0xFF]))).toThrow();
		});

		it('should handle circular references', () => {
			const obj: any = {name: 'test'};
			obj.self = obj;

			expect(() => dataCoder.encode(obj)).not.toThrow();
		});
	});

	describe('Performance and edge cases', () => {
		it('should handle large data efficiently', () => {
			const largeArray = new Array(10000).fill(0).map((_, i) => ({
				id  : i,
				name: `item_${i}`,
				data: new Array(10).fill(i)
			}));

			const start = Date.now();
			const encoded = dataCoder.encode(largeArray);
			const decoded = dataCoder.decode(encoded);
			const duration = Date.now() - start;

			expect(decoded).toEqual(largeArray);
			expect(duration).toBeLessThan(1000);
		});

		it('should handle deeply nested structures', () => {
			let nested: any = {value: 'deep'};
			for (let i = 0; i < 100; i++) {
				nested = {level: i, nested};
			}

			const encoded = dataCoder.encode(nested);
			const decoded = dataCoder.decode(encoded);

			expect(decoded).toEqual(nested);
		});

		it('should handle special numeric values', () => {
			const specialNumbers = [
				Infinity,
				-Infinity,
				NaN,
				Number.MAX_SAFE_INTEGER,
				Number.MIN_SAFE_INTEGER,
				Number.MAX_VALUE,
				Number.MIN_VALUE
			];

			specialNumbers.forEach(num => {
				const encoded = dataCoder.encode(num);
				const decoded = dataCoder.decode(encoded);

				if (Number.isNaN(num)) {
					expect(Number.isNaN(decoded)).toBe(true);
				} else {
					expect(decoded).toBe(num);
				}
			});
		});
	});

	describe('Type safety', () => {
		it('should maintain type information through encode/decode cycle', () => {
			const data = {
				string : 'test',
				number : 42,
				boolean: true,
				array  : [1, 2, 3],
				object : {nested: true},
				buffer : Buffer.from('test'),
				date   : new Date(),
				map    : new Map([['key', 'value']]),
				set    : new Set([1, 2, 3])
			};

			const encoded = dataCoder.encode(data);
			const decoded: any = dataCoder.decode(encoded);

			expect(typeof decoded.string).toBe('string');
			expect(typeof decoded.number).toBe('number');
			expect(typeof decoded.boolean).toBe('boolean');
			expect(Array.isArray(decoded.array)).toBe(true);
			expect(typeof decoded.object).toBe('object');
			expect(Buffer.isBuffer(decoded.buffer)).toBe(true);
			expect(decoded.date).toBeInstanceOf(Date);
			expect(decoded.map).toBeInstanceOf(Map);
			expect(decoded.set).toBeInstanceOf(Set);
		});
	});

	describe('Options validation', () => {
		it('should respect encodeUndefinedAsNil option', () => {
			const coderWithNil = new DataCoder({encodeUndefinedAsNil: true});
			const coderWithoutNil = new DataCoder({encodeUndefinedAsNil: false});

			const data = {defined: 'value', undefined: undefined};

			const encodedWithNil = coderWithNil.encode(data);
			const encodedWithoutNil = coderWithoutNil.encode(data);

			expect(encodedWithNil).not.toEqual(encodedWithoutNil);
		});

		it('should respect structuredClone option', () => {
			const coderWithClone = new DataCoder({structuredClone: true});
			const coderWithoutClone = new DataCoder({structuredClone: false});

			const data = {test: 'value'};

			expect(() => coderWithClone.encode(data)).not.toThrow();
			expect(() => coderWithoutClone.encode(data)).not.toThrow();
		});
	});

	describe('New utility methods', () => {
		it('should get encoded size', () => {
			const data = {test: 'value', number: 42};
			const size = dataCoder.getEncodedSize(data);
			const actualEncoded = dataCoder.encode(data);

			expect(size).toBe(actualEncoded.length);
			expect(size).toBeGreaterThan(0);
		});

		it('should encode/decode to/from hex', () => {
			const data = {test: 'value', array: [1, 2, 3]};
			const hex = dataCoder.encodeToHex(data);
			const decoded = dataCoder.decodeFromHex(hex);

			expect(typeof hex).toBe('string');
			expect(/^[0-9a-fA-F]*$/.test(hex)).toBe(true);
			expect(decoded).toEqual(data);
		});

		it('should handle invalid hex strings', () => {
			expect(() => dataCoder.decodeFromHex('invalid_hex')).toThrow('Invalid hex string');
		});

		it('should encode/decode to/from base64', () => {
			const data = {test: 'value', buffer: Buffer.from('test')};
			const base64 = dataCoder.encodeToBase64(data);
			const decoded = dataCoder.decodeFromBase64(base64);

			expect(typeof base64).toBe('string');
			expect(decoded).toEqual(data);
		});

		it('should handle invalid base64 strings', () => {
			expect(() => dataCoder.decodeFromBase64('invalid base64!')).toThrow();
		});

		it('should clone objects deeply', () => {
			const original = {
				nested: {deep: {value: 42}},
				array : [1, 2, {inner: 'test'}],
				date  : new Date(),
				map   : new Map([['key', 'value']])
			};

			const cloned = dataCoder.clone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.nested).not.toBe(original.nested);
			expect(cloned.array).not.toBe(original.array);
		});

		it('should compare objects by encoded representation', () => {
			const obj1 = {a: 1, b: 2, c: [1, 2, 3]};
			const obj2 = {a: 1, b: 2, c: [1, 2, 3]};
			const obj3 = {a: 1, b: 2, c: [1, 2, 4]};

			expect(dataCoder.isEqual(obj1, obj2)).toBe(true);
			expect(dataCoder.isEqual(obj1, obj3)).toBe(false);
		});
	});

	describe('Type registration management', () => {
		it('should track registered types', () => {
			const coder = new DataCoder();

			const types = coder.getRegisteredTypes();
			expect(types).toEqual([
				{type: 1, className: 'Map'},
				{type: 2, className: 'Set'}
			]);
		});

		it('should check if type is registered', () => {
			const coder = new DataCoder();

			expect(coder.isTypeRegistered(1)).toBe(true); // Map
			expect(coder.isTypeRegistered(2)).toBe(true); // Set
			expect(coder.isTypeRegistered(99)).toBe(false);
		});

		it('should validate type range', () => {
			class TestClass {}

			expect(() => {
				dataCoder.use(-1, TestClass, (v) => v, (v) => v);
			}).toThrow('Type identifier must be between 0 and 127');

			expect(() => {
				dataCoder.use(128, TestClass, (v) => v, (v) => v);
			}).toThrow('Type identifier must be between 0 and 127');
		});

		it('should prevent type conflicts', () => {
			class TestClass1 {}

			class TestClass2 {}

			const coder = new DataCoder();
			coder.use(50, TestClass1, (v) => v, (v) => v);

			expect(() => {
				coder.use(50, TestClass2, (v) => v, (v) => v);
			}).toThrow('Type 50 is already registered for a different class');
		});

		it('should allow re-registering same class with same type', () => {
			class TestClass {}

			const coder = new DataCoder();
			coder.use(50, TestClass, (v) => v, (v) => v);

			expect(() => {
				coder.use(50, TestClass, (v) => v, (v) => v);
			}).not.toThrow();
		});
	});

	describe('Enhanced error handling', () => {
		it('should handle empty buffer decode', () => {
			expect(() => dataCoder.decode(Buffer.alloc(0))).toThrow('Cannot decode empty or null buffer');
		});

		it('should handle null buffer decode', () => {
			expect(() => dataCoder.decode(null as any)).toThrow('Cannot decode empty or null buffer');
		});

		it('should handle undefined buffer decode', () => {
			expect(() => dataCoder.decode(undefined as any)).toThrow('Cannot decode empty or null buffer');
		});

		it('should provide better error messages for custom type failures', () => {
			class FailingClass {
				constructor(public data: any) {}
			}

			dataCoder.use(60, FailingClass,
				() => { throw new Error('Encode failed'); },
				() => new FailingClass('test')
			);

			const instance = new FailingClass('test');
			expect(() => dataCoder.encode(instance)).toThrow('Failed to encode instance of FailingClass');
		});

		it('should handle decode failures for custom types', () => {
			class FailingDecodeClass {
				constructor(public data: any) {}
			}

			dataCoder.use(61, FailingDecodeClass,
				(instance: FailingDecodeClass) => instance.data,
				() => { throw new Error('Decode failed'); }
			);

			const instance = new FailingDecodeClass('test');
			const encoded = dataCoder.encode(instance);

			expect(() => dataCoder.decode(encoded)).toThrow('Failed to decode data for FailingDecodeClass');
		});

		it('should handle registration failures gracefully', () => {
			class TestClass {}

			expect(() => {
				dataCoder.use(70, TestClass, (v) => v, (v) => v);
				expect(dataCoder.isTypeRegistered(70)).toBe(true);
			}).not.toThrow();
		});
	});

	describe('Advanced encoding scenarios', () => {
		it('should handle mixed complex data structures', () => {
			const complexData = {
				users : new Map([
					[
						'user1', {
						id      : 1,
						name    : 'John',
						roles   : new Set(['admin', 'user']),
						metadata: {
							lastLogin  : new Date('2023-01-01'),
							preferences: {
								theme        : 'dark',
								notifications: true
							}
						}
					}
					],
					[
						'user2', {
						id      : 2,
						name    : 'Jane',
						roles   : new Set(['user']),
						metadata: {
							lastLogin  : new Date('2023-01-02'),
							preferences: {
								theme        : 'light',
								notifications: false
							}
						}
					}
					]
				]),
				config: {
					version : '1.0.0',
					features: ['auth', 'logging', 'metrics'],
					database: {
						host: 'localhost',
						port: 5432,
						ssl : true
					}
				},
				stats : {
					totalUsers : 2,
					activeUsers: 1,
					uptime     : 86400000,
					memory     : Buffer.from([0x01, 0x02, 0x03, 0x04])
				}
			};

			const encoded = dataCoder.encode(complexData);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toEqual(complexData);
			expect(decoded.users).toBeInstanceOf(Map);
			expect(decoded.users.get('user1').roles).toBeInstanceOf(Set);
			expect(decoded.users.get('user1').metadata.lastLogin).toBeInstanceOf(Date);
			expect(Buffer.isBuffer(decoded.stats.memory)).toBe(true);
		});

		it('should handle arrays with mixed types', () => {
			const mixedArray = [
				null,
				undefined,
				true,
				42,
				'string',
				{object: 'value'},
				[1, 2, 3],
				new Date(),
				Buffer.from('buffer'),
				new Map([['key', 'value']]),
				new Set([1, 2, 3])
			];

			const encoded = dataCoder.encode(mixedArray);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toEqual(mixedArray);
			expect(decoded[7]).toBeInstanceOf(Date);
			expect(Buffer.isBuffer(decoded[8])).toBe(true);
			expect(decoded[9]).toBeInstanceOf(Map);
			expect(decoded[10]).toBeInstanceOf(Set);
		});

		it('should handle sparse arrays', () => {
			const sparseArray = new Array(10);
			sparseArray[0] = 'first';
			sparseArray[5] = 'middle';
			sparseArray[9] = 'last';

			const encoded = dataCoder.encode(sparseArray);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded.length).toBe(10);
			expect(decoded[0]).toBe('first');
			expect(decoded[5]).toBe('middle');
			expect(decoded[9]).toBe('last');
			expect(decoded[1]).toBeUndefined();
		});

		it('should handle objects with symbol keys', () => {
			const sym1 = Symbol('test1');
			const sym2 = Symbol('test2');
			const obj = {
				[sym1] : 'symbol value 1',
				[sym2] : 'symbol value 2',
				regular: 'regular value'
			};

			const encoded = dataCoder.encode(obj);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded.regular).toBe('regular value');
			expect(decoded[sym1]).toBeUndefined();
			expect(decoded[sym2]).toBeUndefined();
		});
	});

	describe('Utility methods edge cases', () => {
		it('should handle empty data in utility methods', () => {
			const emptyData = {};

			expect(dataCoder.getEncodedSize(emptyData)).toBeGreaterThan(0);
			expect(dataCoder.encodeToHex(emptyData)).toBe(dataCoder.encode(emptyData).toString('hex'));
			expect(dataCoder.encodeToBase64(emptyData)).toBe(dataCoder.encode(emptyData).toString('base64'));
		});

		it('should handle hex edge cases', () => {
			expect(() => dataCoder.decodeFromHex('')).toThrow('Cannot decode empty or null buffer');

			const data = {test: 'value'};
			const hex = dataCoder.encodeToHex(data);
			expect(dataCoder.decodeFromHex(hex)).toEqual(data);
		});

		it('should handle base64 edge cases', () => {
			expect(() => dataCoder.decodeFromBase64('')).toThrow('Invalid base64 string');

			const data = 'test';
			const base64 = dataCoder.encodeToBase64(data);
			expect(dataCoder.decodeFromBase64(base64)).toBe(data);
		});

		it('should handle clone edge cases', () => {
			expect(dataCoder.clone(null)).toBe(null);
			expect(dataCoder.clone(undefined)).toBe(undefined);
			expect(dataCoder.clone(42)).toBe(42);

			const circular: any = {name: 'test'};
			circular.self = circular;
			expect(() => dataCoder.clone(circular)).not.toThrow();
		});

		it('should handle isEqual edge cases', () => {
			expect(dataCoder.isEqual(null, null)).toBe(true);
			expect(dataCoder.isEqual(undefined, undefined)).toBe(true);
			expect(dataCoder.isEqual(null, undefined)).toBe(false);

			expect(dataCoder.isEqual(42, 42)).toBe(true);
			expect(dataCoder.isEqual(42, 43)).toBe(false);

			const obj1 = {a: 1, b: 2};
			const obj2 = {a: 1, b: 2};
			expect(dataCoder.isEqual(obj1, obj2)).toBe(true);

			const problematicObj = {
				get value() {
					throw new Error('Cannot access');
				}
			};
			expect(dataCoder.isEqual(problematicObj, {})).toBe(false);
		});
	});

	describe('Performance and memory tests', () => {
		it('should handle repeated encoding/decoding without memory leaks', () => {
			const testData = {
				array: new Array(1000).fill(0).map((_, i) => i),
				map  : new Map(Array.from({length: 100}, (_, i) => [i, `value${i}`])),
				set  : new Set(Array.from({length: 100}, (_, i) => i))
			};

			for (let i = 0; i < 100; i++) {
				const encoded = dataCoder.encode(testData);
				const decoded: any = dataCoder.decode(encoded);
				expect(decoded.array.length).toBe(1000);
				expect(decoded.map.size).toBe(100);
				expect(decoded.set.size).toBe(100);
			}
		});

		it('should handle concurrent operations', async () => {
			const testData = {id: 1, name: 'test', data: [1, 2, 3, 4, 5]};

			const promises = Array.from({length: 50}, async (_, i) => {
				const data = {...testData, id: i};
				const encoded = dataCoder.encode(data);
				const decoded = dataCoder.decode(encoded);
				return decoded;
			});

			const results = await Promise.all(promises);

			results.forEach((result: any, i) => {
				expect(result.id).toBe(i);
				expect(result.name).toBe('test');
				expect(result.data).toEqual([1, 2, 3, 4, 5]);
			});
		});

		it('should maintain performance with large nested structures', () => {
			let nested: any = {value: 'deep', level: 0};
			for (let i = 1; i < 1000; i++) {
				nested = {value: `level${i}`, level: i, nested};
			}

			const start = Date.now();
			const encoded = dataCoder.encode(nested);
			const decoded: any = dataCoder.decode(encoded);
			const duration = Date.now() - start;

			expect(decoded.level).toBe(999);
			expect(duration).toBeLessThan(500);
		});
	});

	describe('Custom type advanced scenarios', () => {
		it('should handle inheritance in custom types', () => {
			class BaseClass {
				constructor(public baseValue: string) {}
			}

			class DerivedClass extends BaseClass {
				constructor(baseValue: string, public derivedValue: number) {
					super(baseValue);
				}
			}

			dataCoder.use(80, DerivedClass,
				(instance: DerivedClass) => ({
					baseValue   : instance.baseValue,
					derivedValue: instance.derivedValue
				}),
				(data: any) => new DerivedClass(data.baseValue, data.derivedValue)
			);

			const original = new DerivedClass('base', 42);
			const encoded = dataCoder.encode(original);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toBeInstanceOf(DerivedClass);
			expect(decoded.baseValue).toBe('base');
			expect(decoded.derivedValue).toBe(42);
		});

		it('should handle custom types with complex serialization', () => {
			class ComplexClass {
				private _data: Map<string, any>;

				constructor(data?: Map<string, any>) {
					this._data = data || new Map();
				}

				set(key: string, value: any) {
					this._data.set(key, value);
				}

				get(key: string) {
					return this._data.get(key);
				}

				toJSON() {
					return Object.fromEntries(this._data);
				}
			}

			dataCoder.use(81, ComplexClass,
				(instance: ComplexClass) => Array.from(instance['_data'].entries()),
				(data: any) => {
					const instance = new ComplexClass();
					data.forEach(([key, value]: [string, any]) => {
						instance.set(key, value);
					});
					return instance;
				}
			);

			const original = new ComplexClass();
			original.set('key1', 'value1');
			original.set('key2', {nested: true});
			original.set('key3', [1, 2, 3]);

			const encoded = dataCoder.encode(original);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toBeInstanceOf(ComplexClass);
			expect(decoded.get('key1')).toBe('value1');
			expect(decoded.get('key2')).toEqual({nested: true});
			expect(decoded.get('key3')).toEqual([1, 2, 3]);
		});

		it('should handle custom types with validation', () => {
			class ValidatedClass {
				constructor(public value: number) {
					if (typeof value !== 'number' || value < 0) {
						throw new Error('Value must be a non-negative number');
					}
				}
			}

			dataCoder.use(82, ValidatedClass,
				(instance: ValidatedClass) => instance.value,
				(data: number) => new ValidatedClass(data)
			);

			const valid = new ValidatedClass(42);
			const encoded = dataCoder.encode(valid);
			const decoded: any = dataCoder.decode(encoded);

			expect(decoded).toBeInstanceOf(ValidatedClass);
			expect(decoded.value).toBe(42);
		});
	});

	describe('Integration with other options', () => {
		it('should work with all msgpackr options combinations', () => {
			const testCases: DataCoderOptions[] = [
				{encodeUndefinedAsNil: true, structuredClone: true},
				{encodeUndefinedAsNil: false, structuredClone: false},
				{largeBigIntToFloat: true, useRecords: false},
				{mapsAsObjects: true, copyBuffers: true},
				{useTimestamp32: true}
			];

			const testData = {
				undefined: undefined,
				map      : new Map([['key', 'value']]),
				date     : new Date(),
				buffer   : Buffer.from('test')
			};

			testCases.forEach(options => {
				const coder = new DataCoder(options);
				expect(() => {
					const encoded = coder.encode(testData);
					const decoded = coder.decode(encoded);

					expect(typeof decoded).toBe('object');
				}).not.toThrow();
			});
		});

		it('should maintain custom types across different option configurations', () => {
			class TestClass {
				constructor(public value: string) {}
			}

			const coders = [
				new DataCoder({structuredClone: true}),
				new DataCoder({structuredClone: false}),
				new DataCoder({encodeUndefinedAsNil: true}),
				new DataCoder({useRecords: false})
			];

			coders.forEach((coder, index) => {
				coder.use(90 + index, TestClass,
					(instance: TestClass) => instance.value,
					(data: string) => new TestClass(data)
				);

				const original = new TestClass(`test${index}`);
				const encoded = coder.encode(original);
				const decoded: any = coder.decode(encoded);

				expect(decoded).toBeInstanceOf(TestClass);
				expect(decoded.value).toBe(`test${index}`);
			});
		});
	});

	it('encode should return Buffer without Buffer.from conversion when packr returns Buffer', () => {
		const buf = Buffer.from([1, 2, 3]);
		const spy = vi.spyOn((dataCoder as any).packr, 'encode').mockImplementation((_arg: any) => buf as any);

		const out = dataCoder.encode({x: 1});
		expect(out).toBe(buf);

		spy.mockRestore();
	});

	it('encode should convert Uint8Array result to Buffer', () => {
		const u8 = new Uint8Array([1, 2, 3]);
		const spy = vi.spyOn((dataCoder as any).packr, 'encode').mockImplementation((_arg: any) => u8 as any);
		const out = dataCoder.encode({x: 1});
		expect(Buffer.isBuffer(out)).toBe(true);
		expect(Array.from(out)).toEqual([1, 2, 3]);
		spy.mockRestore();
	});

	it('encode should wrap errors with custom message', () => {
		const spy = vi.spyOn((dataCoder as any).packr, 'encode').mockImplementation(() => {
			throw new Error('Internal encode boom');
		});

		expect(() => dataCoder.encode({x: 1})).toThrow(/Failed to encode data: .*Internal encode boom/);
		spy.mockRestore();
	});

	it('decode should wrap errors with custom message', () => {
		const data = dataCoder.encode({x: 1});
		const spy = vi.spyOn((dataCoder as any).packr, 'unpack').mockImplementation(() => {
			throw new Error('Internal unpack boom');
		});

		expect(() => dataCoder.decode(data)).toThrow(/Failed to decode data: .*Internal unpack boom/);
		spy.mockRestore();
	});
});
