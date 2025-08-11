# DataCoder Documentation

DataCoder is an advanced binary serialization engine built on top of MessagePack, providing high-performance encoding and decoding of complex JavaScript objects with support for
custom types, built-in extensions, and multiple output formats.

## ✨ Features

- 📦 **MessagePack Integration** - High-performance binary serialization format
- 🔧 **Custom Type Support** - Register and serialize custom classes and objects
- 🏗️ **Built-in Extensions** - Native support for Map, Set, Date, and more
- 🎯 **Type Safety** - Full TypeScript integration with type preservation
- 📊 **Multiple Formats** - Binary, hex, and base64 output options
- 🔄 **Deep Cloning** - Efficient object cloning through serialization
- ⚡ **Performance Optimized** - Minimal overhead with configurable options
- 🛡️ **Error Handling** - Comprehensive error reporting and validation

## 📦 Installation & Import

```typescript
import {DataCoder, dataCoder} from '@osmium/coder';

// Use the pre-configured instance
const buffer = dataCoder.encode({hello: 'world'});
const data = dataCoder.decode(buffer);

// Or create a custom instance
const customCoder = new DataCoder({
	encodeUndefinedAsNil: true,
	useRecords          : false
});
```

## 🚀 Quick Start

### Basic Encoding/Decoding

```typescript
import {dataCoder} from '@osmium/coder';

// Simple object
const data = {name: 'John', age: 30, active: true};
const buffer = dataCoder.encode(data);
const restored = dataCoder.decode(buffer);

console.log(restored); // { name: 'John', age: 30, active: true }
```

### Complex Data Types

```typescript
// Complex objects with built-in types
const complexData = {
	users   : new Map([
		['john', {age: 30, roles: new Set(['admin', 'user'])}],
		['jane', {age: 25, roles: new Set(['user'])}]
	]),
	metadata: {
		created: new Date(),
		version: 1.2,
		tags   : ['important', 'urgent']
	}
};

const buffer = dataCoder.encode(complexData);
const restored = dataCoder.decode(buffer);

// All types are preserved including Map, Set, and Date
console.log(restored.users instanceof Map); // true
console.log(restored.users.get('john').roles instanceof Set); // true
console.log(restored.metadata.created instanceof Date); // true
```

## 🔧 Configuration Options

### DataCoder Options

```typescript
import {DataCoder} from '@osmium/coder';

const coder = new DataCoder({
	// MessagePack options
	encodeUndefinedAsNil: false,  // Encode undefined as null
	largeBigIntToFloat  : false,    // Convert large BigInt to float
	structuredClone     : true,        // Use structured cloning
	useRecords          : true,             // Use records for objects
	mapsAsObjects       : false,         // Encode Maps as objects
	copyBuffers         : false,           // Copy buffers during encoding
	useTimestamp32      : false,        // Use 32-bit timestamps

	// Custom options can be added here
});
```

### Default Configuration

The pre-configured `dataCoder` instance uses optimized defaults:

```typescript
const defaultOptions = {
	encodeUndefinedAsNil: false,
	largeBigIntToFloat  : false,
	structuredClone     : true,
	useRecords          : true,
	mapsAsObjects       : false,
	copyBuffers         : false,
	useTimestamp32      : false
};
```

## 🏗️ Built-in Type Support

DataCoder automatically handles these JavaScript types:

### Primitive Types

```typescript
// Numbers, strings, booleans, null, undefined
const primitives = {
	number        : 42,
	string        : 'hello',
	boolean       : true,
	nullValue     : null,
	undefinedValue: undefined
};
```

### Collections

```typescript
// Arrays, objects, Maps, Sets
const collections = {
	array : [1, 2, 3],
	object: {key: 'value'},
	map   : new Map([['key1', 'value1'], ['key2', 'value2']]),
	set   : new Set([1, 2, 3, 3]) // Duplicates automatically removed
};
```

### Built-in Objects

```typescript
// Dates, RegExp, Buffers
const builtins = {
	date  : new Date(),
	buffer: Buffer.from('hello'),
	// Note: RegExp requires custom registration
};
```

