export declare class CoderTools {
    static BASE_ALPHABETS: {
        BASE16: string;
        BASE36: string;
        BASE58: string;
        BASE62: string;
        BASE66: string;
        BASE93: string;
    };
    static isBuffer(what: any): boolean;
    static makeWBuffer(cb: (arg: Buffer) => void, length: number): Buffer;
    static toBuffer(what: string | Buffer, ascii?: boolean): Buffer;
    static baseXEncode(what: string | Buffer, base: string, asAscii?: boolean): string;
    static baseXDecode(what: string, base: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base16Encode(what: string | Buffer, asAscii?: boolean): string;
    static base32Encode(what: string | Buffer, asAscii?: boolean): string;
    static base36Encode(what: string | Buffer, asAscii?: boolean): string;
    static base58Encode(what: string | Buffer, asAscii?: boolean): string;
    static base62Encode(what: string | Buffer, asAscii?: boolean): string;
    static base64Encode(what: string | Buffer, asAscii?: boolean): string;
    static base66Encode(what: string | Buffer, asAscii?: boolean): string;
    static base93Encode(what: string | Buffer, asAscii?: boolean): string;
    static base16Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base32Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base36Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base58Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base62Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base64Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base66Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static base93Decode(what: string, asBuffer?: boolean, asAscii?: boolean): CoderTools.Decodable;
    static twoInt32toInt53(val: [number, number]): number;
    static int53toTwoInt32(val: number): [number, number];
    static intToBuf(int: number, len?: number, be?: boolean): Buffer;
    static int8ToBuf(int: number): Buffer;
    static int8UToBuf(int: number): Buffer;
    static int16ToBuf(int: number, be?: boolean): Buffer;
    static int16UToBuf(int: number, be?: boolean): Buffer;
    static int32ToBuf(int: number, be?: boolean): Buffer;
    static int32UToBuf(int: number, be?: boolean): Buffer;
    static floatToBuf(int: number, be?: boolean): Buffer;
    static doubleToBuf(int: number, be?: boolean): Buffer;
    static bufToInt8(buf: Buffer, offset?: number): number;
    static bufToInt8U(buf: Buffer, offset?: number): number;
    static bufToInt16(buf: Buffer, offset?: number, be?: boolean): number;
    static bufToInt16U(buf: Buffer, offset?: number, be?: boolean): number;
    static bufToInt32(buf: Buffer, offset?: number, be?: boolean): number;
    static bufToInt32U(buf: Buffer, offset?: number, be?: boolean): number;
    static bufToInt(buf: Buffer, len?: number, offset?: number, be?: boolean): number;
    static bufToFloat(buf: Buffer, offset?: number, be?: boolean): number;
    static bufToDouble(buf: Buffer, offset?: number, be?: boolean): number;
    static pad(str: string | number, z?: number): string;
    static bufToBinFlags(buf: Buffer | number, offset?: number): Array<boolean>;
    static binFlagsToBuf(arr: Array<boolean>): Buffer;
    static hexToBinStr(val: string): string;
    static hexToBytes(val: string): Uint8Array;
    static crc32(data: Buffer | Uint8Array | string): number;
}
export declare namespace CoderTools {
    type Decodable = string | Buffer | Uint8Array;
}
