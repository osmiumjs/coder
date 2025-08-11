# @osmium/coder

[![npm version](https://badge.fury.io/js/@osmium%2Fcoder.svg)](https://badge.fury.io/js/@osmium%2Fcoder)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-97.93%25-brightgreen.svg)](./COVERAGE.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, type-safe data encoding, serialization, and utility library for JavaScript and TypeScript. Provides powerful tools for data transformation, binary operations,
checksums, and advanced serialization with schema support.

## ✨ Features

- 🔧 **CoderTools** - Comprehensive utility toolkit for data manipulation
    - Base encoding (Base16-Base93) with multiple variants
    - Binary operations and bit manipulation
    - Checksum algorithms (CRC32, MD5, SHA variants)
    - Random data generation and validation
    - Buffer utilities and numeric conversions
- 📦 **DataCoder** - Advanced binary serialization with custom type support
    - MessagePack-based encoding with extensions
    - Custom type registration and serialization
    - Built-in support for Map, Set, and complex objects
    - Hex/Base64 encoding utilities
- 🗂️ **Serializer** - High-performance packet serialization with schema support
    - Schema-based serialization for optimal performance
    - Compression support with configurable thresholds
    - CRC32 integrity checking
    - Version management and backward compatibility
- 🚀 **Performance Optimized** - Efficient algorithms and minimal overhead
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- 🧪 **Well Tested** - Comprehensive test coverage

## 📦 Installation

```bash
npm install @osmium/coder
```

```bash
yarn add @osmium/coder
```

```bash
pnpm add @osmium/coder
```

## 🚀 Quick Start

```typescript
import {CoderTools, dataCoder, serializer} from '@osmium/coder';

// Base encoding with CoderTools
const encoded = CoderTools.base64Encode('Hello World');
const decoded = CoderTools.base64Decode(encoded);

// Binary serialization with DataCoder
const data = {name: 'John', age: 30, tags: new Set(['dev', 'js'])};
const buffer = dataCoder.encode(data);
const restored = dataCoder.decode(buffer);

// Schema-based serialization with Serializer
serializer.registerSchema(1, ['name', 'age', 'email']);
const packet = serializer.serialize({name: 'John', age: 30, email: 'john@example.com'}, 1);
const unpacked = serializer.deserialize(packet);
```

## 📚 Core Components

### 🔧 CoderTools

A comprehensive utility toolkit providing:

- **Base Encoding**: Support for Base16, Base32, Base36, Base58, Base62, Base64, Base66, Base85, Base91, Base93
- **Binary Operations**: Bit manipulation, flag operations, and binary utilities
- **Checksums**: CRC32, MD5, SHA-1, SHA-256, SHA-512 implementations
- **Random Generation**: Secure random data generation with various formats
- **Buffer Utilities**: Advanced buffer manipulation and conversion tools
- **Validations**: Data validation and format checking utilities

[📖 CoderTools Documentation](./docs/CoderTools.md)

### 📦 DataCoder

Advanced binary serialization engine featuring:

- **MessagePack Integration**: High-performance binary serialization
- **Custom Types**: Register and serialize custom classes and objects
- **Built-in Extensions**: Native support for Map, Set, Date, and more
- **Format Support**: Hex, Base64, and binary output formats
- **Type Safety**: Full TypeScript integration with type preservation

[📖 DataCoder Documentation](./docs/DataCoder.md)

### 🗂️ Serializer

High-performance packet serialization system with:

- **Schema Management**: Define and manage data schemas for optimal serialization
- **Compression**: Built-in compression with configurable thresholds
- **Integrity Checking**: CRC32 checksums for data integrity
- **Version Control**: Backward-compatible versioning system
- **Performance Optimization**: Schema-based field ordering and validation

[📖 Serializer Documentation](./docs/Serializer.md)

## 🎯 Use Cases

### Data Encoding & Transformation

```typescript
import {CoderTools} from '@osmium/coder';

// Multi-format encoding
const data = 'Hello, World!';
const base64 = CoderTools.base64Encode(data);
const base58 = CoderTools.base58Encode(data);
const hex = CoderTools.base16Encode(data);

// Checksum generation
const crc32 = CoderTools.crc32(Buffer.from(data));
const sha256 = CoderTools.sha256(data);
```

### Binary Serialization

```typescript
import {DataCoder} from '@osmium/coder';

const coder = new DataCoder();

// Serialize complex objects
const complexData = {
	users   : new Map([['john', {age: 30}], ['jane', {age: 25}]]),
	tags    : new Set(['important', 'urgent']),
	metadata: {created: new Date(), version: 1.2}
};

const buffer = coder.encode(complexData);
const restored = coder.decode(buffer);
```

### Schema-Based Serialization

```typescript
import {Serializer} from '@osmium/coder';

const serializer = new Serializer();

// Define schemas for different data types
serializer.registerSchema(1, ['id', 'name', 'email']);
serializer.registerSchema(2, ['title', 'content', 'author', 'timestamp']);

// Serialize with schema optimization
const user = {id: 123, name: 'John Doe', email: 'john@example.com'};
const packet = serializer.serialize(user, 1);

// Automatic schema detection
const autoPacket = serializer.serialize(user); // Auto-detects schema 1
```

## 🔧 Advanced Configuration

### Custom Type Registration

```typescript
import {dataCoder} from '@osmium/coder';

class CustomClass {
	constructor(public value: string) {}
}

// Register custom serialization
dataCoder.use(
	10, // Type ID
	CustomClass,
	(instance) => instance.value, // Encoder
	(data) => new CustomClass(data) // Decoder
);
```

### Compression Setup

```typescript
import {Serializer} from '@osmium/coder';
import * as zlib    from 'zlib';

const serializer = new Serializer(undefined, {
	useCompress: {
		compress  : (data) => zlib.gzipSync(data),
		decompress: (data) => zlib.gunzipSync(data)
	},
	useCRC32   : true
});
```

## ⚡ Performance

- **Encoding Speed**: Optimized algorithms for all base encodings
- **Memory Efficiency**: Streaming operations for large datasets
- **Serialization**: MessagePack-based binary format for minimal overhead
- **Schema Optimization**: Field reordering and validation for maximum performance
- **Compression**: Smart compression with configurable thresholds

## 🧪 Testing

The library includes comprehensive test coverage across all components:

```bash
npm test
```

```bash
npm run test:watch
```

## 📚 Examples

Comprehensive examples are available in the [examples directory](./examples/):

- **[Basic Usage](./examples/basic-usage.ts)** - Getting started with all components
- **[Advanced Serialization](./examples/advanced-serialization.ts)** - Complex scenarios
- **[Performance Comparison](./examples/performance-comparison.ts)** - Benchmarks
- **[Real-world Examples](./examples/real-world-examples.ts)** - Practical use cases

```bash
# Run examples
npx tsx examples/basic-usage.ts
```

## 📄 API Reference

### CoderTools Static Methods

- Base encoding: `base16Encode/Decode`, `base32Encode/Decode`, etc.
- Checksums: `crc32()`, `md5()`, `sha256()`, `sha512()`
- Random: `randomBytes()`, `randomHex()`, `randomBase64()`
- Binary: `binFlagsToBuf()`, `bufToBinFlags()`
- Numeric: `int8UToBuf()`, `bufToInt32U()`, etc.

### DataCoder Instance Methods

- `encode(data)` - Serialize to Buffer
- `decode(buffer)` - Deserialize from Buffer
- `encodeToHex(data)` - Serialize to hex string
- `decodeFromHex(hex)` - Deserialize from hex
- `encodeToBase64(data)` - Serialize to base64
- `decodeFromBase64(base64)` - Deserialize from base64
- `use(type, Class, encode, decode)` - Register custom type

### Serializer Instance Methods

- `serialize(data, schema?)` - Create serialized packet
- `deserialize(packet)` - Restore data from packet
- `registerSchema(id, fields)` - Register data schema
- `getPacketInfo(packet)` - Analyze packet structure
- `setCompressionThreshold(bytes)` - Configure compression

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📞 Support

- 📖 [Documentation](https://github.com/osmiumjs/coder)
- 🐛 [Issue Tracker](https://github.com/osmiumjs/coder/issues)
- 💬 [Discussions](https://github.com/osmiumjs/coder/discussions)

---

Made with ❤️ by Vasiliy Isaichkin