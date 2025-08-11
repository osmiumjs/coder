/**
 * Advanced Serialization Examples for @osmium/coder
 *
 * This file demonstrates advanced usage patterns including:
 * - Custom type registration and serialization
 * - Complex data structures and nested objects
 * - Schema optimization techniques
 * - Compression and integrity checking
 * - Performance optimization strategies
 */

import {DataCoder, Serializer} from '../src';

console.log('🚀 @osmium/coder - Advanced Serialization Examples\n');

// =============================================================================
// 1. Custom Type Registration
// =============================================================================

console.log('🔧 Custom Type Registration:');

// Define custom classes
class User {
	constructor(
		public id: number,
		public name: string,
		public email: string,
		public createdAt: Date = new Date()
	) {}

	getDisplayName(): string {
		return `${this.name} (${this.email})`;
	}

	toJSON() {
		return {
			id       : this.id,
			name     : this.name,
			email    : this.email,
			createdAt: this.createdAt.toISOString()
		};
	}

	static fromJSON(data: any): User {
		return new User(
			data.id,
			data.name,
			data.email,
			new Date(data.createdAt)
		);
	}
}

class Product {
	constructor(
		public id: string,
		public name: string,
		public price: number,
		public categories: Set<string>    = new Set(),
		public metadata: Map<string, any> = new Map()
	) {}

	addCategory(category: string): void {
		this.categories.add(category);
	}

	setMetadata(key: string, value: any): void {
		this.metadata.set(key, value);
	}
}

// Create custom DataCoder with registered types
const customCoder = new DataCoder();

// Register User class
customCoder.use(
	10, // Type ID
	User,
	(user: User) => user.toJSON(), // Encoder
	(data: any) => User.fromJSON(data) // Decoder
);

// Register Product class
customCoder.use(
	11,
	Product,
	(product: Product) => ({
		id        : product.id,
		name      : product.name,
		price     : product.price,
		categories: Array.from(product.categories),
		metadata  : Array.from(product.metadata.entries())
	}),
	(data: any) => {
		const product = new Product(data.id, data.name, data.price);
		data.categories.forEach((cat: string) => product.addCategory(cat));
		data.metadata.forEach(([key, value]: [string, any]) => product.setMetadata(key, value));
		return product;
	}
);

// Test custom type serialization
const user = new User(1, 'John Doe', 'john@example.com');
const product = new Product('prod-123', 'Laptop', 999.99);
product.addCategory('electronics');
product.addCategory('computers');
product.setMetadata('brand', 'TechCorp');
product.setMetadata('warranty', '2 years');

const userBuffer = customCoder.encode(user);
const productBuffer = customCoder.encode(product);

const restoredUser = customCoder.decode<User>(userBuffer);
const restoredProduct = customCoder.decode<Product>(productBuffer);

console.log('Custom User serialization:');
console.log(`Original: ${user.getDisplayName()}`);
console.log(`Restored: ${restoredUser.getDisplayName()}`);
console.log(`Instance preserved: ${restoredUser instanceof User}`);
console.log(`Date preserved: ${restoredUser.createdAt instanceof Date}\n`);

console.log('Custom Product serialization:');
console.log(`Original categories: ${Array.from(product.categories).join(', ')}`);
console.log(`Restored categories: ${Array.from(restoredProduct.categories).join(', ')}`);
console.log(`Metadata preserved: ${restoredProduct.metadata.get('brand')}`);
console.log(`Set type preserved: ${restoredProduct.categories instanceof Set}`);
console.log(`Map type preserved: ${restoredProduct.metadata instanceof Map}\n`);

// =============================================================================
// 2. Complex Nested Data Structures
// =============================================================================

console.log('🏗️ Complex Nested Data Structures:');

interface DatabaseRecord {
	id: string;
	type: 'user' | 'product' | 'order';
	data: any;
	relationships: Map<string, Set<string>>;
	metadata: {
		created: Date;
		modified: Date;
		version: number;
		tags: string[];
	};
}

const complexData: DatabaseRecord = {
	id           : 'record-123',
	type         : 'user',
	data         : new User(42, 'Alice Smith', 'alice@example.com'),
	relationships: new Map([
		['friends', new Set(['user-1', 'user-2', 'user-3'])],
		['groups', new Set(['group-admin', 'group-users'])],
		['orders', new Set(['order-100', 'order-101'])]
	]),
	metadata     : {
		created : new Date('2023-01-01'),
		modified: new Date('2023-06-15'),
		version : 3,
		tags    : ['active', 'premium', 'verified']
	}
};

const complexBuffer = customCoder.encode(complexData);
const restoredComplex = customCoder.decode<DatabaseRecord>(complexBuffer);