### Nested Structures

```typescript
// Complex nested structures
const nested = {
	level1: {
		level2: {
			level3: {
				data: new Map([
					['users', new Set(['john', 'jane'])],
					['metadata', {created: new Date()}]
				])
			}
		}
	}
};
```

## 🔧 Custom Type Registration

Register custom classes and objects for serialization:

### Basic Custom Type

```typescript
class Person {
	constructor(public name: string, public age: number) {}

	greet() {
		return `Hello, I'm ${this.name}`;
	}
}

// Register the custom type
dataCoder.use(
	10, // Unique type ID (0-127)
	Person, // Constructor function
	(person) => ({name: person.name, age: person.age}), // Encoder
	(data) => new Person(data.name, data.age) // Decoder
);

// Use the custom type
const person = new Person('John', 30);
const buffer = dataCoder.encode(person);
const restored = dataCoder.decode(buffer);

console.log(restored instanceof Person); // true
console.log(restored.greet()); // "Hello, I'm John"
```

### Advanced Custom Type

```typescript
class DatabaseRecord {
	constructor(
		public id: string,
		public data: any,
		public metadata: { created: Date, modified: Date }
	) {}

	static fromJSON(json: any): DatabaseRecord {
		return new DatabaseRecord(
			json.id,
			json.data,
			{
				created : new Date(json.metadata.created),
				modified: new Date(json.metadata.modified)
			}
		);
	}

	toJSON() {
		return {
			id      : this.id,
			data    : this.data,
			metadata: {
				created : this.metadata.created.toISOString(),
				modified: this.metadata.modified.toISOString()
			}
		};
	}
}

// Register with JSON serialization
dataCoder.use(
	11,
	DatabaseRecord,
	(record) => record.toJSON(),
	(json) => DatabaseRecord.fromJSON(json)
);
```

### Type Registration Management

```typescript
// Check registered types
const registeredTypes = dataCoder.getRegisteredTypes();
console.log(registeredTypes);
// [
//   { type: 1, className: 'Map' },
//   { type: 2, className: 'Set' },
//   { type: 10, className: 'Person' }
// ]

// Check if a type is registered
const isRegistered = dataCoder.isTypeRegistered(10); // true

// Type conflicts are automatically detected
try {
	dataCoder.use(10, AnotherClass, encoder, decoder);
} catch (error) {
	console.log(error.message); // "Type 10 is already registered for a different class"
}
```

## 📊 Output Formats

### Binary Output (Default)

```typescript
const data = {message: 'Hello, World!'};
const buffer = dataCoder.encode(data); // Returns Buffer
console.log(buffer); // <Buffer 81 a7 6d 65 73 73 61 67 65 ad 48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21>
```

### Hex String Output

```typescript
// Encode to hex string
const hexString = dataCoder.encodeToHex(data);
console.log(hexString); // "81a76d65737361676561644865c6c6f2c20576f726c6421"

// Decode from hex string
const restored = dataCoder.decodeFromHex(hexString);
console.log(restored); // { message: 'Hello, World!' }
```

### Base64 String Output

```typescript
// Encode to base64 string
const base64String = dataCoder.encodeToBase64(data);
console.log(base64String); // "gad2VzZmFnZWFkSGVsbG8sIFdvcmxkIQ=="

// Decode from base64 string
const restored = dataCoder.decodeFromBase64(base64String);
console.log(restored); // { message: 'Hello, World!' }
```

## 🔄 Utility Methods

### Deep Cloning

```typescript
const original = {
	users   : new Map([['john', {preferences: new Set(['dark-mode'])}]]),
	metadata: {created: new Date()}
};

// Clone through serialization (preserves all types)
const cloned = dataCoder.clone(original);

console.log(cloned !== original); // true (different objects)
console.log(cloned.users instanceof Map); // true (types preserved)
console.log(cloned.users !== original.users); // true (deep clone)
```

### Object Comparison

```typescript
const obj1 = {name: 'John', tags: new Set(['admin'])};
const obj2 = {name: 'John', tags: new Set(['admin'])};
const obj3 = {name: 'Jane', tags: new Set(['user'])};

