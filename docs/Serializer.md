# Serializer Documentation

Serializer is a high-performance packet serialization system that provides schema-based data serialization with compression, integrity checking, and version management. Built on
top of DataCoder, it offers optimal performance for structured data with predictable schemas.

## ✨ Features

- 🗂️ **Schema Management** - Define and manage data schemas for optimal serialization
- 🗜️ **Compression Support** - Built-in compression with configurable thresholds
- ✅ **Integrity Checking** - CRC32 checksums for data integrity verification
- 📦 **Packet Format** - Structured packet format with metadata
- 🔄 **Version Control** - Backward-compatible versioning system
- ⚡ **Performance Optimization** - Schema-based field ordering and validation
- 🛡️ **Type Safety** - Full TypeScript integration with schema validation
- 🔧 **Flexible Configuration** - Customizable compression and validation options

## 📦 Installation & Import

```typescript
import {Serializer, serializer} from '@osmium/coder';

// Use the pre-configured instance
serializer.registerSchema(1, ['name', 'age', 'email']);
const packet = serializer.serialize({name: 'John', age: 30, email: 'john@example.com'}, 1);

// Or create a custom instance
const customSerializer = new Serializer(undefined, {
	useCompress: compressionPlugin,
	useCRC32   : true
});
```

## 🚀 Quick Start

### Basic Serialization

```typescript
import {serializer} from '@osmium/coder';

// Simple object without schema
const data = {message: 'Hello, World!', timestamp: Date.now()};
const packet = serializer.serialize(data);
const restored = serializer.deserialize(packet);

console.log(restored); // { message: 'Hello, World!', timestamp: 1640995200000 }
```

### Schema-Based Serialization

```typescript
// Register a schema for user data
serializer.registerSchema(1, ['id', 'name', 'email', 'active']);

// Serialize with schema (more efficient)
const user = {id: 123, name: 'John Doe', email: 'john@example.com', active: true};
const packet = serializer.serialize(user, 1);
const restored = serializer.deserialize(packet);

console.log(restored); // { id: 123, name: 'John Doe', email: 'john@example.com', active: true }
```

## 🗂️ Schema Management

Schemas define the structure of your data for optimal serialization performance.

### Schema Registration

```typescript
// Register schemas with unique IDs
serializer.registerSchema(1, ['id', 'name', 'email']);
serializer.registerSchema(2, ['title', 'content', 'author', 'timestamp']);
serializer.registerSchema(3, ['productId', 'quantity', 'price', 'discount']);

// Schema fields are automatically sorted for consistency
const schema = serializer.getSchema(1);
console.log(schema); // ['email', 'id', 'name'] (sorted alphabetically)
```

### Schema Validation

```typescript
// Data must match schema exactly
const userSchema = ['id', 'name', 'email'];
serializer.registerSchema(10, userSchema);

// Valid data
const validUser = {id: 1, name: 'John', email: 'john@example.com'};
const packet1 = serializer.serialize(validUser, 10); // ✅ Success

// Invalid data - missing field
const invalidUser1 = {id: 1, name: 'John'}; // Missing email
try {
	serializer.serialize(invalidUser1, 10); // ❌ Throws error
} catch (error) {
	console.log(error.message); // "Schema validation failed: missing fields: email"
}

// Invalid data - extra field
const invalidUser2 = {id: 1, name: 'John', email: 'john@example.com', age: 30};
try {
	serializer.serialize(invalidUser2, 10); // ❌ Throws error
} catch (error) {
	console.log(error.message); // "Schema validation failed: unexpected fields: age"
}
```

### Schema Management Operations

```typescript
// Check if schema exists
const exists = serializer.hasSchema(1); // true

// Get all registered schemas
const allSchemas = serializer.getRegisteredSchemas();
console.log(allSchemas);
// {
//   1: ['email', 'id', 'name'],
//   2: ['author', 'content', 'timestamp', 'title'],
//   3: ['discount', 'price', 'productId', 'quantity']
// }

// Get schema IDs
const schemaIds = serializer.getRegisteredSchemaIds();
console.log(schemaIds); // [1, 2, 3]

// Update existing schema
serializer.updateSchema(1, ['id', 'name', 'email', 'phone']);

// Remove schema
serializer.unregisterSchema(3);
```

### Auto-Schema Detection

```typescript
// Register schemas first
serializer.registerSchema(100, ['name', 'age']);
serializer.registerSchema(101, ['title', 'content']);

// Serialize without specifying schema ID - auto-detection
const person = {name: 'John', age: 30};
const packet = serializer.serialize(person); // Automatically uses schema 100

const article = {title: 'Hello', content: 'World'};
const packet2 = serializer.serialize(article); // Automatically uses schema 101
```

