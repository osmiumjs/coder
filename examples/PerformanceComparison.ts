/**
 * Performance Comparison Examples for @osmium/coder
 *
 * This file demonstrates performance characteristics and comparisons:
 * - Encoding performance across different base formats
 * - Serialization performance with and without schemas
 * - Memory usage optimization techniques
 * - Compression effectiveness analysis
 * - Throughput benchmarks for different data types
 */

import {CoderTools, DataCoder, Serializer} from '../src';

console.log('🚀 @osmium/coder - Performance Comparison Examples\n');

// =============================================================================
// 1. Base Encoding Performance Comparison
// =============================================================================

console.log('🔤 Base Encoding Performance Comparison:');

const testString = 'The quick brown fox jumps over the lazy dog. '.repeat(100); // ~4.3KB
const iterations = 100;

interface EncodingResult {
	name: string;
	encodeTime: number;
	decodeTime: number;
	encodedSize: number;
	efficiency: number; // bytes per millisecond
}

function benchmarkEncoding(
	name: string,
	encoder: (data: string) => string,
	decoder: (data: string) => string
): EncodingResult {
	// Warm up
	for (let i = 0; i < 10; i++) {
		const encoded = encoder(testString);
		decoder(encoded);
	}

	// Benchmark encoding
	const encodeStart = performance.now();
	let encoded = '';
	for (let i = 0; i < iterations; i++) {
		encoded = encoder(testString);
	}
	const encodeTime = performance.now() - encodeStart;

	// Benchmark decoding
	const decodeStart = performance.now();
	for (let i = 0; i < iterations; i++) {
		decoder(encoded);
	}
	const decodeTime = performance.now() - decodeStart;

	return {
		name,
		encodeTime,
		decodeTime,
		encodedSize: encoded.length,
		efficiency : (testString.length * iterations) / (encodeTime + decodeTime)
	};
}

const encodingResults: EncodingResult[] = [
	benchmarkEncoding('Base16', CoderTools.Base16.encode, CoderTools.Base16.decode),
	benchmarkEncoding('Base32', CoderTools.Base32.encode, CoderTools.Base32.decode),
	benchmarkEncoding('Base58', CoderTools.Base58.encode, CoderTools.Base58.decode),
	benchmarkEncoding('Base62', CoderTools.Base62.encode, CoderTools.Base62.decode),
	benchmarkEncoding('Base64', CoderTools.Base64.encode, CoderTools.Base64.decode),
	benchmarkEncoding('Base66', CoderTools.Base66.encode, CoderTools.Base66.decode),
	benchmarkEncoding('Base93', CoderTools.Base93.encode, CoderTools.Base93.decode)
];

console.log(`Test data: ${testString.length} bytes, ${iterations} iterations\n`);
console.log('Encoding Performance Results:');
console.log('Format    | Encode(ms) | Decode(ms) | Size(bytes) | Efficiency(KB/s)');
console.log('----------|------------|------------|-------------|------------------');

encodingResults
	.sort((a, b) => b.efficiency - a.efficiency)
	.forEach(result => {
		console.log(
			`${result.name.padEnd(9)} | ${result.encodeTime.toFixed(2).padStart(10)} | ${result.decodeTime.toFixed(2).padStart(10)} | ${result.encodedSize.toString()
			                                                                                                                                  .padStart(11)} | ${(result.efficiency / 1024).toFixed(2)
			                                                                                                                                                                               .padStart(16)}`
		);
	});

console.log('\n');

// =============================================================================
// 2. Serialization Performance: Schema vs No Schema
// =============================================================================

console.log('📦 Serialization Performance: Schema vs No Schema:');

interface TestUser {
	[key: string]: any;

	id: number;
	firstName: string;
	lastName: string;
	email: string;
	age: number;
	active: boolean;
	createdAt: Date;
	tags: string[];
}

// Generate test data
const generateUsers = (count: number): TestUser[] => {
	return Array.from({length: count}, (_, i) => ({
		id       : i + 1,
		firstName: `FirstName${i}`,
		lastName : `LastName${i}`,
		email    : `user${i}@example.com`,
		age      : 20 + (i % 50),
		active   : i % 2 === 0,
		createdAt: new Date(2020, 0, 1 + i),
		tags     : [`tag${i % 5}`, `category${i % 3}`]
	}));
};

