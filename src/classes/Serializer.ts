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
		this.coder = coder ?? new DataCoder();
		this.options = options;
	}

	private makePacket(config: SerializerPacketOptions, data: Buffer | Uint8Array, schema: number | null = null): Buffer {
		if (schema) {
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

	registerSchema<T>(id: number, fields: T): void
	registerSchema(id: number, fields: SerializerSchema): void {
		if (this.schemes[id]) {
			throw new Error(`Schema with id ${id} already registered`);
		}

		fields.sort((a, b) => a.localeCompare(b));

		this.schemes[id] = fields;
	}

	unregisterSchema(id: number): void {
		delete this.schemes[id];
	}

	serialize<T extends Record<string | number | symbol, unknown>>(payload: T, schemaIdOrSchemaObject: SerializerSchemaIdOrSchemaObject = null): Buffer {
		let schema: SerializerSchemaIdOrSchemaObject = null;

		if (!isObject(payload)) {
			throw new Error('Payload must be an object');
		}

		if (schemaIdOrSchemaObject === null) {
			iterateSync(this.schemes as { [id: string]: string[] }, (row, id, iter) => {
				const payloadKeys = Object.keys(payload);
				payloadKeys.sort((a, b) => a.localeCompare(b));

				if (JSON.stringify(row) !== JSON.stringify(payloadKeys)) return;

				iter.break();
				schemaIdOrSchemaObject = parseInt(id);
			});
		}

		const schemaId: number = isObject(schemaIdOrSchemaObject)
		                         ? (schemaIdOrSchemaObject as SerializerSchemaObject).id
		                         : (schemaIdOrSchemaObject as number);

		if (this.schemes[schemaId]) {
			schema = {
				id    : schemaId,
				fields: this.schemes[schemaId]
			};
			const keys = Object.keys(payload).sort((a, b) => a.localeCompare(b));

			payload = iterateSync(keys, (key, _, iter) => {
				iter.key(key);

				return (payload as any)[key];
			}, {} as Record<string | symbol | number, unknown>) as T;
		}

		const payloadArray = iterateSync(payload as {}, (row) => row, []);

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
				throw new Error('Packet compressed, but compressor plugin not user');
			}

			payload = Buffer.from(decompressor(payload));
		}

		let decodedPayload = this.coder.decode(payload);

		if (useSchema && currentSchema.length) {
			if (!isArray(decodedPayload)) {
				throw new Error('Encoded payload not array but schema flag is present');
			}

			currentSchema.sort((a, b) => a.localeCompare(b));

			decodedPayload = iterateSync(currentSchema, (key, idx, iter) => {
				iter.key(key);

				return (decodedPayload as [any])[idx];
			}, {});
		}

		return decodedPayload as T;
	}
}
