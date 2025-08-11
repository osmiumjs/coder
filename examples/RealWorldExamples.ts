/**
 * Real-World Examples for @osmium/coder
 *
 * This file demonstrates practical, production-ready usage patterns:
 * - API response caching and serialization
 * - Database record storage optimization
 * - WebSocket message handling
 * - File-based data persistence
 * - Microservice communication
 * - Session management and authentication
 */

import {CoderTools, DataCoder, Serializer} from '../src';

(async () => {

	console.log('🚀 @osmium/coder - Real-World Examples\n');

// =============================================================================
// 1. API Response Caching System
// =============================================================================

	console.log('🌐 API Response Caching System:');

	interface APIResponse<T = any> {
		[key: string]: any;

		success: boolean;
		data: T;
		timestamp: Date;
		metadata: {
			requestId: string;
			userId?: string;
			cacheKey: string;
			ttl: number; // Time to live in seconds
		};
	}

	class APICacheManager {
		private serializer: Serializer;
		private cache: Map<string, Buffer> = new Map();

		constructor() {
			this.serializer = new Serializer();
			// Register schema for API responses
			this.serializer.registerSchema(1, ['success', 'data', 'timestamp', 'metadata']);
		}

		// Cache an API response
		cacheResponse<T>(key: string, response: APIResponse<T>): void {
			try {
				const packet = this.serializer.serialize(response, 1);
				this.cache.set(key, packet);
				console.log(`✅ Cached response for key: ${key} (${packet.length} bytes)`);
			} catch (error) {
				console.error(`❌ Failed to cache response: ${(error as Error).message}`);
			}
		}

		// Retrieve cached response
		getCachedResponse<T>(key: string): APIResponse<T> | null {
			try {
				const packet = this.cache.get(key);
				if (!packet) return null;

				const response = this.serializer.deserialize<APIResponse<T>>(packet);

				// Check TTL
				const now = new Date();
				const age = (now.getTime() - response.timestamp.getTime()) / 1000;
				if (age > response.metadata.ttl) {
					this.cache.delete(key);
					return null;
				}

				console.log(`✅ Retrieved cached response for key: ${key}`);
				return response;
			} catch (error) {
				console.error(`❌ Failed to retrieve cached response: ${(error as Error).message}`);
				return null;
			}
		}

		// Get cache statistics
		getCacheStats(): { size: number; totalBytes: number; keys: string[] } {
			let totalBytes = 0;
			const keys: string[] = [];

			for (const [key, packet] of this.cache) {
				totalBytes += packet.length;
				keys.push(key);
			}

			return {size: this.cache.size, totalBytes, keys};
		}
	}

	// Demonstrate API caching
	const cacheManager = new APICacheManager();

	// Simulate API responses
	const userResponse: APIResponse<{ id: number; name: string; email: string }> = {
		success  : true,
		data     : {id: 1, name: 'John Doe', email: 'john@example.com'},
		timestamp: new Date(),
		metadata : {
			requestId: CoderTools.randomHex(8),
			userId   : 'user-123',
			cacheKey : 'user:1',
			ttl      : 300 // 5 minutes
		}
	};

	const productsResponse: APIResponse<Array<{ id: string; name: string; price: number }>> = {
		success  : true,
		data     : [
			{id: 'prod-1', name: 'Laptop', price: 999.99},
			{id: 'prod-2', name: 'Mouse', price: 29.99},
			{id: 'prod-3', name: 'Keyboard', price: 79.99}
		],
		timestamp: new Date(),
		metadata : {
			requestId: CoderTools.randomHex(8),
			cacheKey : 'products:electronics',
			ttl      : 600 // 10 minutes
		}
	};

	// Cache responses
	cacheManager.cacheResponse('user:1', userResponse);
	cacheManager.cacheResponse('products:electronics', productsResponse);

	// Retrieve cached responses
	const cachedUser = cacheManager.getCachedResponse('user:1');
	const cachedProducts = cacheManager.getCachedResponse('products:electronics');

	console.log(`User cache hit: ${cachedUser !== null}`);
	console.log(`Products cache hit: ${cachedProducts !== null}`);

	const stats = cacheManager.getCacheStats();
	console.log(`Cache stats: ${stats.size} items, ${stats.totalBytes} bytes total\n`);

	// =============================================================================
	// 2. Database Record Storage Optimization
	// =============================================================================

	console.log('🗄️ Database Record Storage Optimization:');

	interface DatabaseRecord {
		[key: string]: any;

		id: string;
		type: 'user' | 'product' | 'order' | 'session';
		data: any;
		created: Date;
		modified: Date;
		version: number;
		metadata: Map<string, any>;
	}

	class DatabaseStorageManager {
		private coder: DataCoder;
		private serializer: Serializer;
		private storage: Map<string, Buffer> = new Map();

		constructor() {
			this.coder = new DataCoder();
			this.serializer = new Serializer(this.coder, {
				useCompress: null, useCRC32: true // Enable integrity checking for database storage
			});

			// Register schemas for different record types
			this.serializer.registerSchema(10, ['id', 'type', 'data', 'created', 'modified', 'version', 'metadata']);
		}

		// Store a record with automatic compression for large data
		async storeRecord(record: DatabaseRecord): Promise<boolean> {
			try {
				// Use schema-based serialization for efficiency
				const packet = this.serializer.serialize(record, 10);

				// Generate storage key with checksum for integrity
				const keyHash = CoderTools.crc32(record.id).toString(16);
				const storageKey = `${record.type}:${record.id}:${keyHash}`;

				this.storage.set(storageKey, packet);

				console.log(`✅ Stored ${record.type} record: ${record.id} (${packet.length} bytes)`);
				return true;
			} catch (error) {
				console.error(`❌ Failed to store record: ${(error as Error).message}`);
				return false;
			}
		}

		// Retrieve a record with integrity verification
		async retrieveRecord(type: string, id: string): Promise<DatabaseRecord | null> {
			try {
				// Generate expected storage key
				const keyHash = CoderTools.crc32(id).toString(16);
				const storageKey = `${type}:${id}:${keyHash}`;

				const packet = this.storage.get(storageKey);
				if (!packet) return null;

				// Deserialize with automatic integrity checking
				const record = this.serializer.deserialize<DatabaseRecord>(packet);

				console.log(`✅ Retrieved ${type} record: ${id}`);
				return record;
			} catch (error) {
				console.error(`❌ Failed to retrieve record: ${(error as Error).message}`);
				return null;
			}
		}

		// Batch operations for better performance
		async storeBatch(records: DatabaseRecord[]): Promise<number> {
			let successCount = 0;

			for (const record of records) {
				if (await this.storeRecord(record)) {
					successCount++;
				}
			}

			console.log(`✅ Batch stored ${successCount}/${records.length} records`);
			return successCount;
		}

		// Get storage statistics
		getStorageStats(): { records: number; totalSize: number; byType: Record<string, number> } {
			let totalSize = 0;
			const byType: Record<string, number> = {};

			for (const [key, packet] of this.storage) {
				totalSize += packet.length;
				const type = key.split(':')[0];
				byType[type] = (byType[type] || 0) + 1;
			}

			return {records: this.storage.size, totalSize, byType};
		}
	}

	// Demonstrate database storage
	const dbManager = new DatabaseStorageManager();

	// Create sample records
	const sampleRecords: DatabaseRecord[] = [
		{
			id      : 'user-001',
			type    : 'user',
			data    : {name: 'Alice Johnson', email: 'alice@example.com', role: 'admin'},
			created : new Date('2023-01-01'),
			modified: new Date(),
			version : 2,
			metadata: new Map([['lastLogin', new Date()], ['preferences', {theme: 'dark'}]] as [string, any][])
		},
		{
			id      : 'prod-001',
			type    : 'product',
			data    : {name: 'Gaming Laptop', price: 1299.99, category: 'electronics', inStock: true},
			created : new Date('2023-02-15'),
			modified: new Date(),
			version : 1,
			metadata: new Map([['supplier', 'TechCorp'], ['warranty', '2 years']])
		},
		{
			id      : 'order-001',
			type    : 'order',
			data    : {
				userId: 'user-001',
				items : [{productId: 'prod-001', quantity: 1, price: 1299.99}],
				total : 1299.99,
				status: 'completed'
			},
			created : new Date('2023-03-01'),
			modified: new Date(),
			version : 3,
			metadata: new Map([['paymentMethod', 'credit_card'], ['shippingAddress', '123 Main St']])
		}
	];

	// Store records\nasync function runDatabaseExample() {
	await dbManager.storeBatch(sampleRecords);

	// Retrieve records
	const retrievedUser = await dbManager.retrieveRecord('user', 'user-001');
	const retrievedProduct = await dbManager.retrieveRecord('product', 'prod-001');

	console.log(`Retrieved user: ${retrievedUser?.data.name}`);
	console.log(`Retrieved product: ${retrievedProduct?.data.name}`);

	const dbStats = dbManager.getStorageStats();
	console.log(`Database stats:`, dbStats);
	console.log('');

	// =============================================================================
	// 3. WebSocket Message Handling
	// =============================================================================

	console.log('🔌 WebSocket Message Handling:');

	interface WebSocketMessage {
		[key: string]: any;

		type: 'auth' | 'data' | 'ping' | 'pong' | 'error';
		id: string;
		timestamp: Date;
		payload: any;
		metadata?: {
			userId?: string;
			sessionId?: string;
			compressed?: boolean;
		};
	}

	class WebSocketMessageHandler {
		private serializer: Serializer;
		private messageQueue: Buffer[] = [];

		constructor() {
			this.serializer = new Serializer(undefined, {
				useCompress: null, useCRC32: true // Ensure message integrity
			});

			// Register schemas for different message types
			this.serializer.registerSchema(20, ['type', 'id', 'timestamp', 'payload', 'metadata']);
		}

		// Serialize message for transmission
		serializeMessage(message: WebSocketMessage): Buffer {
			try {
				return this.serializer.serialize(message, 20);
			} catch (error) {
				console.error(`❌ Failed to serialize message: ${(error as Error).message}`);
				throw error;
			}
		}

		// Deserialize received message
		deserializeMessage(buffer: Buffer): WebSocketMessage | null {
			try {
				return this.serializer.deserialize<WebSocketMessage>(buffer);
			} catch (error) {
				console.error(`❌ Failed to deserialize message: ${(error as Error).message}`);
				return null;
			}
		}

		// Handle incoming message
		handleIncomingMessage(buffer: Buffer): void {
			const message = this.deserializeMessage(buffer);
			if (!message) return;

			console.log(`📨 Received ${message.type} message: ${message.id}`);

			switch (message.type) {
				case 'auth':
					this.handleAuthMessage(message);
					break;
				case 'data':
					this.handleDataMessage(message);
					break;
				case 'ping':
					this.handlePingMessage(message);
					break;
				default:
					console.log(`⚠️ Unknown message type: ${message.type}`);
			}
		}

		private handleAuthMessage(message: WebSocketMessage): void {
			console.log(`🔐 Authentication request from user: ${message.payload.username}`);

			// Send auth response
			const response: WebSocketMessage = {
				type     : 'auth',
				id       : CoderTools.randomHex(8),
				timestamp: new Date(),
				payload  : {success: true, token: CoderTools.randomBase64(32)},
				metadata : {userId: message.payload.username, sessionId: CoderTools.randomHex(16)}
			};

			const responseBuffer = this.serializeMessage(response);
			console.log(`📤 Sending auth response (${responseBuffer.length} bytes)`);
		}

		private handleDataMessage(message: WebSocketMessage): void {
			console.log(`📊 Data message received: ${JSON.stringify(message.payload).substring(0, 100)}...`);

			// Process data and send acknowledgment
			const ack: WebSocketMessage = {
				type     : 'data',
				id       : CoderTools.randomHex(8),
				timestamp: new Date(),
				payload  : {ack: true, originalId: message.id},
				metadata : message.metadata
			};

			const ackBuffer = this.serializeMessage(ack);
			console.log(`📤 Sending data acknowledgment (${ackBuffer.length} bytes)`);
		}

		private handlePingMessage(message: WebSocketMessage): void {
			console.log(`🏓 Ping received, sending pong`);

			const pong: WebSocketMessage = {
				type     : 'pong',
				id       : CoderTools.randomHex(8),
				timestamp: new Date(),
				payload  : {originalId: message.id},
				metadata : message.metadata
			};

			const pongBuffer = this.serializeMessage(pong);
			console.log(`📤 Sending pong (${pongBuffer.length} bytes)`);
		}

		// Queue messages for batch processing
		queueMessage(message: WebSocketMessage): void {
			const buffer = this.serializeMessage(message);
			this.messageQueue.push(buffer);
			console.log(`📥 Queued message: ${message.type} (queue size: ${this.messageQueue.length})`);
		}

		// Process queued messages in batch
		processMessageQueue(): void {
			console.log(`🔄 Processing ${this.messageQueue.length} queued messages`);

			for (const buffer of this.messageQueue) {
				this.handleIncomingMessage(buffer);
			}

			this.messageQueue.length = 0; // Clear queue
			console.log(`✅ Message queue processed`);
		}
	}

	// Demonstrate WebSocket message handling
	const wsHandler = new WebSocketMessageHandler();

	// Simulate various message types
	const authMessage: WebSocketMessage = {
		type     : 'auth',
		id       : 'auth-001',
		timestamp: new Date(),
		payload  : {username: 'alice', password: 'hashed_password'},
		metadata : {}
	};

	const dataMessage: WebSocketMessage = {
		type     : 'data',
		id       : 'data-001',
		timestamp: new Date(),
		payload  : {
			action: 'update_profile',
			data  : {name: 'Alice Johnson', preferences: {theme: 'dark', notifications: true}}
		},
		metadata : {userId: 'alice', sessionId: 'session-123'}
	};

	const pingMessage: WebSocketMessage = {
		type     : 'ping',
		id       : 'ping-001',
		timestamp: new Date(),
		payload  : {},
		metadata : {}
	};

	// Process messages
	const authBuffer = wsHandler.serializeMessage(authMessage);
	const dataBuffer = wsHandler.serializeMessage(dataMessage);
	const pingBuffer = wsHandler.serializeMessage(pingMessage);

	wsHandler.handleIncomingMessage(authBuffer);
	wsHandler.handleIncomingMessage(dataBuffer);
	wsHandler.handleIncomingMessage(pingBuffer);

	// Demonstrate message queuing
	wsHandler.queueMessage(authMessage);
	wsHandler.queueMessage(dataMessage);
	wsHandler.processMessageQueue();

	console.log('');

	// =============================================================================
	// 4. Session Management and Authentication
	// =============================================================================

	console.log('🔐 Session Management and Authentication:');

	interface UserSession {
		sessionId: string;
		userId: string;
		createdAt: Date;
		lastActivity: Date;
		expiresAt: Date;
		data: {
			userAgent: string;
			ipAddress: string;
			permissions: string[];
			preferences: Record<string, any>;
		};
		metadata: Map<string, any>;
	}

	class SessionManager {
		private coder: DataCoder;
		private sessions: Map<string, Buffer> = new Map();
		private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

		constructor() {
			this.coder = new DataCoder();
		}

		// Create a new session
		createSession(userId: string, userAgent: string, ipAddress: string): string {
			const sessionId = this.generateSecureSessionId();
			const now = new Date();

			const session: UserSession = {
				sessionId,
				userId,
				createdAt   : now,
				lastActivity: now,
				expiresAt   : new Date(now.getTime() + this.SESSION_DURATION),
				data        : {
					userAgent,
					ipAddress,
					permissions: ['read', 'write'], // Default permissions
					preferences: {}
				},
				metadata    : new Map([
					['loginMethod', 'password'],
					['deviceFingerprint', CoderTools.crc32(userAgent + ipAddress).toString(16)]
				])
			};

			const sessionBuffer = this.coder.encode(session);
			this.sessions.set(sessionId, sessionBuffer);

			console.log(`✅ Created session for user ${userId}: ${sessionId}`);
			return sessionId;
		}

		// Validate and retrieve session
		getSession(sessionId: string): UserSession | null {
			try {
				const sessionBuffer = this.sessions.get(sessionId);
				if (!sessionBuffer) return null;

				const session = this.coder.decode<UserSession>(sessionBuffer);

				// Check if session is expired
				if (new Date() > session.expiresAt) {
					this.sessions.delete(sessionId);
					console.log(`⏰ Session expired: ${sessionId}`);
					return null;
				}

				// Update last activity
				session.lastActivity = new Date();
				const updatedBuffer = this.coder.encode(session);
				this.sessions.set(sessionId, updatedBuffer);

				console.log(`✅ Retrieved valid session: ${sessionId}`);
				return session;
			} catch (error) {
				console.error(`❌ Failed to retrieve session: ${(error as Error).message}`);
				return null;
			}
		}

		// Update session data
		updateSession(sessionId: string, updates: Partial<UserSession['data']>): boolean {
			try {
				const session = this.getSession(sessionId);
				if (!session) return false;

				// Apply updates
				Object.assign(session.data, updates);
				session.lastActivity = new Date();

				const updatedBuffer = this.coder.encode(session);
				this.sessions.set(sessionId, updatedBuffer);

				console.log(`✅ Updated session: ${sessionId}`);
				return true;
			} catch (error) {
				console.error(`❌ Failed to update session: ${(error as Error).message}`);
				return false;
			}
		}

		// Revoke session
		revokeSession(sessionId: string): boolean {
			const existed = this.sessions.delete(sessionId);
			if (existed) {
				console.log(`✅ Revoked session: ${sessionId}`);
			} else {
				console.log(`⚠️ Session not found: ${sessionId}`);
			}
			return existed;
		}

		// Clean up expired sessions
		cleanupExpiredSessions(): number {
			const now = new Date();
			let cleanedCount = 0;

			for (const [sessionId, sessionBuffer] of this.sessions) {
				try {
					const session = this.coder.decode<UserSession>(sessionBuffer);
					if (now > session.expiresAt) {
						this.sessions.delete(sessionId);
						cleanedCount++;
					}
				} catch (error) {
					// Remove corrupted sessions
					this.sessions.delete(sessionId);
					cleanedCount++;
				}
			}

			console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
			return cleanedCount;
		}

		// Generate secure session ID
		private generateSecureSessionId(): string {
			const timestamp = Date.now().toString(36);
			const randomPart = CoderTools.randomHex(16);
			const checksum = CoderTools.crc32(timestamp + randomPart).toString(16);
			return `${timestamp}-${randomPart}-${checksum}`;
		}

		// Get session statistics
		getSessionStats(): { total: number; totalSize: number; byUser: Record<string, number> } {
			let totalSize = 0;
			const byUser: Record<string, number> = {};

			for (const sessionBuffer of this.sessions.values()) {
				totalSize += sessionBuffer.length;
				try {
					const session = this.coder.decode<UserSession>(sessionBuffer);
					byUser[session.userId] = (byUser[session.userId] || 0) + 1;
				} catch (error) {
					// Skip corrupted sessions
				}
			}

			return {total: this.sessions.size, totalSize, byUser};
		}
	}

	// Demonstrate session management
	const sessionManager = new SessionManager();

	// Create sessions for different users
	const aliceSession = sessionManager.createSession('alice', 'Mozilla/5.0 Chrome/91.0', '192.168.1.100');
	const bobSession = sessionManager.createSession('bob', 'Mozilla/5.0 Firefox/89.0', '192.168.1.101');
	const charlieSession = sessionManager.createSession('charlie', 'Mozilla/5.0 Safari/14.1', '192.168.1.102');

	// Retrieve and validate sessions
	const retrievedAlice = sessionManager.getSession(aliceSession);
	const retrievedBob = sessionManager.getSession(bobSession);

	console.log(`Alice session valid: ${retrievedAlice !== null}`);
	console.log(`Bob session valid: ${retrievedBob !== null}`);

	// Update session data
	sessionManager.updateSession(aliceSession, {
		permissions: ['read', 'write', 'admin'],
		preferences: {theme: 'dark', language: 'en'}
	});

	// Get session statistics
	const sessionStats = sessionManager.getSessionStats();
	console.log(`Session stats:`, sessionStats);

	// Cleanup (simulate expired sessions)
	sessionManager.cleanupExpiredSessions();

	// Revoke a session
	sessionManager.revokeSession(charlieSession);

	console.log('\n✅ All real-world examples completed successfully!');
	console.log('🎯 These patterns demonstrate production-ready integration of @osmium/coder.');
	console.log('💡 Adapt these examples to your specific use cases and requirements.');

})();