const testUsers = generateUsers(1000);
const serializer = new Serializer();
serializer.registerSchema(1, ['id', 'firstName', 'lastName', 'email', 'age', 'active', 'createdAt', 'tags']);

// Benchmark serialization without schema
console.log('Benchmarking serialization without schema...');
const noSchemaStart = performance.now();
const noSchemaPackets = testUsers.map(user => serializer.serialize(user));
const noSchemaSerializeTime = performance.now() - noSchemaStart;

const noSchemaDeserializeStart = performance.now();
const noSchemaRestored = noSchemaPackets.map(packet => serializer.deserialize<TestUser>(packet));
const noSchemaDeserializeTime = performance.now() - noSchemaDeserializeStart;

const noSchemaSize = noSchemaPackets.reduce((sum, packet) => sum + packet.length, 0);

// Benchmark serialization with schema
console.log('Benchmarking serialization with schema...');
const schemaStart = performance.now();
const schemaPackets = testUsers.map(user => serializer.serialize(user, 1));
const schemaSerializeTime = performance.now() - schemaStart;

const schemaDeserializeStart = performance.now();
const schemaRestored = schemaPackets.map(packet => serializer.deserialize<TestUser>(packet));
const schemaDeserializeTime = performance.now() - schemaDeserializeStart;

const schemaSize = schemaPackets.reduce((sum, packet) => sum + packet.length, 0);

console.log(`\nSerialization Performance Results (${testUsers.length} users):`);
console.log('Method        | Serialize(ms) | Deserialize(ms) | Total(ms) | Size(bytes) | Size/Item');
console.log('--------------|---------------|-----------------|-----------|-------------|----------');
console.log(`No Schema     | ${noSchemaSerializeTime.toFixed(2).padStart(13)} | ${noSchemaDeserializeTime.toFixed(2)
                                                                                                         .padStart(15)} | ${(noSchemaSerializeTime + noSchemaDeserializeTime).toFixed(2)
                                                                                                                                                                             .padStart(9)} | ${noSchemaSize.toString()
                                                                                                                                                                                                           .padStart(11)} | ${(noSchemaSize / testUsers.length).toFixed(1)
                                                                                                                                                                                                                                                               .padStart(8)}`);
console.log(`With Schema   | ${schemaSerializeTime.toFixed(2).padStart(13)} | ${schemaDeserializeTime.toFixed(2)
                                                                                                     .padStart(15)} | ${(schemaSerializeTime + schemaDeserializeTime).toFixed(2)
                                                                                                                                                                     .padStart(9)} | ${schemaSize.toString()
                                                                                                                                                                                                 .padStart(11)} | ${(schemaSize / testUsers.length).toFixed(1)
                                                                                                                                                                                                                                                   .padStart(8)}`);

const sizeReduction = ((noSchemaSize - schemaSize) / noSchemaSize * 100);
const timeImprovement = ((noSchemaSerializeTime + noSchemaDeserializeTime) - (schemaSerializeTime + schemaDeserializeTime)) / (noSchemaSerializeTime + noSchemaDeserializeTime) * 100;

console.log(`\nSchema Benefits:`);
console.log(`Size reduction: ${sizeReduction.toFixed(1)}%`);
console.log(`Time improvement: ${timeImprovement.toFixed(1)}%\n`);

// =============================================================================
// 3. Memory Usage Analysis
// =============================================================================

console.log('🧠 Memory Usage Analysis:');

// Simulate memory usage tracking (in real Node.js, you'd use process.memoryUsage())
function simulateMemoryUsage(): { used: number; total: number } {
	return {
		used : Math.floor(Math.random() * 100000000), // Simulated memory usage
		total: 134217728 // 128MB simulated total
	};
}