## 📦 Packet Format

Serializer creates structured packets with metadata for efficient processing.

### Packet Structure

```
[Version][Flags][CRC32?][SchemaID?][Data]
```

- **Version** (1 byte): Packet format version
- **Flags** (1 byte): Compression, CRC32, Schema flags
- **CRC32** (4 bytes, optional): Data integrity checksum
- **SchemaID** (4 bytes, optional): Schema identifier
- **Data** (variable): Serialized payload

### Packet Information

```typescript
const data = {name: 'John', age: 30};
const packet = serializer.serialize(data);

// Analyze packet structure
const info = serializer.getPacketInfo(packet);
console.log(info);
// {
//   version: 3,
//   useCompress: false,
//   useCRC32: true,
//   useSchema: false,
//   dataSize: 25
// }

// With schema
serializer.registerSchema(50, ['name', 'age']);
const schemaPacket = serializer.serialize(data, 50);
const schemaInfo = serializer.getPacketInfo(schemaPacket);
console.log(schemaInfo);
// {
//   version: 3,
//   useCompress: false,
//   useCRC32: true,
//   useSchema: true,
//   schemaId: 50,
//   dataSize: 15
// }
```

## 🗜️ Compression Support

Automatic compression for large payloads with configurable thresholds.

### Compression Configuration

```typescript
import * as zlib from 'zlib';

const compressor = {
	compress  : (data: Buffer) => zlib.gzipSync(data),
	decompress: (data: Buffer) => zlib.gunzipSync(data)
};

const serializer = new Serializer(undefined, {
	useCompress: compressor,
	useCRC32   : true
});

// Set compression threshold (default: 1024 bytes)
serializer.setCompressionThreshold(512); // Compress data larger than 512 bytes
```

### Compression Behavior

```typescript
// Small data - no compression
const smallData = {message: 'Hello'};
const smallPacket = serializer.serialize(smallData);
const smallInfo = serializer.getPacketInfo(smallPacket);
console.log(smallInfo.useCompress); // false

// Large data - automatic compression
const largeData = {content: 'x'.repeat(2000)};
const largePacket = serializer.serialize(largeData);
const largeInfo = serializer.getPacketInfo(largePacket);
console.log(largeInfo.useCompress); // true
```

### Custom Compression

```typescript
// Custom compression implementation
const customCompressor = {
	compress  : (data: Buffer): Buffer => {
		// Your custom compression logic
		return compressedData;
	},
	decompress: (data: Buffer): Buffer => {
		// Your custom decompression logic
		return decompressedData;
	}
};

const serializer = new Serializer(undefined, {
	useCompress: customCompressor,
	useCRC32   : true
});
```

## ✅ Integrity Checking

CRC32 checksums ensure data integrity during transmission and storage.

### CRC32 Configuration

```typescript
// Enable CRC32 checking (default: enabled)
const serializer = new Serializer(undefined, {
	useCRC32: true
});

// Disable CRC32 for maximum performance
const fastSerializer = new Serializer(undefined, {
	useCRC32: false
});
```

### Integrity Verification

```typescript
const data = {important: 'data'};
const packet = serializer.serialize(data);

// Packet includes CRC32 checksum
const info = serializer.getPacketInfo(packet);
console.log(info.useCRC32); // true

// Deserialization automatically verifies checksum
try {
	const restored = serializer.deserialize(packet);
	console.log('Data integrity verified');
} catch (error) {
	console.log('Data corruption detected:', error.message);
}

// Simulate corruption
const corruptedPacket = Buffer.from(packet);
corruptedPacket[corruptedPacket.length - 1] = 0xFF; // Corrupt last byte

try {
	serializer.deserialize(corruptedPacket);
} catch (error) {
	console.log(error.message); // "Input data CRC32 error"
}
```

## 🔧 Advanced Configuration

### Custom DataCoder Integration

```typescript
import {DataCoder, Serializer} from '@osmium/coder';

// Create custom DataCoder with specific options
const customCoder = new DataCoder({
	useRecords   : false,
	mapsAsObjects: true
});

// Use with Serializer
const serializer = new Serializer(customCoder, {
	useCRC32   : true,
	useCompress: compressionPlugin
});
```

### Multiple Serializer Instances

```typescript
// Different serializers for different use cases
const fastSerializer = new Serializer(undefined, {
	useCRC32   : false,
	useCompress: null
});

const secureSerializer = new Serializer(undefined, {
	useCRC32   : true,
	useCompress: compressionPlugin
});

const compactSerializer = new Serializer(new DataCoder({
	useRecords     : true,
	structuredClone: false
}), {
	useCRC32   : false,
	useCompress: compressionPlugin
});
```

