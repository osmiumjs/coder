export type DecodeResult = Buffer | String;

export type DetectorCallback = (arg: any) => boolean;

export type EncodeCallback = (arg: any) => Buffer;

export type DecodeCallback = (arg: Buffer) => any;

interface Customs {
	id?: number;
	detector: DetectorCallback,
}

export interface DecodeCustoms extends Customs {
	decode: DecodeCallback;
}

export interface EncodeCustoms extends Customs {
	encode: EncodeCallback;
}

export type CommonCustoms = DecodeCustoms | EncodeCustoms;

export interface IndexedObject {
	[index: number]: CommonCustoms;
}
