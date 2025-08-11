# Examples

This directory contains comprehensive examples demonstrating the capabilities of @osmium/coder.

## 📁 Structure

- **[BasicUsage.ts](./BasicUsage.ts)** - Simple examples for getting started
- **[AdvancedSerialization.ts](./AdvancedSerialization.ts)** - Complex serialization scenarios
- **[PerformanceComparison.ts](./PerformanceComparison.ts)** - Performance benchmarks
- **[RealWorldExamples.ts](./RealWorldExamples.ts)** - Practical use cases

## 🚀 Running Examples

```bash
# Install dependencies
npm install

# Run TypeScript examples directly
npx tsx examples/BasicUsage.ts
npx tsx examples/AdvancedSerialization.ts
npx tsx examples/PerformanceComparison.ts
npx tsx examples/RealWorldExamples.ts
```

## 📚 What You'll Learn

### 🔰 Basic Usage (`BasicUsage.ts`)
- CoderTools encoding and utility functions
- DataCoder binary serialization basics
- Serializer schema-based operations
- Error handling patterns
- Round-trip validation techniques

### 🔧 Advanced Serialization (`advanced-serialization.ts`)
- Custom type registration and serialization
- Complex nested data structures
- Schema optimization techniques
- Compression and integrity checking
- Performance optimization strategies
- Memory management and cleanup

### 📊 Performance Comparison (`performance-comparison.ts`)
- Base encoding performance analysis
- Schema vs non-schema serialization benchmarks
- Memory usage optimization
- Compression effectiveness analysis
- Data type performance comparison
- Throughput measurements

### 🌍 Real-World Examples (`real-world-examples.ts`)
- API response caching system
- Database record storage optimization
- WebSocket message handling
- Session management and authentication
- Microservice communication patterns
- Production-ready error handling

## 🎯 Key Concepts Demonstrated

### CoderTools
- **Base Encoding**: Base16, Base32, Base58, Base62, Base64, Base66, Base93
- **Checksums**: CRC32, XOR checksum, DJB2 hash, SDBM hash
- **Random Generation**: Secure random bytes, hex strings, base64 strings
- **Buffer Operations**: Creation, manipulation, and conversion
- **Validation**: Format checking and data validation

### DataCoder
- **Binary Serialization**: MessagePack-based encoding/decoding
- **Custom Types**: Registration and handling of custom classes
- **Built-in Support**: Map, Set, Date, and complex objects
- **Output Formats**: Binary, hex, and base64 representations
- **Utility Methods**: Cloning, comparison, and size calculation

### Serializer
- **Schema Management**: Registration, validation, and optimization
- **Packet Format**: Structured packets with metadata
- **Compression**: Automatic compression with configurable thresholds
- **Integrity Checking**: CRC32 checksums for data verification
- **Performance**: Schema-based optimization and batch processing

## 💡 Best Practices Shown

1. **Type Safety**: Proper TypeScript usage with strict mode
2. **Error Handling**: Comprehensive error catching and recovery
3. **Performance**: Optimization techniques for different scenarios
4. **Memory Management**: Efficient memory usage patterns
5. **Security**: Secure random generation and data integrity
6. **Scalability**: Batch processing and streaming techniques
7. **Maintainability**: Clean code structure and documentation

## 🔧 Prerequisites

- Node.js 16+ or compatible TypeScript environment
- Basic understanding of TypeScript/JavaScript
- Familiarity with binary data concepts (helpful but not required)

Each example is self-contained and includes detailed comments explaining the concepts and best practices.