## 🎯 Performance Optimization

### Schema Benefits

```typescript
// Without schema - field names included in each serialization
const withoutSchema = serializer.serialize({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 30
});

// With schema - only values serialized
serializer.registerSchema(200, ['firstName', 'lastName', 'email', 'age']);
const withSchema = serializer.serialize({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 30
}, 200);

console.log(`Without schema: ${withoutSchema.length} bytes`);
console.log(`With schema: ${withSchema.length} bytes`);
// Schema version is typically 30-50% smaller
```

### Batch Processing

```typescript
// Efficient batch processing with schemas
function processBatch<T>(items: T[], schemaId: number): Buffer[] {
	return items.map(item => serializer.serialize(item, schemaId));
}

// Process large datasets
const users = [
	{id: 1, name: 'John', email: 'john@example.com'},
	{id: 2, name: 'Jane', email: 'jane@example.com'},
	// ... thousands more
];

serializer.registerSchema(300, ['id', 'name', 'email']);
const packets = processBatch(users, 300);
```

### Memory Management

```typescript
// Stream processing for large datasets
function* processLargeDataset(data: any[], schemaId: number) {
	for (const item of data) {
		yield serializer.serialize(item, schemaId);
	}
}

// Use generator to avoid loading all data into memory
const dataStream = processLargeDataset(largeDataset, 400);
for (const packet of dataStream) {
	// Process packet immediately
	processPacket(packet);
}
```

## 🛡️ Error Handling

### Serialization Errors

```typescript
try {
  const packet = serializer.serialize(data, schemaId);
} catch (error) {
  if (error.message.includes('Schema validation failed')) {
    console.log('Data does not match schema');
    // Handle schema mismatch
  } else if (error.message.includes('Schema with id')) {
    console.log('Schema not found');
    // Handle missing schema
  } else {
    console.log('Serialization error:', error.message);
    // Handle other errors
  }
}
```

### Deserialization Errors

```typescript
try {
  const data = serializer.deserialize(packet);
} catch (error) {
  if (error.message.includes('version mismatch')) {
    console.log('Incompatible packet version');
    // Handle version incompatibility
  } else if (error.message.includes('CRC32 error')) {
    console.log('Data corruption detected');
    // Handle data corruption
  } else if (error.message.includes('compressor plugin not used')) {
    console.log('Missing compression plugin');
    // Handle compression issues
  } else {
    console.log('Deserialization error:', error.message);
    // Handle other errors
  }
}
```

### Schema Management Errors

```typescript
try {
	serializer.registerSchema(1, ['field1', 'field2']);
} catch (error) {
	if (error.message.includes('already registered')) {
		console.log('Schema ID conflict');
		// Handle duplicate schema ID
	} else if (error.message.includes('non-empty array')) {
		console.log('Invalid schema format');
		// Handle invalid schema
	}
}
```

## 🧪 Testing

### Unit Testing

```typescript
import {describe, it, expect} from 'vitest';
import {Serializer}           from '@osmium/coder';

describe('Serializer', () => {
	const serializer = new Serializer();

	beforeEach(() => {
		// Clear schemas between tests
		const schemaIds = serializer.getRegisteredSchemaIds();
		schemaIds.forEach(id => serializer.unregisterSchema(id));
	});

	it('should serialize and deserialize with schema', () => {
		serializer.registerSchema(1, ['name', 'age']);

		const data = {name: 'John', age: 30};
		const packet = serializer.serialize(data, 1);
		const result = serializer.deserialize(packet);

		expect(result).toEqual(data);
	});

	it('should detect schema automatically', () => {
		serializer.registerSchema(2, ['title', 'content']);

		const article = {title: 'Test', content: 'Content'};
		const packet = serializer.serialize(article); // No schema ID
		const result = serializer.deserialize(packet);

		expect(result).toEqual(article);
	});

	it('should validate schema fields', () => {
		serializer.registerSchema(3, ['required1', 'required2']);

		const invalidData = {required1: 'value'}; // Missing required2

		expect(() => {
			serializer.serialize(invalidData, 3);
		}).toThrow('Schema validation failed');
	});
});
```

### Integration Testing