// Compare by serialized representation
console.log(dataCoder.isEqual(obj1, obj2)); // true
console.log(dataCoder.isEqual(obj1, obj3)); // false

// Works with complex nested structures
const complex1 = {data: new Map([['key', new Set([1, 2, 3])]])};
const complex2 = {data: new Map([['key', new Set([1, 2, 3])]])};
console.log(dataCoder.isEqual(complex1, complex2)); // true
```

### Size Calculation

```typescript
const data = {message: 'Hello, World!', numbers: [1, 2, 3, 4, 5]};

// Get encoded size without actually encoding
const size = dataCoder.getEncodedSize(data);
console.log(`Encoded size: ${size} bytes`);

// Useful for performance optimization and storage planning
```

## 🎯 Advanced Usage

### Streaming Large Objects

```typescript
// For very large objects, consider chunking
function encodeInChunks<T>(data: T[], chunkSize: number = 1000): Buffer[] {
	const chunks: Buffer[] = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		chunks.push(dataCoder.encode(chunk));
	}

	return chunks;
}

function decodeChunks<T>(chunks: Buffer[]): T[] {
	const result: T[] = [];

	for (const chunk of chunks) {
		const decoded = dataCoder.decode<T[]>(chunk);
		result.push(...decoded);
	}

	return result;
}
```

### Custom Packr Instance

```typescript
import {Packr} from 'msgpackr';

// Create custom Packr instance with specific options
const customPackr = new Packr({
	useRecords   : false,
	mapsAsObjects: true
});

// Use with DataCoder
const coder = new DataCoder({}, customPackr);
```

### Type-Safe Encoding/Decoding

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	preferences: {
		theme: 'light' | 'dark';
		notifications: boolean;
	};
}

// Type-safe encoding
const user: User = {
	id         : 1,
	name       : 'John Doe',
	email      : 'john@example.com',
	preferences: {
		theme        : 'dark',
		notifications: true
	}
};

const buffer = dataCoder.encode(user);
const restored = dataCoder.decode<User>(buffer);

// TypeScript knows the type of restored
console.log(restored.preferences.theme); // TypeScript autocomplete works
```

## 🛡️ Error Handling

### Encoding Errors

```typescript
try {
	// This might fail if the object contains non-serializable data
	const buffer = dataCoder.encode(someComplexObject);
} catch (error) {
	console.error('Encoding failed:', error.message);
	// Handle encoding error
}
```

### Decoding Errors

```typescript
try {
	const data = dataCoder.decode(corruptedBuffer);
} catch (error) {
	console.error('Decoding failed:', error.message);
	// Handle decoding error
}

// Validate buffer before decoding
if (!buffer || buffer.length === 0) {
	throw new Error('Cannot decode empty buffer');
}
```

### Custom Type Errors

```typescript
// Error handling in custom type registration
dataCoder.use(
	20,
	MyClass,
	(instance) => {
		try {
			return instance.serialize();
		} catch (error) {
			throw new Error(`Failed to serialize MyClass: ${error.message}`);
		}
	},
	(data) => {
		try {
			return MyClass.deserialize(data);
		} catch (error) {
			throw new Error(`Failed to deserialize MyClass: ${error.message}`);
		}
	}
);
```

## 📊 Performance Optimization

### Best Practices

```typescript
// 1. Reuse DataCoder instances
const coder = new DataCoder();

// 2. Use appropriate options for your use case
const fastCoder = new DataCoder({
	structuredClone: false, // Faster but less safe
	copyBuffers    : false      // Avoid unnecessary copies
});

// 3. Consider data structure
// Prefer arrays over objects for large datasets
const efficientData = [
	['john', 30, 'admin'],
	['jane', 25, 'user']
];

// Instead of:
const inefficientData = [
	{name: 'john', age: 30, role: 'admin'},
	{name: 'jane', age: 25, role: 'user'}
];
```

### Memory Management

