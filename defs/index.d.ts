/// <reference types="node" />
import * as nTools from '@osmium/tools';
import { DetectorCallback, DecodeCallback, DecodeResult, EncodeCallback, EncodeCustoms, IndexedObject } from './types';
declare const _Buffer: any;
import BaseX from './lib/base-x/index';
declare const coderTools: {
    BASE_ALPHABETS: {
        BASE16: string;
        BASE36: string;
        BASE58: string;
        BASE62: string;
        BASE66: string;
    };
    BaseX: typeof BaseX;
    base16Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base32Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base36Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base58Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base62Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base64Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base66Encode: (what: string | Buffer, asAscii?: boolean) => string;
    base16Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
    base32Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult | Uint8Array;
    base36Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
    base58Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult | Uint8Array;
    base62Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
    base64Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult | Uint8Array;
    base66Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
    /**
     * @param {[Number, Number]} val
     * @returns {Number}
     */
    twoInt32toInt53: (val: Array<number>) => number;
    /**
     * @param {Number} val
     * @returns {[Number, Number]}
     */
    int53toTwoInt32: (val: number) => number[];
    intToBuf: (int: number, len?: number, be?: boolean) => Buffer;
    int8ToBuf: (int: number) => Buffer;
    int8UToBuf: (int: number) => Buffer;
    int16ToBuf: (int: number, be?: boolean) => Buffer;
    int16UToBuf: (int: number, be?: boolean) => Buffer;
    int32ToBuf: (int: number, be?: boolean) => Buffer;
    int32UToBuf: (int: number, be?: boolean) => Buffer;
    floatToBuf: (int: number, be?: boolean) => Buffer;
    doubleToBuf: (int: number, be?: boolean) => Buffer;
    bufToInt8: (buf: Buffer, offset?: number) => number;
    bufToInt8U: (buf: Buffer, offset?: number) => number;
    bufToInt16: (buf: Buffer, offset?: number, be?: boolean) => number;
    bufToInt16U: (buf: Buffer, offset?: number, be?: boolean) => number;
    bufToInt32: (buf: Buffer, offset?: number, be?: boolean) => number;
    bufToInt32U: (buf: Buffer, offset?: number, be?: boolean) => number;
    bufToInt: (buf: Buffer, len?: number, offset?: number, be?: boolean) => number;
    bufToFloat: (buf: Buffer, offset?: number, be?: boolean) => number;
    bufToDouble: (buf: Buffer, offset?: number, be?: boolean) => number;
    pad: (str: string, z?: number) => string;
    bufToBinFlags: (buf: Buffer, offset: number) => Array<Boolean>;
    binFlagsToBuf: (arr: Array<boolean>) => Buffer;
    hexToBinStr: (val: string) => string;
    crc32: any;
};
declare class DataEncoder {
    customs: Array<EncodeCustoms>;
    constructor();
    use(id: number, detector: DetectorCallback, encode: EncodeCallback): void;
    encode(arg: any): Buffer;
}
declare class DataDecoder {
    customs: IndexedObject;
    constructor();
    use(id: number, detector: DetectorCallback, decode: DecodeCallback): void;
    decode(arg: Buffer | ArrayBuffer | SharedArrayBuffer): any;
}
export declare class DataCoder {
    decoder: DataDecoder;
    encoder: DataEncoder;
    tools: typeof coderTools;
    nTools: typeof nTools;
    used: IndexedObject;
    constructor();
    use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void;
    getUsed(): IndexedObject;
    encode<T>(args: T): Buffer;
    decode(args: Buffer | ArrayBuffer | SharedArrayBuffer): any;
}
declare class SerializerProto {
    version: number;
    crc32: (buf: (Buffer | string | Uint8Array), previous?: number) => number;
    tools: typeof coderTools;
    used: IndexedObject;
    coder: DataCoder;
    constructor(coder: DataCoder);
    use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void;
    getUsed(): IndexedObject;
}
declare class Serialize extends SerializerProto {
    constructor(coder: DataCoder);
    _makePacket(version: number, data: Uint8Array): Buffer;
    serializeArray(val: Array<object>): Buffer;
    serialize(val: any, noPacket?: boolean): Buffer | Boolean;
}
declare class Deserialize extends SerializerProto {
    schema: Array<any>;
    constructor(schema: Array<any>, coder: DataCoder);
    _decodeVersion(val: Buffer | ArrayBuffer | SharedArrayBuffer): number;
    _decode(val: Buffer | ArrayBuffer | SharedArrayBuffer, noProcess?: boolean): any;
    deserializeArray(val: Buffer | ArrayBuffer | SharedArrayBuffer): any;
    deserialize(val: Buffer | ArrayBuffer | SharedArrayBuffer, schema?: any, noProcess?: boolean): any;
}
export declare class Serializer {
    coder: DataCoder;
    serializer: Serialize;
    deserializer: Deserialize;
    constructor(schema?: any, coder?: DataCoder);
    use<T>(id: number, detector: DetectorCallback, encode: (arg: T) => Buffer, decode: (arg: Buffer) => T): void;
    serialize(args: any): Buffer | Boolean;
    serializeArray(...args: Array<any>): Buffer;
    deserialize(args: Buffer | ArrayBuffer | SharedArrayBuffer, schema?: any): any;
    deserializeArray(args: Buffer | ArrayBuffer | SharedArrayBuffer): any;
    encode(...args: Array<any>): Buffer;
    decode(args: Buffer | ArrayBuffer | SharedArrayBuffer): any;
}
export * as nTools from '@osmium/tools';
export { coderTools, _Buffer };
export declare const dataCoder: DataCoder;
export declare const serializer: Serializer;
declare const _default: {
    nTools: typeof nTools;
    coderTools: {
        BASE_ALPHABETS: {
            BASE16: string;
            BASE36: string;
            BASE58: string;
            BASE62: string;
            BASE66: string;
        };
        BaseX: typeof BaseX;
        base16Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base32Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base36Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base58Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base62Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base64Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base66Encode: (what: string | Buffer, asAscii?: boolean) => string;
        base16Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
        base32Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => Uint8Array | DecodeResult;
        base36Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
        base58Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => Uint8Array | DecodeResult;
        base62Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
        base64Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => Uint8Array | DecodeResult;
        base66Decode: (what: string, asBuffer?: boolean, asAscii?: boolean) => DecodeResult;
        /**
         * @param {[Number, Number]} val
         * @returns {Number}
         */
        twoInt32toInt53: (val: number[]) => number;
        /**
         * @param {Number} val
         * @returns {[Number, Number]}
         */
        int53toTwoInt32: (val: number) => number[];
        intToBuf: (int: number, len?: number, be?: boolean) => Buffer;
        int8ToBuf: (int: number) => Buffer;
        int8UToBuf: (int: number) => Buffer;
        int16ToBuf: (int: number, be?: boolean) => Buffer;
        int16UToBuf: (int: number, be?: boolean) => Buffer;
        int32ToBuf: (int: number, be?: boolean) => Buffer;
        int32UToBuf: (int: number, be?: boolean) => Buffer;
        floatToBuf: (int: number, be?: boolean) => Buffer;
        doubleToBuf: (int: number, be?: boolean) => Buffer;
        bufToInt8: (buf: Buffer, offset?: number) => number;
        bufToInt8U: (buf: Buffer, offset?: number) => number;
        bufToInt16: (buf: Buffer, offset?: number, be?: boolean) => number;
        bufToInt16U: (buf: Buffer, offset?: number, be?: boolean) => number;
        bufToInt32: (buf: Buffer, offset?: number, be?: boolean) => number;
        bufToInt32U: (buf: Buffer, offset?: number, be?: boolean) => number;
        bufToInt: (buf: Buffer, len?: number, offset?: number, be?: boolean) => number;
        bufToFloat: (buf: Buffer, offset?: number, be?: boolean) => number;
        bufToDouble: (buf: Buffer, offset?: number, be?: boolean) => number;
        pad: (str: string, z?: number) => string;
        bufToBinFlags: (buf: Buffer, offset: number) => Boolean[];
        binFlagsToBuf: (arr: boolean[]) => Buffer;
        hexToBinStr: (val: string) => string;
        crc32: any;
    };
    dataCoder: DataCoder;
    serializer: Serializer;
    DataCoder: typeof DataCoder;
    Serializer: typeof Serializer;
    _Buffer: any;
};
export default _default;
