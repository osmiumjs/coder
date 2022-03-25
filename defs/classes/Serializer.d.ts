/// <reference types="node" />
import { DataCoder } from './DataCoder';
interface SerializerPacketOptions {
    useCompress: boolean;
    useCRC32: boolean;
    useSchema?: boolean;
}
export interface SerializerSchema {
    id: number;
    fields: Object;
}
declare type SchemaIdOrSchemaObject = SerializerSchema | number | null;
export declare class Serializer {
    readonly version: number;
    private compressionLengthThreshold;
    coder: DataCoder;
    private readonly options;
    private schemes;
    constructor(coder?: DataCoder, options?: SerializerPacketOptions);
    private makePacket;
    use(id: number, detector: Function, encode: (arg: any) => any, decode: (arg: any) => any): void;
    registerSchema<T>(id: number, fields: T): void;
    unregisterSchema(id: number): void;
    serialize<T>(payload: T, schemaIdOrSchemaObject?: SchemaIdOrSchemaObject): Buffer;
    deserialize<T>(buf: Buffer | Uint8Array): T;
}
export {};