function benchmarkMemoryUsage<T>(
	name: string,
	operation: () => T[],
	dataSize: number
): void {
	const beforeMemory = simulateMemoryUsage();

	const start = performance.now();
	const results = operation();
	const end = performance.now();

	const afterMemory = simulateMemoryUsage();
	const memoryDelta = Math.abs(afterMemory.used - beforeMemory.used);

	console.log(`${name}:`);
	console.log(`  Time: ${(end - start).toFixed(2)}ms`);
	console.log(`  Items processed: ${results.length}`);
	console.log(`  Memory delta: ~${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
	console.log(`  Throughput: ${(results.length / (end - start) * 1000).toFixed(0)} items/sec\n`);
}

const largeDataset = generateUsers(5000);

// Test different processing strategies
benchmarkMemoryUsage(
	'Batch Processing (1000 items)',
	() => {
		const results: Buffer[] = [];
		for (let i = 0; i < largeDataset.length; i += 1000) {
			const batch = largeDataset.slice(i, i + 1000);
			const batchResults = batch.map(user => serializer.serialize(user, 1));
			results.push(...batchResults);
		}
		return results;
	},
	largeDataset.length
);

benchmarkMemoryUsage(
	'Stream Processing (one by one)',
	() => {
		const results: Buffer[] = [];
		for (const user of largeDataset) {
			results.push(serializer.serialize(user, 1));
		}
		return results;
	},
	largeDataset.length
);

benchmarkMemoryUsage(
	'Bulk Processing (all at once)',
	() => largeDataset.map(user => serializer.serialize(user, 1)),
	largeDataset.length
);

// =============================================================================
// 4. Compression Effectiveness Analysis
// =============================================================================

console.log('🗜️ Compression Effectiveness Analysis:');

// Mock compression for demonstration
const mockCompressor = {
	compress  : (data: Buffer): Buffer => {
		// Simulate compression by reducing size by 30-70% based on data patterns
		const compressionRatio = 0.3 + Math.random() * 0.4;
		const compressedSize = Math.floor(data.length * compressionRatio);
		return Buffer.alloc(compressedSize, 'compressed');
	},
	decompress: (data: Buffer): Buffer => {
		// Simulate decompression
		const originalSize = Math.floor(data.length / 0.5); // Assume 50% compression
		return Buffer.alloc(originalSize, 'decompressed');
	}
};

const compressedSerializer = new Serializer(undefined, {
	useCompress: mockCompressor,
	useCRC32   : true
});

// Test different compression thresholds
const compressionThresholds = [50, 100, 500, 1000, 2000];
const testDataSizes = [
	{name: 'Small (50 bytes)', data: {message: 'x'.repeat(50)}},
	{name: 'Medium (500 bytes)', data: {message: 'x'.repeat(500)}},
	{name: 'Large (2KB)', data: {message: 'x'.repeat(2000)}},
	{name: 'Very Large (10KB)', data: {message: 'x'.repeat(10000)}}
];

console.log('Compression Analysis:');
console.log('Data Size     | Threshold | Compressed | Original | Compressed | Ratio');
console.log('              |   (bytes) |    (Y/N)   |  (bytes) |   (bytes)  |   (%)');
console.log('--------------|-----------|------------|----------|------------|-------');

for (const testData of testDataSizes) {
	for (const threshold of compressionThresholds) {
		compressedSerializer.setCompressionThreshold(threshold);

		const packet = compressedSerializer.serialize(testData.data);
		const info = compressedSerializer.getPacketInfo(packet);

		const originalSize = JSON.stringify(testData.data).length;
		const compressedSize = packet.length;
		const ratio = ((originalSize - compressedSize) / originalSize * 100);

		console.log(
			`${testData.name.padEnd(13)} | ${threshold.toString().padStart(9)} | ${(info.useCompress ? 'Y' : 'N').padStart(10)} | ${originalSize.toString()
			                                                                                                                                    .padStart(8)} | ${compressedSize.toString()
			                                                                                                                                                                    .padStart(10)} | ${ratio.toFixed(1)
			                                                                                                                                                                                            .padStart(5)}`
		);
	}
}

console.log('\n');

// =============================================================================
// 5. Data Type Performance Comparison
// =============================================================================

console.log('🎯 Data Type Performance Comparison:');

const coder = new DataCoder();

interface DataTypeTest {
	name: string;
	data: any;
	iterations: number;
}

const dataTypeTests: DataTypeTest[] = [
	{
		name      : 'Simple Object',
		data      : {id: 1, name: 'test', active: true},
		iterations: 10000
	},
	{
		name      : 'Array of Numbers',
		data      : Array.from({length: 1000}, (_, i) => i),
		iterations: 1000
	},
	{
		name      : 'Map with Strings',
		data      : new Map(Array.from({length: 100}, (_, i) => [`key${i}`, `value${i}`])),
		iterations: 1000
	},
	{
		name      : 'Set of Numbers',
		data      : new Set(Array.from({length: 1000}, (_, i) => i)),
		iterations: 1000
	},
	{
		name      : 'Nested Objects',
		data      : {
			level1: {
				level2: {
					level3: {
						data: Array.from({length: 100}, (_, i) => ({id: i, value: `item${i}`}))
					}
				}
			}
		},
		iterations: 1000
	}
];

console.log('Data Type Performance Results:');
console.log('Type              | Iterations | Encode(ms) | Decode(ms) | Size(bytes) | Rate(ops/s)');
console.log('------------------|------------|------------|------------|-------------|------------');

for (const test of dataTypeTests) {
	// Warm up
	for (let i = 0; i < 10; i++) {
		const encoded = coder.encode(test.data);
		coder.decode(encoded);
	}

	// Benchmark encoding
	const encodeStart = performance.now();
	let lastEncoded: Buffer = Buffer.alloc(0);
	for (let i = 0; i < test.iterations; i++) {
		lastEncoded = coder.encode(test.data);
	}
	const encodeTime = performance.now() - encodeStart;

	// Benchmark decoding
	const decodeStart = performance.now();
	for (let i = 0; i < test.iterations; i++) {
		coder.decode(lastEncoded);
	}
	const decodeTime = performance.now() - decodeStart;

	const totalTime = encodeTime + decodeTime;
	const rate = (test.iterations * 2) / (totalTime / 1000); // ops per second (encode + decode)

	console.log(
		`${test.name.padEnd(17)} | ${test.iterations.toString().padStart(10)} | ${encodeTime.toFixed(2).padStart(10)} | ${decodeTime.toFixed(2)
		                                                                                                                            .padStart(10)} | ${lastEncoded.length.toString()
		                                                                                                                                                          .padStart(11)} | ${rate.toFixed(0)
		                                                                                                                                                                                 .padStart(10)}`
	);
}

console.log('\n');

// =============================================================================
// 6. Throughput Benchmarks
// =============================================================================

console.log('📈 Throughput Benchmarks:');

function measureThroughput(
	name: string,
	operation: () => void,
	iterations: number,
	dataSize: number
): void {
	// Warm up
	for (let i = 0; i < 100; i++) {
		operation();
	}

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		operation();
	}
	const end = performance.now();

	const totalTime = end - start;
	const throughputOps = iterations / (totalTime / 1000);
	const throughputMB = (iterations * dataSize) / (1024 * 1024) / (totalTime / 1000);

	console.log(`${name}:`);
	console.log(`  Operations/sec: ${throughputOps.toFixed(0)}`);
	console.log(`  MB/sec: ${throughputMB.toFixed(2)}`);
	console.log(`  Avg time per op: ${(totalTime / iterations).toFixed(3)}ms\n`);
}

const throughputData = {
	small : {message: 'Hello World', id: 123},
	medium: {data: 'x'.repeat(1000), metadata: {created: new Date(), tags: ['a', 'b', 'c']}},
	large : {content: 'x'.repeat(10000), items: Array.from({length: 100}, (_, i) => ({id: i, value: i * 2}))}
};

// Measure different operation throughputs
measureThroughput(
	'Small Object Encoding',
	() => coder.encode(throughputData.small),
	10000,
	JSON.stringify(throughputData.small).length
);

measureThroughput(
	'Medium Object Encoding',
	() => coder.encode(throughputData.medium),
	5000,
	JSON.stringify(throughputData.medium).length
);

measureThroughput(
	'Large Object Encoding',
	() => coder.encode(throughputData.large),
	1000,
	JSON.stringify(throughputData.large).length
);

// Base64 encoding throughput
const base64TestData = 'The quick brown fox jumps over the lazy dog'.repeat(100);
measureThroughput(
	'Base64 Encoding',
	() => CoderTools.Base64.encode(base64TestData),
	5000,
	base64TestData.length
);

measureThroughput(
	'CRC32 Calculation',
	() => CoderTools.crc32(base64TestData),
	10000,
	base64TestData.length
);

console.log('✅ All performance comparison examples completed successfully!');
console.log('📊 These benchmarks help optimize usage patterns for your specific use case.');
