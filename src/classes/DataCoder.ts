import {Packr, addExtension} from 'msgpackr';
import {Options} from 'msgpackr/unpack';

export class DataCoder {
	private packr: Packr;

	constructor(options: Options = {}, packrInstance: Packr | null = null) {
		const instanceOptions = Object.assign({
			encodeUndefinedAsNil: false,
			largeBigIntToFloat  : false,
			structuredClone     : true,
			useRecords          : true,
			mapsAsObjects       : false,
			copyBuffers         : false,
			useTimestamp32      : false,
			int64AsNumber       : false
		}, options);

		this.packr = packrInstance ? packrInstance : new Packr(instanceOptions);
	}

	use(type: number, Class: Function, encode: (arg: any) => any, decode: (arg: any) => any): void {
		addExtension({
			Class,
			type,
			write(instance: any): any {
				return encode(instance);
			},
			read(datum: any): any {
				return decode(datum);
			}
		});
	}

	encode<T>(arg: T): Buffer
	encode(arg: any): Buffer {
		return this.packr.encode(arg);
	}

	decode<T>(arg: Buffer | Uint8Array): T
	decode(arg: Buffer | Uint8Array): any {
		return this.packr.unpack(arg);
	}
}
