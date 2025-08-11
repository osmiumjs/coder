/**
 * Basic Usage Examples for @osmium/coder
 *
 * This file demonstrates the fundamental operations of all three main components:
 * - CoderTools: Encoding, hashing, and utility functions
 * - DataCoder: Binary serialization with custom types
 * - Serializer: Schema-based packet serialization
 */

import {CoderTools, dataCoder, serializer} from '../src';

console.log('🚀 @osmium/coder - Basic Usage Examples\n');

// =============================================================================
// 1. CoderTools - Encoding and Utility Functions
// =============================================================================

console.log('🔧 CoderTools Examples:');

// Base64 encoding (most common)
const message = 'Hello, World! 🌍';
const base64Encoded = CoderTools.Base64.encode(message);
const base64Decoded = CoderTools.Base64.decode(base64Encoded);
console.log(`Original: ${message}`);
console.log(`Base64: ${base64Encoded}`);
console.log(`Decoded: ${base64Decoded}`);
console.log(`Round-trip successful: ${message === base64Decoded}\n`);

// Multiple encoding formats
const data = 'Hello, Encoding!';
console.log('Multiple encoding formats:');
console.log(`Base16 (Hex): ${CoderTools.Base16.encode(data)}`);
console.log(`Base32: ${CoderTools.Base32.encode(data)}`);
console.log(`Base58: ${CoderTools.Base58.encode(data)}`);
console.log(`Base62: ${CoderTools.Base62.encode(data)}`);
console.log(`Base64: ${CoderTools.Base64.encode(data)}\n`);

// Checksums and hashing
const textData = 'Important data that needs verification';
console.log('Checksums and hashing:');
console.log(`CRC32: ${CoderTools.crc32(textData).toString(16)}`);
console.log(`XOR Checksum: ${CoderTools.xorChecksum(textData)}`);
console.log(`DJB2 Hash: ${CoderTools.djb2Hash(textData)}`);
console.log(`SDBM Hash: ${CoderTools.sdbmHash(textData)}\n`);

// Random generation
console.log('Random generation:');
console.log(`Random bytes (hex): ${CoderTools.randomHex(16)}`);
console.log(`Random base64: ${CoderTools.randomBase64(12)}`);
console.log(`Random bytes: ${CoderTools.randomBytes(8).toString('hex')}\n`);

// =============================================================================
// 2. DataCoder - Binary Serialization
// =============================================================================

console.log('📦 DataCoder Examples:');

// Simple object serialization
const simpleObject = {
	name    : 'John Doe',
	age     : 30,
	active  : true,
	scores  : [95, 87, 92],
	metadata: null
};

const buffer = dataCoder.encode(simpleObject);
const restored = dataCoder.decode(buffer);

console.log('Simple object serialization:');
console.log(`Original:`, simpleObject);
console.log(`Buffer size: ${buffer.length} bytes`);
console.log(`Restored:`, restored);
console.log(`Objects equal: ${JSON.stringify(simpleObject) === JSON.stringify(restored)}\n`);

// Complex objects with Map and Set
const complexObject = {
	users   : new Map([
		['john', {age: 30, roles: new Set(['admin', 'user'])}],
		['jane', {age: 25, roles: new Set(['user'])}]
	]),
	settings: {
		theme        : 'dark',
		notifications: true,
		lastLogin    : new Date('2023-01-01')
	},
	tags    : new Set(['important', 'urgent', 'priority'])
};

const complexBuffer = dataCoder.encode(complexObject);
const complexRestored: typeof complexObject = dataCoder.decode(complexBuffer);

console.log('Complex object with Map and Set:');
console.log(`Buffer size: ${complexBuffer.length} bytes`);
console.log(`Users Map preserved: ${complexRestored.users instanceof Map}`);
console.log(`Roles Set preserved: ${complexRestored.users.get('john')?.roles instanceof Set}`);
console.log(`Tags Set preserved: ${complexRestored.tags instanceof Set}`);
console.log(`Date preserved: ${complexRestored.settings.lastLogin instanceof Date}\n`);

// Different output formats
const formatData = {message: 'Format test', value: 42};
console.log('Different output formats:');
console.log(`Hex: ${dataCoder.encodeToHex(formatData)}`);
console.log(`Base64: ${dataCoder.encodeToBase64(formatData)}`);

// Decode from different formats
const hexDecoded = dataCoder.decodeFromHex(dataCoder.encodeToHex(formatData));
const base64DecodedData = dataCoder.decodeFromBase64(dataCoder.encodeToBase64(formatData));
console.log(`Hex round-trip: ${JSON.stringify(formatData) === JSON.stringify(hexDecoded)}`);
console.log(`Base64 round-trip: ${JSON.stringify(formatData) === JSON.stringify(base64Decoded)}\n`);

