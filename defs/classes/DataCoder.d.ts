import { Packr } from 'msgpackr';
import { Options } from 'msgpackr/unpack';
export declare class DataCoder {
    private packr;
    constructor(options?: Options, packrInstance?: Packr | null);
    use(type: number, Class: Function, encode: (arg: any) => any, decode: (arg: any) => any): void;
    encode<T>(arg: T): Buffer;
    decode<T>(arg: Buffer | Uint8Array): T;
}
