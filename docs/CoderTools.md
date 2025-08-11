# CoderTools Documentation

CoderTools is a comprehensive utility toolkit that provides a wide range of data manipulation, encoding, and cryptographic functions. It combines multiple specialized classes into
a single, easy-to-use interface.

## ✨ Features

- 🔤 **Base Encoding** - Support for Base16 through Base93 with multiple variants
- 🔢 **Binary Operations** - Bit manipulation and flag operations
- ✅ **Checksums** - CRC32, MD5, SHA-1, SHA-256, SHA-512 implementations
- 🎲 **Random Generation** - Secure random data generation
- 📦 **Buffer Utilities** - Advanced buffer manipulation tools
- 🔍 **Validations** - Data validation and format checking
- 🔧 **Numeric Conversion** - Integer and float conversions with endianness support

## 📦 Installation & Import

```typescript
import {CoderTools} from '@osmium/coder';

// Or import individual components
import {
	BaseEncoding,
	BitOperations,
	Checksum,
	Random
} from '@osmium/coder';
```

## 🔤 Base Encoding

CoderTools supports a comprehensive range of base encodings with multiple variants and error handling.

### Supported Encodings

| Encoding   | Alphabet Size | Use Cases                          |
|------------|---------------|------------------------------------|
| **Base16** | 16            | Hexadecimal representation         |
| **Base32** | 32            | Human-readable encoding (RFC 4648) |
| **Base36** | 36            | Alphanumeric encoding              |
| **Base58** | 58            | Bitcoin addresses, short URLs      |
| **Base62** | 62            | URL-safe encoding                  |
| **Base64** | 64            | Email attachments, data URLs       |
| **Base66** | 66            | Extended URL-safe encoding         |
| **Base85** | 85            | Adobe PostScript, Git              |
| **Base91** | 91            | High-density encoding              |
| **Base93** | 93            | Maximum printable ASCII            |

### Basic Usage

```typescript
// Base64 encoding (most common)
const encoded = CoderTools.base64Encode('Hello, World!');
const decoded = CoderTools.base64Decode(encoded);

// Base58 encoding (Bitcoin-style)
const base58 = CoderTools.base58Encode('Hello, World!');
const original = CoderTools.base58Decode(base58);

// Hexadecimal encoding
const hex = CoderTools.base16Encode('Hello, World!');
const text = CoderTools.base16Decode(hex);
```

### Advanced Base64 Variants

```typescript
// URL-safe Base64
const urlSafe = CoderTools.Base64.encodeUrl('Hello+World/=');
const decoded = CoderTools.Base64.decodeUrl(urlSafe);

// IMAP variant
const imap = CoderTools.Base64.encodeIMAP('Hello, World!');
const original = CoderTools.Base64.decodeIMAP(imap);

// Custom variants
const variants = CoderTools.Base64.getVariants();
console.log(variants); // Lists all available variants
```

### Base58 Variants

```typescript
// Bitcoin variant (default)
const bitcoin = CoderTools.Base58.encode('Hello, World!');

// Ripple variant
const ripple = CoderTools.Base58.encodeRipple('Hello, World!');

// Flickr variant
const flickr = CoderTools.Base58.encodeFlickr('Hello, World!');
```

### Base85 Variants

```typescript
// RFC 1924 variant (default)
const rfc1924 = CoderTools.Base85.encode('Hello, World!');

// ASCII85 variant
const ascii85 = CoderTools.Base85.encodeASCII85('Hello, World!');

// Z85 variant (requires length multiple of 4)
const z85 = CoderTools.Base85.encodeZ85('Hell'); // 4 bytes
```

### Buffer Output

```typescript
// Get results as Buffer instead of string
const buffer = CoderTools.Base64.decode('SGVsbG8gV29ybGQ=', true);
console.log(buffer); // Buffer instance

// Works with all encodings
const hexBuffer = CoderTools.Base16.decode('48656C6C6F', true);
```

### Encoding Detection

```typescript
// Auto-detect possible encodings
const possibleEncodings = CoderTools.BaseEncoding.detectEncoding('SGVsbG8gV29ybGQ=');
console.log(possibleEncodings); // ['Base64-Standard']

// Get all supported encodings
const supported = CoderTools.BaseEncoding.getSupportedEncodings();
```

## 🔢 Binary Operations