// Object cloning and comparison
const original = {data: new Map([['key', new Set([1, 2, 3])]])};
const cloned = dataCoder.clone(original);
const isEqual = dataCoder.isEqual(original, cloned);

console.log('Object cloning and comparison:');
console.log(`Objects are different instances: ${original !== cloned}`);
console.log(`Objects are structurally equal: ${isEqual}`);
console.log(`Map type preserved in clone: ${cloned.data instanceof Map}`);
console.log(`Set type preserved in clone: ${cloned.data.get('key') instanceof Set}\n`);

// =============================================================================
// 3. Serializer - Schema-based Serialization
// =============================================================================

console.log('🗂️ Serializer Examples:');

// Basic serialization without schema
const userData = {
	id    : 123,
	name  : 'Alice Johnson',
	email : 'alice@example.com',
	active: true
};

const basicPacket = serializer.serialize(userData);
const basicRestored = serializer.deserialize(basicPacket);

console.log('Basic serialization (no schema):');
console.log(`Packet size: ${basicPacket.length} bytes`);
console.log(`Data restored correctly: ${JSON.stringify(userData) === JSON.stringify(basicRestored)}\n`);

// Schema-based serialization
serializer.registerSchema(1, ['id', 'name', 'email', 'active']);
const schemaPacket = serializer.serialize(userData, 1);
const schemaRestored = serializer.deserialize(schemaPacket);

console.log('Schema-based serialization:');
console.log(`Without schema: ${basicPacket.length} bytes`);
console.log(`With schema: ${schemaPacket.length} bytes`);
console.log(`Size reduction: ${((basicPacket.length - schemaPacket.length) / basicPacket.length * 100).toFixed(1)}%`);
console.log(`Data restored correctly: ${JSON.stringify(userData) === JSON.stringify(schemaRestored)}\n`);

// Auto-schema detection
serializer.registerSchema(2, ['title', 'content', 'author']);
const article = {
	title  : 'Introduction to Serialization',
	content: 'This article explains the basics of data serialization...',
	author : 'Tech Writer'
};

const autoPacket = serializer.serialize(article); // No schema ID specified
const autoRestored = serializer.deserialize(autoPacket);

console.log('Auto-schema detection:');
console.log(`Article serialized with auto-detected schema`);
console.log(`Data restored correctly: ${JSON.stringify(article) === JSON.stringify(autoRestored)}\n`);

// Packet analysis
const packetInfo = serializer.getPacketInfo(schemaPacket);
console.log('Packet analysis:');
console.log(`Version: ${packetInfo.version}`);
console.log(`Uses compression: ${packetInfo.useCompress}`);
console.log(`Uses CRC32: ${packetInfo.useCRC32}`);
console.log(`Uses schema: ${packetInfo.useSchema}`);
console.log(`Schema ID: ${packetInfo.schemaId}`);
console.log(`Data size: ${packetInfo.dataSize} bytes\n`);

// Schema management
console.log('Schema management:');
const registeredSchemas = serializer.getRegisteredSchemas();
console.log(`Registered schemas:`, registeredSchemas);

const schemaIds = serializer.getRegisteredSchemaIds();
console.log(`Schema IDs: [${schemaIds.join(', ')}]`);

console.log(`Schema 1 exists: ${serializer.hasSchema(1)}`);
console.log(`Schema 999 exists: ${serializer.hasSchema(999)}\n`);

// =============================================================================
// 4. Error Handling Examples
// =============================================================================

console.log('🛡️ Error Handling Examples:');

// Invalid base64 decoding
try {
	CoderTools.Base64.decode('invalid-base64!');
} catch (error) {
	console.log(`Base64 decode error: ${(error as Error).message}`);
}

// Empty buffer decoding
try {
	dataCoder.decode(Buffer.alloc(0));
} catch (error) {
	console.log(`Empty buffer error: ${(error as Error).message}`);
}

// Schema validation error
try {
	const invalidData = {id: 1, name: 'John'}; // Missing email and active
	serializer.serialize(invalidData, 1);
} catch (error) {
	console.log(`Schema validation error: ${(error as Error).message}`);
}

// Missing schema error
try {
	serializer.serialize(userData, 999); // Schema 999 doesn't exist
} catch (error) {
	console.log(`Missing schema error: ${(error as Error).message}`);
}

console.log('\n✅ All basic examples completed successfully!');
console.log('📚 Check out the other example files for more advanced usage patterns.');
