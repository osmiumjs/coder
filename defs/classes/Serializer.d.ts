/// <reference types="node" />
import { DataCoder } from './DataCoder';
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
type SerializerSchemaIdOrSchemaObject = SerializerSchemaObject | number | null;
export declare class Serializer {
    readonly version: number;
    private compressionLengthThreshold;
    coder: DataCoder;
    private enableCompression;
    private readonly options;
    private schemes;
    constructor(coder?: DataCoder, options?: SerializerPacketOptions);
    private makePacket;
    use(id: number, detector: Function, encode: (arg: any) => any, decode: (arg: any) => any): void;
    registerSchema<T>(id: number, fields: T): void;
    unregisterSchema(id: number): void;
    serialize<T extends {
        [key: string | number | symbol]: unknown;
    }>(payload: T, schemaIdOrSchemaObject?: SerializerSchemaIdOrSchemaObject): Buffer;
    deserialize<T = unknown>(buf: Buffer | Uint8Array): T;
}
export {};
