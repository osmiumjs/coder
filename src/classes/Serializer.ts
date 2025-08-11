import {isArray, isFunction, isObject} from '@osmium/is';
import {iterateSync}                   from '@osmium/iterate';

import {DataCoder}  from './DataCoder';
import {CoderTools} from './CoderTools';

interface SerializerPacketCompressor {
	compress(data: Buffer | Uint8Array): Buffer;

	decompress(data: Buffer): Buffer;
}

interface SerializerPacketOptions {
	useCompress: SerializerPacketCompressor | null;
	useCRC32: boolean;
	useSchema?: boolean;
}

export type SerializerSchema = Array<string>;

export interface SerializerSchemaObject {
	id: number;
	fields: SerializerSchema;
}

export interface SerializerPacketInfo {
	version: number;
	useCompress: boolean;
	useCRC32: boolean;
	useSchema: boolean;
	schemaId?: number;
	dataSize: number;
}

interface SerializerSchemes {
	[id: number]: SerializerSchema;
}

type SerializerSchemaIdOrSchemaObject = SerializerSchemaObject | number | null;

export class Serializer {
	readonly version: number = 3;
	private compressionLengthThreshold = 1024;

	coder: DataCoder;
	private enableCompression: boolean = false;
	private readonly options: SerializerPacketOptions;
	private schemes: SerializerSchemes = {};

	constructor(coder?: DataCoder, options: SerializerPacketOptions = {
		useCompress: null,
		useCRC32   : true
	}) {
		if (options.useCompress && (!isFunction(options.useCompress.compress) || !isFunction(options.useCompress.decompress))) {
			throw new Error('Invalid compressor: must have compress and decompress methods');
		}

		this.coder = coder ?? new DataCoder();
		this.options = {...options};
	}

	private makePacket(config: SerializerPacketOptions, data: Buffer | Uint8Array, schema: number | null = null): Buffer {
		if (schema !== null) {
			config.useSchema = true;
		}

		const useCompress = config.useCompress;

		if (isFunction(useCompress?.compress) && isFunction(useCompress?.decompress)) {
			this.enableCompression = data.length >= this.compressionLengthThreshold;
		}

		const packet: Array<Buffer | Uint8Array> = [
			CoderTools.int8UToBuf(this.version),
			CoderTools.binFlagsToBuf([
				this.enableCompression,
				config.useCRC32,
				!!config.useSchema
			])
		];

		const outData = (this.enableCompression && config.useCompress?.compress)
		                ? config.useCompress?.compress(data)
		                : data;

		if (config.useCRC32) {
			packet.push(CoderTools.int32UToBuf(CoderTools.crc32(outData)));
		}

		if (schema) {
			packet.push(CoderTools.int32UToBuf(schema));
		}

		packet.push(outData);

		return Buffer.concat(packet);
	}

	use(id: number, detector: Function, encode: (arg: any) => any, decode: (arg: any) => any): void {
		this.coder.use(id, detector, encode, decode);
	}

	registerSchema(id: number, fields: SerializerSchema): void {
		if (typeof id !== 'number' || id < 0 || !Number.isInteger(id)) {
			throw new Error('Schema id must be a non-negative integer');
		}

		if (!isArray(fields) || fields.length === 0) {
			throw new Error('Schema fields must be a non-empty array of strings');
		}

		if (!fields.every(field => typeof field === 'string' && field.length > 0)) {
			throw new Error('All schema fields must be non-empty strings');
		}

		if (this.schemes[id]) {
			throw new Error(`Schema with id ${id} already registered`);
		}

		const sortedFields = [...fields].sort((a, b) => a.localeCompare(b));
		this.schemes[id] = sortedFields;
	}

	updateSchema(id: number, fields: SerializerSchema): void {
		if (!this.schemes[id]) {
			throw new Error(`Schema with id ${id} not found`);
		}

		if (!isArray(fields) || fields.length === 0) {
			throw new Error('Schema fields must be a non-empty array of strings');
		}

		if (!fields.every(field => typeof field === 'string' && field.length > 0)) {
			throw new Error('All schema fields must be non-empty strings');
		}

		const sortedFields = [...fields].sort((a, b) => a.localeCompare(b));
		this.schemes[id] = sortedFields;
	}

	unregisterSchema(id: number): void {
		if (!this.schemes[id]) {
			throw new Error(`Schema with id ${id} not found`);
		}
		delete this.schemes[id];
	}

	hasSchema(id: number): boolean {
		return id in this.schemes;
	}

	getSchema(id: number): SerializerSchema | null {
		return this.schemes[id] || null;
	}

	getRegisteredSchemas(): { [id: number]: SerializerSchema } {
		const copy: { [id: number]: SerializerSchema } = {};
		for (const [id, schema] of Object.entries(this.schemes)) {
			copy[parseInt(id)] = [...schema];
		}
		return copy;
	}

	getRegisteredSchemaIds(): number[] {
		return Object.keys(this.schemes).map(id => parseInt(id)).sort((a, b) => a - b);
	}