Powerful bit manipulation and binary flag operations.

### Bit Operations

```typescript
// Set, clear, and toggle bits
let value = 0b1010;
value = CoderTools.setBit(value, 2);    // Set bit 2: 0b1110
value = CoderTools.clearBit(value, 1);  // Clear bit 1: 0b1100
value = CoderTools.toggleBit(value, 0); // Toggle bit 0: 0b1101

// Check bits
const isSet = CoderTools.isBitSet(value, 3); // true
const bitCount = CoderTools.countBits(value); // 3
```

### Binary Flags

```typescript
// Convert boolean array to buffer
const flags = [true, false, true, false, true];
const buffer = CoderTools.binFlagsToBuf(flags);

// Convert buffer back to boolean array
const restored = CoderTools.bufToBinFlags(buffer, 0);
console.log(restored); // [true, false, true, false, true]
```

### Bit Manipulation Utilities

```typescript
// Rotate bits
const rotated = CoderTools.rotateLeft(0b1100, 2); // 0b0011
const rotatedRight = CoderTools.rotateRight(0b1100, 2); // 0b0011

// Reverse bits
const reversed = CoderTools.reverseBits(0b1100); // 0b0011

// Find first set bit
const firstBit = CoderTools.findFirstSetBit(0b1100); // 2
```

## ✅ Checksums & Hashing

Comprehensive checksum and hashing algorithms for data integrity.

### CRC32

```typescript
// Calculate CRC32 checksum
const data = Buffer.from('Hello, World!');
const crc32 = CoderTools.crc32(data);
console.log(crc32.toString(16)); // Hexadecimal CRC32

// CRC32 from string
const crc32String = CoderTools.crc32('Hello, World!');
```

### MD5 Hashing

```typescript
// MD5 hash
const md5Hash = CoderTools.md5('Hello, World!');
console.log(md5Hash); // MD5 hash as hex string

// MD5 from buffer
const buffer = Buffer.from('Hello, World!');
const md5Buffer = CoderTools.md5(buffer);
```

### SHA Hashing

```typescript
// SHA-1
const sha1 = CoderTools.sha1('Hello, World!');

// SHA-256
const sha256 = CoderTools.sha256('Hello, World!');

// SHA-512
const sha512 = CoderTools.sha512('Hello, World!');

// All return hex strings by default
```

### Hash Comparison

```typescript
// Secure hash comparison (timing-safe)
const hash1 = CoderTools.sha256('password123');
const hash2 = CoderTools.sha256('password123');
const isEqual = CoderTools.compareHashes(hash1, hash2); // true
```

## 🎲 Random Generation

Secure random data generation with various output formats.

### Basic Random Generation

```typescript
// Random bytes
const randomBytes = CoderTools.randomBytes(32); // 32 random bytes

// Random hex string
const randomHex = CoderTools.randomHex(16); // 32-character hex string

// Random base64 string
const randomBase64 = CoderTools.randomBase64(16); // Base64 encoded
```

### Random Numbers

```typescript
// Random integer in range
const randomInt = CoderTools.randomInt(1, 100); // 1-100 inclusive

// Random float
const randomFloat = CoderTools.randomFloat(); // 0.0-1.0

// Random float in range
const randomRange = CoderTools.randomFloat(10, 20); // 10.0-20.0
```

### Random Strings

```typescript
// Random alphanumeric string
const randomString = CoderTools.randomString(12); // 12 characters

// Random string with custom alphabet
const customString = CoderTools.randomString(8, 'ABCDEF0123456789');

// Random UUID v4
const uuid = CoderTools.randomUUID(); // Standard UUID format
```

### Cryptographic Random

```typescript
// Cryptographically secure random
const secureBytes = CoderTools.secureRandomBytes(32);
const secureHex = CoderTools.secureRandomHex(16);
const secureString = CoderTools.secureRandomString(20);
```

## 📦 Buffer Utilities

Advanced buffer manipulation and conversion tools.

### Buffer Creation

```typescript
// Create buffers from various types
const intBuffer = CoderTools.int32UToBuf(12345);
const floatBuffer = CoderTools.floatToBuf(3.14159);
const stringBuffer = CoderTools.stringToBuf('Hello');
```

### Buffer Reading

