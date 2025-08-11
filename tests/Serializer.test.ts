import {describe, it, expect, beforeEach, afterEach, vi}    from 'vitest';
import {Serializer, SerializerSchema, SerializerPacketInfo} from '../src/classes/Serializer';
import {DataCoder}                                          from '../src/classes/DataCoder';

describe('Serializer', () => {
	let serializer: Serializer;

	beforeEach(() => {
		serializer = new Serializer();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should create instance with default options', () => {
			const ser = new Serializer();
			expect(ser).toBeInstanceOf(Serializer);
			expect(ser.version).toBe(3);
		});

		it('should create instance with custom DataCoder', () => {
			const customCoder = new DataCoder();
			const ser = new Serializer(customCoder);
			expect(ser).toBeInstanceOf(Serializer);
			expect(ser.coder).toBe(customCoder);
		});

		it('should create instance with custom options', () => {
			const options = {
				useCompress: null,
				useCRC32   : false
			};
			const ser = new Serializer(undefined, options);
			expect(ser).toBeInstanceOf(Serializer);
		});

		it('should validate compressor options', () => {
			const invalidCompressor = {
				compress  : 'not a function',
				decompress: () => Buffer.alloc(0)
			} as any;

			expect(() => {
				new Serializer(undefined, {
					useCompress: invalidCompressor,
					useCRC32   : true
				});
			}).toThrow('Invalid compressor: must have compress and decompress methods');
		});

		it('should create copy of options to prevent mutations', () => {
			const options = {
				useCompress: null,
				useCRC32   : true
			};
			const ser = new Serializer(undefined, options);

			options.useCRC32 = false;

			const testData = {test: 'value'};
			const serialized = ser.serialize(testData);
			const info = ser.getPacketInfo(serialized);
			expect(info.useCRC32).toBe(true);
		});
	});

	describe('Schema Management', () => {
		describe('registerSchema', () => {
			it('should register valid schema', () => {
				const fields = ['name', 'age', 'email'];
				serializer.registerSchema(1, fields);

				expect(serializer.hasSchema(1)).toBe(true);
				expect(serializer.getSchema(1)).toEqual(['age', 'email', 'name']);
			});

			it('should sort schema fields', () => {
				const fields = ['zebra', 'alpha', 'beta'];
				serializer.registerSchema(1, fields);

				const schema = serializer.getSchema(1);
				expect(schema).toEqual(['alpha', 'beta', 'zebra']);
			});

			it('should not mutate original fields array', () => {
				const fields = ['zebra', 'alpha', 'beta'];
				const originalFields = [...fields];

				serializer.registerSchema(1, fields);

				expect(fields).toEqual(originalFields);
			});

			it('should validate schema id', () => {
				expect(() => {
					serializer.registerSchema(-1, ['field']);
				}).toThrow('Schema id must be a non-negative integer');

				expect(() => {
					serializer.registerSchema(1.5, ['field']);
				}).toThrow('Schema id must be a non-negative integer');

				expect(() => {
					serializer.registerSchema('1' as any, ['field']);
				}).toThrow('Schema id must be a non-negative integer');
			});

			it('should validate schema fields', () => {
				expect(() => {
					serializer.registerSchema(1, [] as any);
				}).toThrow('Schema fields must be a non-empty array of strings');

				expect(() => {
					serializer.registerSchema(1, 'not array' as any);
				}).toThrow('Schema fields must be a non-empty array of strings');

				expect(() => {
					serializer.registerSchema(1, [123] as any);
				}).toThrow('All schema fields must be non-empty strings');

				expect(() => {
					serializer.registerSchema(1, ['valid', ''] as any);
				}).toThrow('All schema fields must be non-empty strings');
			});

			it('should prevent duplicate schema registration', () => {
				serializer.registerSchema(1, ['field1']);

				expect(() => {
					serializer.registerSchema(1, ['field2']);
				}).toThrow('Schema with id 1 already registered');
			});
		});

		describe('updateSchema', () => {
			it('should update existing schema', () => {
				serializer.registerSchema(1, ['old', 'fields']);
				serializer.updateSchema(1, ['new', 'fields', 'added']);

				const schema = serializer.getSchema(1);
				expect(schema).toEqual(['added', 'fields', 'new']);
			});

			it('should validate schema exists before update', () => {
				expect(() => {
					serializer.updateSchema(999, ['field']);
				}).toThrow('Schema with id 999 not found');
			});

			it('should validate updated fields', () => {
				serializer.registerSchema(1, ['field']);

				expect(() => {
					serializer.updateSchema(1, []);
				}).toThrow('Schema fields must be a non-empty array of strings');
			});
		});

		describe('unregisterSchema', () => {
			it('should unregister existing schema', () => {
				serializer.registerSchema(1, ['field']);
				expect(serializer.hasSchema(1)).toBe(true);

				serializer.unregisterSchema(1);
				expect(serializer.hasSchema(1)).toBe(false);
			});

			it('should validate schema exists before unregistering', () => {
				expect(() => {
					serializer.unregisterSchema(999);
				}).toThrow('Schema with id 999 not found');
			});
		});

		describe('Schema query methods', () => {
			beforeEach(() => {
				serializer.registerSchema(1, ['name', 'age']);
				serializer.registerSchema(3, ['email', 'phone']);
				serializer.registerSchema(2, ['address', 'city']);
			});

			it('should check schema existence', () => {
				expect(serializer.hasSchema(1)).toBe(true);
				expect(serializer.hasSchema(2)).toBe(true);
				expect(serializer.hasSchema(3)).toBe(true);
				expect(serializer.hasSchema(999)).toBe(false);
			});

			it('should get schema by id', () => {
				expect(serializer.getSchema(1)).toEqual(['age', 'name']);
				expect(serializer.getSchema(999)).toBe(null);
			});

			it('should get all registered schemas', () => {
				const schemas = serializer.getRegisteredSchemas();

				expect(schemas).toEqual({
					1: ['age', 'name'],
					2: ['address', 'city'],
					3: ['email', 'phone']
				});

				schemas[1].push('modified');
				expect(serializer.getSchema(1)).toEqual(['age', 'name']);
			});

			it('should get registered schema IDs', () => {
				const ids = serializer.getRegisteredSchemaIds();
				expect(ids).toEqual([1, 2, 3]);
			});
		});
	});

	describe('Compression Management', () => {
		it('should set compression threshold', () => {
			serializer.setCompressionThreshold(2048);
			expect(serializer.getCompressionThreshold()).toBe(2048);
		});

		it('should validate compression threshold', () => {
			expect(() => {
				serializer.setCompressionThreshold(-1);
			}).toThrow('Compression threshold must be a non-negative integer');

			expect(() => {
				serializer.setCompressionThreshold(1.5);
			}).toThrow('Compression threshold must be a non-negative integer');

			expect(() => {
				serializer.setCompressionThreshold('1000' as any);
			}).toThrow('Compression threshold must be a non-negative integer');
		});
	});

	describe('Basic Serialization', () => {
		it('should validate payload is object', () => {
			expect(() => {
				serializer.serialize('not an object' as any);
			}).toThrow('Payload must be an object');

			expect(() => {
				serializer.serialize(123 as any);
			}).toThrow('Payload must be an object');

			expect(() => {
				serializer.serialize(null as any);
			}).toThrow('Payload must be an object');
		});
	});

	describe('Schema-based Serialization', () => {
		beforeEach(() => {
			serializer.registerSchema(1, ['name', 'age', 'email']);
			serializer.registerSchema(2, ['title', 'content', 'author']);
		});

		it('should serialize with explicit schema ID', () => {
			const data = {
				name : 'John',
				age  : 30,
				email: 'john@example.com'
			};

			const serialized = serializer.serialize(data, 1);
			const deserialized = serializer.deserialize(serialized);

			expect(deserialized).toEqual(data);
		});

		it('should serialize with schema object', () => {
			const data = {
				name : 'John',
				age  : 30,
				email: 'john@example.com'
			};

			const schemaObject = {
				id    : 1,
				fields: ['name', 'age', 'email']
			};

			const serialized = serializer.serialize(data, schemaObject);
			const deserialized = serializer.deserialize(serialized);

			expect(deserialized).toEqual(data);
		});

		it('should auto-detect schema', () => {
			const data = {
				name : 'John',
				age  : 30,
				email: 'john@example.com'
			};

			const serialized = serializer.serialize(data);
			const deserialized = serializer.deserialize(serialized);

			expect(deserialized).toEqual(data);
		});

		it('should validate schema fields match payload', () => {
			const dataWithMissingField = {
				name: 'John',
				age : 30
			};

			expect(() => {
				serializer.serialize(dataWithMissingField, 1);
			}).toThrow('Schema validation failed: expected 3 fields, got 2');

			const dataWithExtraField = {
				name : 'John',
				age  : 30,
				email: 'john@example.com',
				extra: 'field'
			};

			expect(() => {
				serializer.serialize(dataWithExtraField, 1);
			}).toThrow('Schema validation failed: expected 3 fields, got 4');

			const dataWithWrongCount = {
				name: 'John',
				age : 30
			};

			expect(() => {
				serializer.serialize(dataWithWrongCount, 1);
			}).toThrow('Schema validation failed: expected 3 fields, got 2');
		});

		it('should reorder fields according to schema', () => {
			const data = {
				email: 'john@example.com',
				name : 'John',
				age  : 30
			};

			const serialized = serializer.serialize(data, 1);
			const deserialized = serializer.deserialize(serialized);

			expect(deserialized).toEqual(data);
		});

		it('should handle schema not found during deserialization', () => {
			const data = {name: 'John', age: 30, email: 'john@example.com'};
			const serialized = serializer.serialize(data, 1);

			serializer.unregisterSchema(1);

			expect(() => {
				serializer.deserialize(serialized);
			}).toThrow('Cant find schema by id from payload');
		});

		it('should validate array length matches schema during deserialization', () => {
			const data = {name: 'John', age: 30, email: 'john@example.com'};
			const serialized = serializer.serialize(data, 1);

			const originalDecode = serializer.coder.decode;
			serializer.coder.decode = vi.fn().mockReturnValue(['John', 30]);

			expect(() => {
				serializer.deserialize(serialized);
			}).toThrow('Schema deserialization failed: expected 3 values, got 2');

			serializer.coder.decode = originalDecode;
		});
	});

	describe('Packet Information', () => {
		it('should get packet info for basic packet', () => {
			const data = {test: 'value'};
			const serialized = serializer.serialize(data);
			const info = serializer.getPacketInfo(serialized);

			expect(info).toEqual({
				version    : 3,
				useCompress: false,
				useCRC32   : true,
				useSchema  : false,
				schemaId   : undefined,
				dataSize   : expect.any(Number)
			});
			expect(info.dataSize).toBeGreaterThan(0);
		});

		it('should get packet info for schema-based packet', () => {
			serializer.registerSchema(1, ['name', 'age']);
			const data = {name: 'John', age: 30};
			const serialized = serializer.serialize(data, 1);
			const info = serializer.getPacketInfo(serialized);

			expect(info).toEqual({
				version    : 3,
				useCompress: false,
				useCRC32   : true,
				useSchema  : true,
				schemaId   : 1,
				dataSize   : expect.any(Number)
			});
		});

		it('should get packet info without CRC32', () => {
			const serializerNoCRC = new Serializer(undefined, {
				useCompress: null,
				useCRC32   : false
			});

			const data = {test: 'value'};
			const serialized = serializerNoCRC.serialize(data);
			const info = serializerNoCRC.getPacketInfo(serialized);

			expect(info.useCRC32).toBe(false);
		});

		it('should validate packet length', () => {
			expect(() => {
				serializer.getPacketInfo(Buffer.alloc(1));
			}).toThrow('Invalid packet: too short');

			expect(() => {
				serializer.getPacketInfo(Buffer.alloc(0));
			}).toThrow('Invalid packet: too short');
		});
	});

	describe('Version Compatibility', () => {
		it('should reject packets with wrong version', () => {
			const data = {test: 'value'};
			const serialized = serializer.serialize(data);

			serialized[0] = 2;

			expect(() => {
				serializer.deserialize(serialized);
			}).toThrow('Input data version mismatch');
		});

		it('should handle current version correctly', () => {
			const data = {test: 'value'};
			const serialized = serializer.serialize(data);

			expect(serialized[0]).toBe(3);
			expect(() => {
				serializer.deserialize(serialized);
			}).not.toThrow();
		});
	});

	describe('CRC32 Validation', () => {
		it('should validate CRC32 when enabled', () => {
			const data = {test: 'value'};
			const serialized = serializer.serialize(data);

			const corruptedData = Buffer.from(serialized);
			corruptedData[corruptedData.length - 1] ^= 0xFF;

			expect(() => {
				serializer.deserialize(corruptedData);
			}).toThrow('Input data CRC32 error');
		});
	});

	describe('Compression', () => {
		const mockCompressor = {
			compress  : vi.fn((data: Buffer) => {
				return Buffer.concat([Buffer.from('COMPRESSED'), data]);
			}),
			decompress: vi.fn((data: Buffer) => {
				return data.subarray(10);
			})
		};

		beforeEach(() => {
			mockCompressor.compress.mockClear();
			mockCompressor.decompress.mockClear();
		});

		it('should handle missing decompressor', () => {
			const data = {test: 'value'};

			const serializerWithCompression = new Serializer(undefined, {
				useCompress: mockCompressor,
				useCRC32   : true
			});
			serializerWithCompression.setCompressionThreshold(1);
			const serialized = serializerWithCompression.serialize(data);

			const serializerWithoutCompression = new Serializer(undefined, {
				useCompress: null,
				useCRC32   : true
			});

			expect(() => {
				serializerWithoutCompression.deserialize(serialized);
			}).toThrow('Packet compressed, but compressor plugin not used');
		});

		it('should validate compressor has required methods', () => {
			const invalidCompressor = {
				compress: 'not a function'
			} as any;

			expect(() => {
				new Serializer(undefined, {
					useCompress: invalidCompressor,
					useCRC32   : true
				});
			}).toThrow('Invalid compressor: must have compress and decompress methods');
		});
	});

	describe('Custom Types Integration', () => {
		class TestClass {
			constructor(public value: string) {}

			getValue() {
				return this.value;
			}
		}

		beforeEach(() => {
			serializer.use(
				100,
				TestClass,
				(instance: TestClass) => instance.value,
				(data: string) => new TestClass(data)
			);
		});

		it('should serialize custom types with schema', () => {
			serializer.registerSchema(1, ['regular', 'custom']);

			const data = {
				regular: 'value',
				custom : new TestClass('custom value')
			};

			const serialized = serializer.serialize(data, 1);
			const deserialized: any = serializer.deserialize(serialized);

			expect(deserialized.regular).toBe('value');
			expect(deserialized.custom).toBeInstanceOf(TestClass);
			expect(deserialized.custom.getValue()).toBe('custom value');
		});
	});

	describe('Error Handling', () => {
		it('should handle decode errors gracefully', () => {
			const invalidData = Buffer.from([1, 2, 3, 4, 5]);

			expect(() => {
				serializer.deserialize(invalidData);
			}).toThrow('Input data version mismatch');
		});

		it('should handle schema validation errors', () => {
			serializer.registerSchema(1, ['required_field']);

			const invalidData = {wrong_field: 'value'};

			expect(() => {
				serializer.serialize(invalidData, 1);
			}).toThrow('Schema validation failed');
		});

		it('should handle non-array payload with schema flag', () => {
			serializer.registerSchema(1, ['field']);
			const data = {field: 'value'};
			const serialized = serializer.serialize(data, 1);

			const originalDecode = serializer.coder.decode;
			serializer.coder.decode = vi.fn().mockReturnValue('not an array');

			expect(() => {
				serializer.deserialize(serialized);
			}).toThrow('Encoded payload not array but schema flag is present');

			serializer.coder.decode = originalDecode;
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty schema fields array validation', () => {
			expect(() => {
				serializer.registerSchema(1, []);
			}).toThrow('Schema fields must be a non-empty array of strings');
		});
	});

	describe('Performance Tests', () => {
		it('should handle schema-based serialization efficiently', () => {
			const testSerializer = new Serializer();
			testSerializer.registerSchema(1, ['id', 'name', 'active', 'score']);

			const data = {
				id    : 1,
				name  : 'test',
				active: true,
				score : 95.5
			};

			const start = Date.now();
			for (let i = 0; i < 100; i++) {
				const serialized = testSerializer.serialize(data, 1);
				const deserialized: any = testSerializer.deserialize(serialized);
				expect(deserialized.id).toBe(1);
			}
			const duration = Date.now() - start;

			expect(duration).toBeLessThan(1000);
		});
	});

	describe('Integration Tests', () => {
		it('should work with all features combined', () => {
			const mockCompressor = {
				compress  : (data: Buffer) => Buffer.concat([Buffer.from('COMP'), data]),
				decompress: (data: Buffer) => data.subarray(4)
			};

			const fullFeaturedSerializer = new Serializer(undefined, {
				useCompress: mockCompressor,
				useCRC32   : true
			});

			class CustomType {
				constructor(public data: any) {}
			}

			fullFeaturedSerializer.use(
				50,
				CustomType,
				(instance: CustomType) => instance.data,
				(data: any) => new CustomType(data)
			);

			fullFeaturedSerializer.registerSchema(1, ['id', 'custom', 'metadata']);

			fullFeaturedSerializer.setCompressionThreshold(1);

			const data = {
				id      : 123,
				custom  : new CustomType({nested: 'value'}),
				metadata: {
					created: new Date(),
					tags   : ['test', 'integration']
				}
			};

			const serialized = fullFeaturedSerializer.serialize(data, 1);
			const info = fullFeaturedSerializer.getPacketInfo(serialized);
			const deserialized: any = fullFeaturedSerializer.deserialize(serialized);

			expect(info.version).toBe(3);
			expect(info.useCompress).toBe(true);
			expect(info.useCRC32).toBe(true);
			expect(info.useSchema).toBe(true);
			expect(info.schemaId).toBe(1);

			expect(deserialized.id).toBe(123);
			expect(deserialized.custom).toBeInstanceOf(CustomType);
			expect(deserialized.custom.data).toEqual({nested: 'value'});
			expect(deserialized.metadata.created).toBeInstanceOf(Date);
			expect(deserialized.metadata.tags).toEqual(['test', 'integration']);
		});
	});

	describe('Concurrent Operations', () => {
		it('should handle concurrent schema operations', async () => {
			const testSerializer = new Serializer();

			const schemaOperations = Array.from({length: 5}, (_, i) => async () => {
				const schemaId = i + 1;
				const fields = [`field${i}`, `data${i}`, `meta${i}`];

				testSerializer.registerSchema(schemaId, fields);

				const data: Record<string, any> = {};
				fields.forEach(field => {
					data[field] = `value_${field}`;
				});

				const serialized = testSerializer.serialize(data, schemaId);
				const deserialized = testSerializer.deserialize(serialized);

				return {schemaId, data, deserialized};
			});

			const results = await Promise.all(schemaOperations.map(op => op()));

			results.forEach(({schemaId, data, deserialized}) => {
				expect(deserialized).toEqual(data);
				expect(testSerializer.hasSchema(schemaId)).toBe(true);
			});
		});
	});

	describe('Serializer - addtional tests', () => {
		it('updateSchema validation for empty string in fields', () => {
			serializer.registerSchema(1, ['field1', 'field2']);

			expect(() => {
				serializer.updateSchema(1, ['field1', '']);
			}).toThrow('All schema fields must be non-empty strings');
		});

		it('deserialize with schema and sorted fields', () => {
			serializer.registerSchema(1, ['zebra', 'alpha', 'beta']);

			const data = {
				zebra: 'z-value',
				alpha: 'a-value',
				beta : 'b-value'
			};

			const serialized = serializer.serialize(data, 1);

			const deserialized = serializer.deserialize(serialized);
			expect(deserialized).toEqual(data);
		});
	});
});