	getPacketInfo(buf: Buffer | Uint8Array): SerializerPacketInfo {
		const buffer = Buffer.from(buf);

		if (buffer.length < 2) {
			throw new Error('Invalid packet: too short');
		}

		const version = CoderTools.bufToInt8U(buffer, 0);
		const [useCompress, useCRC32, useSchema] = CoderTools.bufToBinFlags(buffer, 1);

		let offset = 2;
		let schemaId: number | undefined;

		if (useCRC32) {
			offset += 4;
		}

		if (useSchema) {
			if (buffer.length < offset + 4) {
				throw new Error('Invalid packet: schema flag set but no schema id');
			}
			schemaId = CoderTools.bufToInt32U(buffer, offset);
			offset += 4;
		}

		const dataSize = buffer.length - offset;

		return {
			version,
			useCompress,
			useCRC32,
			useSchema,
			schemaId,
			dataSize
		};
	}

	setCompressionThreshold(threshold: number): void {
		if (typeof threshold !== 'number' || threshold < 0 || !Number.isInteger(threshold)) {
			throw new Error('Compression threshold must be a non-negative integer');
		}
		this.compressionLengthThreshold = threshold;
	}

	getCompressionThreshold(): number {
		return this.compressionLengthThreshold;
	}

	serialize<T extends Record<string | number | symbol, unknown> | Record<string | number, unknown>>(payload: T, schemaIdOrSchemaObject: SerializerSchemaIdOrSchemaObject = null): Buffer {
		let schema: SerializerSchemaIdOrSchemaObject = null;

		if (!isObject(payload)) {
			throw new Error('Payload must be an object');
		}

		if (schemaIdOrSchemaObject === null) {
			const payloadKeys = Object.keys(payload).sort((a, b) => a.localeCompare(b));

			for (const [id, schemaFields] of Object.entries(this.schemes)) {
				if (payloadKeys.length === schemaFields.length &&
				    payloadKeys.every((key, index) => key === schemaFields[index])) {
					schemaIdOrSchemaObject = parseInt(id);
					break;
				}
			}
		}

		const schemaId: number = isObject(schemaIdOrSchemaObject)
		                         ? (schemaIdOrSchemaObject as SerializerSchemaObject).id
		                         : (schemaIdOrSchemaObject as number);

		if (this.schemes[schemaId]) {
			const schemaFields = this.schemes[schemaId];
			const payloadKeys = Object.keys(payload).sort((a, b) => a.localeCompare(b));

			if (payloadKeys.length !== schemaFields.length) {
				throw new Error(`Schema validation failed: expected ${schemaFields.length} fields, got ${payloadKeys.length}`);
			}

			const missingFields = schemaFields.filter(field => !payloadKeys.includes(field));
			if (missingFields.length > 0) {
				throw new Error(`Schema validation failed: missing fields: ${missingFields.join(', ')}`);
			}

			const extraFields = payloadKeys.filter(key => !schemaFields.includes(key));
			if (extraFields.length > 0) {
				throw new Error(`Schema validation failed: unexpected fields: ${extraFields.join(', ')}`);
			}

			schema = {
				id    : schemaId,
				fields: schemaFields
			};

			payload = iterateSync(schemaFields, (key, _, iter) => {
				iter.key(key);
				return (payload as any)[key];
			}, {} as Record<string | symbol | number, unknown>) as T;
		}

		const payloadArray = iterateSync(payload as object, (row) => row, []);

		const out = this.coder.encode(payloadArray);
		return this.makePacket(this.options, out, schema?.id || null);
	}

	deserialize<T = unknown>(buf: Buffer | Uint8Array): T {
		const buffer = Buffer.from(buf);

		const version = CoderTools.bufToInt8U(buffer, 0);
		if (version !== this.version) {
			throw new Error('Input data version mismatch');
		}

		const [useCompress, useCRC32, useSchema] = CoderTools.bufToBinFlags(buffer, 1);
		let offset = 2;
		let crc32Offset, schemaIdOffset = 0;
		let currentSchema: SerializerSchema = [];

		if (useCRC32) {
			crc32Offset = offset;
			offset += 4;
		}

		if (useSchema) {
			schemaIdOffset = offset;
			offset += 4;
			const schemaId = CoderTools.bufToInt32U(buffer, schemaIdOffset);

			currentSchema = this.schemes[schemaId];
			if (!currentSchema) {
				throw new Error('Cant find schema by id from payload');
			}
		}

		let payload = buffer.subarray(offset, buffer.length);

		if (useCRC32) {
			const crc32 = CoderTools.bufToInt32U(buffer, crc32Offset);
			if (crc32 !== CoderTools.crc32(payload)) {
				throw new Error('Input data CRC32 error');
			}
		}

		if (useCompress) {
			const decompressor = this.options.useCompress?.decompress;
			if (!decompressor || !isFunction(decompressor)) {
				throw new Error('Packet compressed, but compressor plugin not used');
			}

			payload = Buffer.from(decompressor(payload));
		}

		let decodedPayload = this.coder.decode(payload);

		if (useSchema && currentSchema.length) {
			if (!isArray(decodedPayload)) {
				throw new Error('Encoded payload not array but schema flag is present');
			}

			const payloadArray = decodedPayload as any[];
			if (payloadArray.length !== currentSchema.length) {
				throw new Error(`Schema deserialization failed: expected ${currentSchema.length} values, got ${payloadArray.length}`);
			}

			const sortedSchema = [...currentSchema].sort((a, b) => a.localeCompare(b));

			decodedPayload = iterateSync(sortedSchema, (key, idx, iter) => {
				iter.key(key);
				return payloadArray[idx];
			}, {});
		}

		return decodedPayload as T;
	}
}