```typescript
const buffer = Buffer.from([0x12, 0x34, 0x56, 0x78]);

// Read integers
const int8 = CoderTools.bufToInt8U(buffer, 0);   // Unsigned 8-bit
const int16 = CoderTools.bufToInt16U(buffer, 0); // Unsigned 16-bit
const int32 = CoderTools.bufToInt32U(buffer, 0); // Unsigned 32-bit

// Read with endianness
const int16LE = CoderTools.bufToInt16ULE(buffer, 0); // Little-endian
const int16BE = CoderTools.bufToInt16UBE(buffer, 0); // Big-endian
```

### Buffer Manipulation

```typescript
// Concatenate buffers
const buf1 = Buffer.from('Hello');
const buf2 = Buffer.from(' World');
const combined = CoderTools.concatBuffers([buf1, buf2]);

// Split buffer
const parts = CoderTools.splitBuffer(combined, 5); // Split at position 5

// Compare buffers
const isEqual = CoderTools.compareBuffers(buf1, buf2);
```

### Endianness Conversion

```typescript
// Convert endianness
const value = 0x12345678;
const swapped = CoderTools.swapEndian32(value); // 0x78563412

// Auto-detect system endianness
const isLittleEndian = CoderTools.isLittleEndian();
```

## 🔍 Validations

Data validation and format checking utilities.

### Format Validation

```typescript
// Email validation
const isValidEmail = CoderTools.isValidEmail('user@example.com'); // true

// URL validation
const isValidURL = CoderTools.isValidURL('https://example.com'); // true

// IP address validation
const isValidIP = CoderTools.isValidIP('192.168.1.1'); // true
const isValidIPv6 = CoderTools.isValidIPv6('2001:db8::1'); // true
```

### Data Type Validation

```typescript
// Hex string validation
const isHex = CoderTools.isValidHex('deadbeef'); // true

// Base64 validation
const isBase64 = CoderTools.isValidBase64('SGVsbG8gV29ybGQ='); // true

// JSON validation
const isJSON = CoderTools.isValidJSON('{"key": "value"}'); // true
```

### Numeric Validation

```typescript
// Number range validation
const inRange = CoderTools.isInRange(50, 1, 100); // true

// Integer validation
const isInteger = CoderTools.isInteger(42); // true
const isPositive = CoderTools.isPositiveInteger(42); // true

// Float validation
const isFloat = CoderTools.isFloat(3.14); // true
```

### String Validation

```typescript
// Length validation
const validLength = CoderTools.isValidLength('hello', 3, 10); // true

// Pattern validation
const matchesPattern = CoderTools.matchesPattern('abc123', /^[a-z]+\d+$/); // true

// Character set validation
const isAlphanumeric = CoderTools.isAlphanumeric('abc123'); // true
const isAlpha = CoderTools.isAlpha('abcdef'); // true
const isNumeric = CoderTools.isNumeric('123456'); // true
```

## 🔧 Numeric Conversion

Integer and floating-point conversions with endianness support.

### Integer Conversions

```typescript
// 8-bit integers
const int8Buf = CoderTools.int8UToBuf(255);
const int8Val = CoderTools.bufToInt8U(int8Buf, 0);

// 16-bit integers
const int16Buf = CoderTools.int16UToBuf(65535);
const int16Val = CoderTools.bufToInt16U(int16Buf, 0);

// 32-bit integers
const int32Buf = CoderTools.int32UToBuf(4294967295);
const int32Val = CoderTools.bufToInt32U(int32Buf, 0);

// 64-bit integers (BigInt)
const int64Buf = CoderTools.int64UToBuf(BigInt('18446744073709551615'));
const int64Val = CoderTools.bufToInt64U(int64Buf, 0);
```

### Signed Integers

```typescript
// Signed variants
const signedBuf = CoderTools.int32SToBuf(-2147483648);
const signedVal = CoderTools.bufToInt32S(signedBuf, 0);
```

### Floating-Point Numbers

```typescript
// 32-bit float
const floatBuf = CoderTools.floatToBuf(3.14159);
const floatVal = CoderTools.bufToFloat(floatBuf, 0);

// 64-bit double
const doubleBuf = CoderTools.doubleToBuf(3.141592653589793);
const doubleVal = CoderTools.bufToDouble(doubleBuf, 0);
```

### Endianness Control