console.log('Complex nested structure:');
console.log(`Buffer size: ${complexBuffer.length} bytes`);
console.log(`User data preserved: ${restoredComplex.data instanceof User}`);
console.log(`Relationships Map preserved: ${restoredComplex.relationships instanceof Map}`);
console.log(`Friends Set preserved: ${restoredComplex.relationships.get('friends') instanceof Set}`);
console.log(`Dates preserved: ${restoredComplex.metadata.created instanceof Date}`);
console.log(`Friends count: ${restoredComplex.relationships.get('friends')?.size}`);
console.log(`Tags: ${restoredComplex.metadata.tags.join(', ')}\n`);

// =============================================================================
// 3. Schema-Based Optimization
// =============================================================================

console.log('📊 Schema-Based Optimization:');

const optimizedSerializer = new Serializer(customCoder);

// Register schemas for different data types
optimizedSerializer.registerSchema(100, ['id', 'name', 'email', 'createdAt']);
optimizedSerializer.registerSchema(101, ['id', 'name', 'price', 'categories', 'metadata']);
optimizedSerializer.registerSchema(102, ['id', 'type', 'data', 'relationships', 'metadata']);

// Test schema optimization with different data sizes
const testUsers = Array.from({length: 100}, (_, i) => ({
	id       : i + 1,
	name     : `User ${i + 1}`,
	email    : `user${i + 1}@example.com`,
	createdAt: new Date()
}));

// Serialize without schema
const withoutSchemaStart = performance.now();
const withoutSchemaPackets = testUsers.map(user => optimizedSerializer.serialize(user));
const withoutSchemaTime = performance.now() - withoutSchemaStart;
const withoutSchemaSize = withoutSchemaPackets.reduce((sum, packet) => sum + packet.length, 0);

// Serialize with schema
const withSchemaStart = performance.now();
const withSchemaPackets = testUsers.map(user => optimizedSerializer.serialize(user, 100));
const withSchemaTime = performance.now() - withSchemaStart;
const withSchemaSize = withSchemaPackets.reduce((sum, packet) => sum + packet.length, 0);

console.log('Schema optimization results (100 users):');
console.log(`Without schema: ${withoutSchemaSize} bytes, ${withoutSchemaTime.toFixed(2)}ms`);
console.log(`With schema: ${withSchemaSize} bytes, ${withSchemaTime.toFixed(2)}ms`);
console.log(`Size reduction: ${((withoutSchemaSize - withSchemaSize) / withoutSchemaSize * 100).toFixed(1)}%`);
console.log(`Time improvement: ${((withoutSchemaTime - withSchemaTime) / withoutSchemaTime * 100).toFixed(1)}%\n`);

// =============================================================================
// 4. Compression and Integrity Checking
// =============================================================================

console.log('🗜️ Compression and Integrity Checking:');

// Mock compression functions (in real usage, use zlib or similar)
const mockCompressor = {
	compress  : (data: Buffer): Buffer => {
		// Simple mock compression - just add a header
		const header = Buffer.from('COMPRESSED');
		return Buffer.concat([header, data]);
	},
	decompress: (data: Buffer): Buffer => {
		// Simple mock decompression - remove header
		return data.subarray(10); // Remove 'COMPRESSED' header
	}
};

const compressedSerializer = new Serializer(customCoder, {
	useCompress: mockCompressor,
	useCRC32   : true
});

// Set compression threshold
compressedSerializer.setCompressionThreshold(100); // Compress data larger than 100 bytes

// Test with small data (no compression)
const smallData = {message: 'Hello'};
const smallPacket = compressedSerializer.serialize(smallData);
const smallInfo = compressedSerializer.getPacketInfo(smallPacket);

console.log('Small data packet:');
console.log(`Size: ${smallPacket.length} bytes`);
console.log(`Compressed: ${smallInfo.useCompress}`);
console.log(`CRC32 enabled: ${smallInfo.useCRC32}\n`);

// Test with large data (with compression)
const largeData = {
	content : 'x'.repeat(500),
	metadata: Array.from({length: 50}, (_, i) => ({id: i, value: `item-${i}`}))
};
const largePacket = compressedSerializer.serialize(largeData);
const largeInfo = compressedSerializer.getPacketInfo(largePacket);

console.log('Large data packet:');
console.log(`Size: ${largePacket.length} bytes`);
console.log(`Compressed: ${largeInfo.useCompress}`);
console.log(`CRC32 enabled: ${largeInfo.useCRC32}`);
console.log(`Data size: ${largeInfo.dataSize} bytes\n`);

// Test integrity checking
const restoredSmall = compressedSerializer.deserialize(smallPacket);
const restoredLarge = compressedSerializer.deserialize(largePacket);

console.log('Integrity verification:');
console.log(`Small data restored: ${JSON.stringify(smallData) === JSON.stringify(restoredSmall)}`);
console.log(`Large data restored: ${JSON.stringify(largeData) === JSON.stringify(restoredLarge)}\n`);

// =============================================================================
// 5. Performance Optimization Strategies
// =============================================================================

console.log('⚡ Performance Optimization Strategies:');

// Strategy 1: Batch processing with schemas
function batchSerialize<T extends Record<string | number | symbol, unknown>>(items: T[], schemaId: number, serializer: Serializer): Buffer[] {
	return items.map(item => serializer.serialize(item, schemaId));
}