```typescript
// Test with compression
describe('Serializer with compression', () => {
  const compressor = {
    compress: (data: Buffer) => zlib.gzipSync(data),
    decompress: (data: Buffer) => zlib.gunzipSync(data)
  };
  
  const serializer = new Serializer(undefined, {
    useCompress: compressor,
    useCRC32: true
  });
  
  it('should compress large data', () => {
    const largeData = { content: 'x'.repeat(2000) };
    const packet = serializer.serialize(largeData);
    const info = serializer.getPacketInfo(packet);
    
    expect(info.useCompress).toBe(true);
    
    const result = serializer.deserialize(packet);
    expect(result).toEqual(largeData);
  });
});
```

## 🔗 Integration Examples

### API Response Serialization

```typescript
// Efficient API response serialization
class APISerializer {
  private serializer = new Serializer();
  
  constructor() {
    // Register common response schemas
    this.serializer.registerSchema(1, ['id', 'name', 'email', 'createdAt']);
    this.serializer.registerSchema(2, ['id', 'title', 'content', 'author', 'publishedAt']);
    this.serializer.registerSchema(3, ['success', 'message', 'data']);
  }
  
  serializeUser(user: any): Buffer {
    return this.serializer.serialize(user, 1);
  }
  
  serializeArticle(article: any): Buffer {
    return this.serializer.serialize(article, 2);
  }
  
  serializeResponse(response: any): Buffer {
    return this.serializer.serialize(response, 3);
  }
}
```

### Database Record Serialization

```typescript
// Efficient database record storage
class DatabaseSerializer {
	private serializer = new Serializer(undefined, {
		useCompress: compressionPlugin,
		useCRC32   : true
	});

	constructor() {
		// Register table schemas
		this.serializer.registerSchema(10, ['id', 'name', 'email', 'password_hash']);
		this.serializer.registerSchema(11, ['id', 'user_id', 'title', 'content', 'created_at']);
	}

	async saveUser(user: any): Promise<void> {
		const packet = this.serializer.serialize(user, 10);
		await this.db.store('users', user.id, packet);
	}

	async loadUser(id: number): Promise<any> {
		const packet = await this.db.retrieve('users', id);
		return this.serializer.deserialize(packet);
	}
}
```

### Message Queue Integration

```typescript
// Message queue with schema-based serialization
class MessageQueue {
	private serializer = new Serializer();

	constructor() {
		// Register message schemas
		this.serializer.registerSchema(20, ['type', 'payload', 'timestamp']);
		this.serializer.registerSchema(21, ['userId', 'action', 'data']);
	}

	publishMessage(message: any): void {
		const packet = this.serializer.serialize(message, 20);
		this.queue.publish(packet);
	}

	onMessage(packet: Buffer): any {
		return this.serializer.deserialize(packet);
	}
}
```

### Real-time Communication

```typescript
// WebSocket with efficient serialization
class RealtimeConnection {
  private serializer = new Serializer(undefined, {
    useCRC32: true,
    useCompress: compressionPlugin
  });
  
  constructor() {
    // Register event schemas
    this.serializer.registerSchema(30, ['event', 'data', 'timestamp']);
    this.serializer.registerSchema(31, ['userId', 'message', 'channel']);
  }
  
  sendEvent(socket: WebSocket, event: any): void {
    const packet = this.serializer.serialize(event, 30);
    socket.send(packet);
  }
  
  sendMessage(socket: WebSocket, message: any): void {
    const packet = this.serializer.serialize(message, 31);
    socket.send(packet);
  }
  
  onData(data: ArrayBuffer): any {
    const buffer = Buffer.from(data);
    return this.serializer.deserialize(buffer);
  }
}
```

## 📊 Performance Benchmarks

### Schema vs Non-Schema Performance

```typescript
// Benchmark schema performance
function benchmarkSerialization() {
  const data = {
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30,
    active: true
  };
  
  const iterations = 10000;
  
  // Without schema
  const start1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const packet = serializer.serialize(data);
    serializer.deserialize(packet);
  }
  const time1 = performance.now() - start1;
  
  // With schema
  serializer.registerSchema(999, Object.keys(data));
  const start2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const packet = serializer.serialize(data, 999);
    serializer.deserialize(packet);
  }
  const time2 = performance.now() - start2;
  
  console.log(`Without schema: ${time1.toFixed(2)}ms`);
  console.log(`With schema: ${time2.toFixed(2)}ms`);
  console.log(`Performance improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
}
```

## 📚 Examples

See the [examples directory](../examples/Serializer/) for more comprehensive examples and use cases.

## 🔗 Related

- [CoderTools Documentation](./CoderTools.md) - Utility functions and encoding
- [DataCoder Documentation](./DataCoder.md) - Binary serialization
- [Main Documentation](../README.md) - Overview and quick start