```typescript
// Little-endian
const leBuf = CoderTools.int32UToBuffLE(0x12345678);
const leVal = CoderTools.bufToInt32ULE(leBuf, 0);

// Big-endian
const beBuf = CoderTools.int32UToBuffBE(0x12345678);
const beVal = CoderTools.bufToInt32UBE(beBuf, 0);
```

## 🎯 Advanced Usage

### Custom Encoding Pipeline

```typescript
// Create a custom encoding pipeline
function customEncode(data: string): string {
	// 1. Convert to buffer
	const buffer = Buffer.from(data, 'utf8');

	// 2. Add checksum
	const crc32 = CoderTools.crc32(buffer);
	const withChecksum = Buffer.concat([buffer, CoderTools.int32UToBuf(crc32)]);

	// 3. Encode with Base64
	return CoderTools.base64Encode(withChecksum);
}

function customDecode(encoded: string): string {
	// 1. Decode from Base64
	const buffer = CoderTools.base64Decode(encoded, true) as Buffer;

	// 2. Extract checksum
	const dataLength = buffer.length - 4;
	const data = buffer.subarray(0, dataLength);
	const checksum = CoderTools.bufToInt32U(buffer, dataLength);

	// 3. Verify checksum
	const calculatedCRC = CoderTools.crc32(data);
	if (calculatedCRC !== checksum) {
		throw new Error('Checksum mismatch');
	}

	// 4. Return original data
	return data.toString('utf8');
}
```

### Performance Optimization

```typescript
// Reuse buffers for better performance
const reusableBuffer = Buffer.allocUnsafe(1024);

function efficientProcessing(data: string[]): string[] {
	return data.map(item => {
		// Use pre-allocated buffer when possible
		const encoded = CoderTools.base64Encode(item);
		return encoded;
	});
}

// Batch operations
function batchHash(items: string[]): string[] {
	return items.map(item => CoderTools.sha256(item));
}
```

### Error Handling

```typescript
import {BaseEncodingError} from '@osmium/coder';

try {
	const result = CoderTools.base64Decode('invalid-base64!');
} catch (error) {
	if (error instanceof BaseEncodingError) {
		console.log(`Encoding error: ${error.operation} in ${error.encoding}`);
		console.log(`Message: ${error.message}`);
	}
}
```

## 📊 Performance Considerations

### Encoding Performance

- **Base16/Base32**: Fastest for small data
- **Base64**: Best balance of speed and density
- **Base58**: Slower but human-friendly
- **Base85+**: Higher density but more CPU intensive

### Memory Usage

- Use `asBuffer: true` parameter to avoid string conversions
- Reuse buffers when processing multiple items
- Consider streaming for large datasets

### Checksum Performance

- **CRC32**: Fastest, good for integrity checking
- **MD5**: Fast but cryptographically broken
- **SHA-256**: Good balance of security and speed
- **SHA-512**: Most secure but slower

## 🔧 Configuration

### Global Settings

```typescript
// Configure default behavior (if supported)
CoderTools.setDefaultEncoding('utf8');
CoderTools.setDefaultEndianness('little');
```

### Environment-Specific Optimizations

```typescript
// Node.js optimizations
if (typeof process !== 'undefined') {
	// Use Node.js crypto module for better performance
	CoderTools.useNodeCrypto(true);
}

// Browser optimizations
if (typeof window !== 'undefined') {
	// Use Web Crypto API when available
	CoderTools.useWebCrypto(true);
}
```

## 🧪 Testing

```typescript
// Test encoding round-trip
function testEncoding(data: string, encoder: Function, decoder: Function) {
	const encoded = encoder(data);
	const decoded = decoder(encoded);
	console.assert(decoded === data, 'Round-trip failed');
}

// Test all base encodings
const testData = 'Hello, World! 🌍';
testEncoding(testData, CoderTools.base64Encode, CoderTools.base64Decode);
testEncoding(testData, CoderTools.base58Encode, CoderTools.base58Decode);
testEncoding(testData, CoderTools.base32Encode, CoderTools.base32Decode);
```

## 📚 Examples

See the [examples directory](../examples/CoderTools/) for more comprehensive examples and use cases.

## 🔗 Related

- [DataCoder Documentation](./DataCoder.md) - Binary serialization
- [Serializer Documentation](./Serializer.md) - Schema-based serialization
- [Main Documentation](../README.md) - Overview and quick start