```typescript
// For large objects, consider streaming or chunking
function processLargeDataset(data: any[]) {
	const chunkSize = 1000;
	const results: Buffer[] = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		results.push(dataCoder.encode(chunk));

		// Process chunk immediately to free memory
		// processChunk(results[results.length - 1]);
	}

	return results;
}
```

### Benchmarking

```typescript
// Benchmark encoding performance
function benchmarkEncoding(data: any, iterations: number = 1000) {
	const start = performance.now();

	for (let i = 0; i < iterations; i++) {
		dataCoder.encode(data);
	}

	const end = performance.now();
	const avgTime = (end - start) / iterations;

	console.log(`Average encoding time: ${avgTime.toFixed(3)}ms`);
	console.log(`Encoded size: ${dataCoder.getEncodedSize(data)} bytes`);
}
```

## 🧪 Testing

### Unit Testing

```typescript
import {describe, it, expect} from 'vitest';
import {DataCoder}            from '@osmium/coder';

describe('DataCoder', () => {
	const coder = new DataCoder();

	it('should encode and decode simple objects', () => {
		const data = {name: 'test', value: 42};
		const buffer = coder.encode(data);
		const result = coder.decode(buffer);

		expect(result).toEqual(data);
	});

	it('should preserve Map and Set types', () => {
		const data = {
			map: new Map([['key', 'value']]),
			set: new Set([1, 2, 3])
		};

		const buffer = coder.encode(data);
		const result = coder.decode(buffer);

		expect(result.map instanceof Map).toBe(true);
		expect(result.set instanceof Set).toBe(true);
		expect(result.map.get('key')).toBe('value');
		expect(result.set.has(2)).toBe(true);
	});
});
```

### Integration Testing

```typescript
// Test with real-world data structures
const realWorldData = {
	users   : new Map([
		[
			'user1', {
			profile    : {name: 'John', age: 30},
			permissions: new Set(['read', 'write']),
			lastLogin  : new Date('2023-01-01')
		}
		]
	]),
	settings: {
		theme        : 'dark',
		notifications: true,
		features     : ['feature1', 'feature2']
	}
};

// Test round-trip
const buffer = dataCoder.encode(realWorldData);
const restored = dataCoder.decode(buffer);

// Verify all types and values are preserved
console.assert(restored.users instanceof Map);
console.assert(restored.users.get('user1').permissions instanceof Set);
console.assert(restored.users.get('user1').lastLogin instanceof Date);
```

## 🔗 Integration Examples

### Database Storage

```typescript
// Store complex objects in database as binary
class DatabaseService {
	private coder = new DataCoder();

	async saveObject(id: string, data: any): Promise<void> {
		const buffer = this.coder.encode(data);
		await this.db.store(id, buffer);
	}

	async loadObject<T>(id: string): Promise<T> {
		const buffer = await this.db.retrieve(id);
		return this.coder.decode<T>(buffer);
	}
}
```

### Network Communication

```typescript
// Send complex objects over network
class NetworkService {
  private coder = new DataCoder();
  
  sendMessage(socket: WebSocket, data: any): void {
    const buffer = this.coder.encode(data);
    socket.send(buffer);
  }
  
  onMessage(buffer: ArrayBuffer): any {
    return this.coder.decode(Buffer.from(buffer));
  }
}
```

### File Storage

```typescript
import {promises as fs} from 'fs';

// Save/load objects to/from files
class FileStorage {
	private coder = new DataCoder();

	async saveToFile(filename: string, data: any): Promise<void> {
		const buffer = this.coder.encode(data);
		await fs.writeFile(filename, buffer);
	}

	async loadFromFile<T>(filename: string): Promise<T> {
		const buffer = await fs.readFile(filename);
		return this.coder.decode<T>(buffer);
	}
}
```

## 📚 Examples

See the [examples directory](../examples/DataCoder/) for more comprehensive examples and use cases.

## 🔗 Related

- [CoderTools Documentation](./CoderTools.md) - Utility functions and encoding
- [Serializer Documentation](./Serializer.md) - Schema-based serialization
- [Main Documentation](../README.md) - Overview and quick start