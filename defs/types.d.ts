/// <reference types="node" />
export declare type DecodeResult = Buffer | String;
export declare type DetectorCallback = (arg: any) => boolean;
export declare type EncodeCallback = (arg: any) => Buffer;
export declare type DecodeCallback = (arg: Buffer) => any;
interface Customs {
    id?: number;
    detector: DetectorCallback;
}
export interface DecodeCustoms extends Customs {
    decode: DecodeCallback;
}
export interface EncodeCustoms extends Customs {
    encode: EncodeCallback;
}
export declare type CommonCustoms = DecodeCustoms | EncodeCustoms;
export interface IndexedObject {
    [index: number]: CommonCustoms;
}
export {};
