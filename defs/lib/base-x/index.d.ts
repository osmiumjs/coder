/// <reference types="node" />
declare function base(ALPHABET: string): base.BaseConverter;
export default base;
declare namespace base {
    interface BaseConverter {
        encode(buffer: Buffer | number[] | Uint8Array): string;
        decodeUnsafe(string: string): Buffer | undefined;
        decode(string: string): Buffer;
    }
}