function batchDeserialize<T>(packets: Buffer[], serializer: Serializer): T[] {
	return packets.map(packet => serializer.deserialize<T>(packet));
}

// Strategy 2: Reuse serializer instances
const reusableSerializer = new Serializer(customCoder);
reusableSerializer.registerSchema(200, ['id', 'value', 'timestamp']);

// Strategy 3: Pre-allocate and reuse data structures
const testData = Array.from({length: 1000}, (_, i) => ({
	id       : i,
	value    : Math.random(),
	timestamp: new Date()
}));

// Benchmark different approaches
console.log('Performance benchmarks (1000 items):');

// Approach 1: Individual serialization without schema
const individual1Start = performance.now();
const individual1Results = testData.map(item => reusableSerializer.serialize(item));
const individual1Time = performance.now() - individual1Start;

// Approach 2: Batch serialization with schema
const batch2Start = performance.now();
const batch2Results = batchSerialize(testData, 200, reusableSerializer);
const batch2Time = performance.now() - batch2Start;

// Approach 3: Pre-optimized serialization
const preopt3Start = performance.now();
const preopt3Results: Buffer[] = [];
for (const item of testData) {
	preopt3Results.push(reusableSerializer.serialize(item, 200));
}
const preopt3Time = performance.now() - preopt3Start;

console.log(`Individual without schema: ${individual1Time.toFixed(2)}ms`);
console.log(`Batch with schema: ${batch2Time.toFixed(2)}ms`);
console.log(`Pre-optimized loop: ${preopt3Time.toFixed(2)}ms`);

// Calculate size differences
const individual1Size = individual1Results.reduce((sum, buf) => sum + buf.length, 0);
const batch2Size = batch2Results.reduce((sum, buf) => sum + buf.length, 0);
const preopt3Size = preopt3Results.reduce((sum, buf) => sum + buf.length, 0);

console.log(`Individual size: ${individual1Size} bytes`);
console.log(`Batch size: ${batch2Size} bytes`);
console.log(`Pre-optimized size: ${preopt3Size} bytes\n`);

// =============================================================================
// 6. Advanced Error Handling and Recovery
// =============================================================================

console.log('🛡️ Advanced Error Handling and Recovery:');

// Custom error handling for serialization
function safeSerialize<T extends Record<string | number | symbol, unknown>>(data: T, serializer: Serializer, schemaId?: number): Buffer | null {
	try {
		return serializer.serialize(data, schemaId);
	} catch (error) {
		console.log(`Serialization failed: ${(error as Error).message}`);
		return null;
	}
}

function safeDeserialize<T>(buffer: Buffer, serializer: Serializer): T | null {
	try {
		return serializer.deserialize<T>(buffer);
	} catch (error) {
		console.log(`Deserialization failed: ${(error as Error).message}`);
		return null;
	}
}

// Test error recovery
const validData = {id: 1, name: 'Valid', email: 'valid@example.com'};
const invalidData = {id: 1, name: 'Invalid'}; // Missing email for schema

reusableSerializer.registerSchema(300, ['id', 'name', 'email']);

const validPacket = safeSerialize(validData, reusableSerializer, 300);
const invalidPacket = safeSerialize(invalidData, reusableSerializer, 300);

console.log('Error handling results:');
console.log(`Valid data serialized: ${validPacket !== null}`);
console.log(`Invalid data handled: ${invalidPacket === null}`);

if (validPacket) {
	const recovered = safeDeserialize(validPacket, reusableSerializer);
	console.log(`Data recovery successful: ${recovered !== null}\n`);
}

// =============================================================================
// 7. Memory Management and Cleanup
// =============================================================================

console.log('🧹 Memory Management and Cleanup:');

// Demonstrate proper cleanup and memory management
function processLargeDataset(data: any[]): void {
	const tempSerializer = new Serializer();
	tempSerializer.registerSchema(400, Object.keys(data[0]));

	let processedCount = 0;
	const batchSize = 100;

	for (let i = 0; i < data.length; i += batchSize) {
		const batch = data.slice(i, i + batchSize);

		// Process batch
		const packets = batch.map(item => tempSerializer.serialize(item, 400));

		// Simulate processing (in real app, you'd send to database, network, etc.)
		packets.forEach(packet => {
			const restored = tempSerializer.deserialize(packet);
			processedCount++;
		});

		// Clear batch from memory
		packets.length = 0;
	}

	console.log(`Processed ${processedCount} items in batches of ${batchSize}`);
}

// Test with large dataset
const largeDataset = Array.from({length: 1000}, (_, i) => ({
	id      : i,
	name    : `Item ${i}`,
	value   : Math.random() * 1000,
	category: `category-${i % 10}`,
	active  : i % 2 === 0
}));

processLargeDataset(largeDataset);

console.log('\n✅ All advanced serialization examples completed successfully!');
console.log('🎯 These patterns demonstrate production-ready usage of @osmium/coder.');
