import {Packr, addExtension} from 'msgpackr';
import {Options}             from 'msgpackr/unpack';

export interface DataCoderOptions extends Options {
	__advanced?: number;

	// Additional custom options can be added here
}

export class DataCoder {
	private packr: Packr;
	private registeredTypes: Map<number, { Class: Function, encode: Function, decode: Function }> = new Map();

	constructor(options: DataCoderOptions = {}, packrInstance: Packr | null = null) {
		const instanceOptions: DataCoderOptions = {
			encodeUndefinedAsNil: false,
			largeBigIntToFloat  : false,
			structuredClone     : true,
			useRecords          : true,
			mapsAsObjects       : false,
			copyBuffers         : false,
			useTimestamp32      : false,
			...options
		};

		this.packr = packrInstance ?? new Packr(instanceOptions);

		// Register built-in extensions for Map and Set
		this.use(0x01, Map, (v: Map<unknown, unknown>) => [...v.entries()], (v) => new Map(v));
		this.use(0x02, Set, (v: Set<unknown>) => [...v.values()], (v) => new Set(v));
	}

	/**
	 * Register a custom type extension for encoding/decoding
	 * @param type - Unique type identifier (0-127 for user types)
	 * @param Class - Constructor function for the type
	 * @param encode - Function to serialize the instance
	 * @param decode - Function to deserialize the data
	 */
	use(type: number, Class: Function, encode: (arg: any) => any, decode: (arg: any) => any): void {
		if (type < 0 || type > 127) {
			throw new Error(`Type identifier must be between 0 and 127, got ${type}`);
		}

		if (this.registeredTypes.has(type)) {
			const existing = this.registeredTypes.get(type)!;
			if (existing.Class !== Class) {
				throw new Error(`Type ${type} is already registered for a different class`);
			}
		}

		this.registeredTypes.set(type, {Class, encode, decode});

		addExtension({
			Class,
			type,
			write(instance: any): any {
				try {
					return encode(instance);
				} catch (error) {
					throw new Error(`Failed to encode instance of ${Class.name}: ${error}`);
				}
			},
			read(datum: any): any {
				try {
					return decode(datum);
				} catch (error) {
					throw new Error(`Failed to decode data for ${Class.name}: ${error}`);
				}
			}
		});
	}

	/**
	 * Get information about registered custom types
	 */
	getRegisteredTypes(): Array<{ type: number, className: string }> {
		return Array.from(this.registeredTypes.entries()).map(([type, {Class}]) => ({
			type,
			className: Class.name
		}));
	}

	/**
	 * Check if a type is registered
	 */
	isTypeRegistered(type: number): boolean {
		return this.registeredTypes.has(type);
	}

	/**
	 * Encode data to Buffer
	 */
	encode<T = unknown>(arg: T): Buffer {
		try {
			const result = this.packr.encode(arg);
			return Buffer.isBuffer(result) ? result : Buffer.from(result);
		} catch (error) {
			throw new Error(`Failed to encode data: ${error}`);
		}
	}

	/**
	 * Decode Buffer to original data
	 */
	decode<T = unknown>(arg: Buffer | Uint8Array): T {
		if (!arg || arg.length === 0) {
			throw new Error('Cannot decode empty or null buffer');
		}

		try {
			return this.packr.unpack(arg) as T;
		} catch (error) {
			throw new Error(`Failed to decode data: ${error}`);
		}
	}

	/**
	 * Get the size of encoded data without actually encoding
	 * Useful for performance optimization
	 */
	getEncodedSize(arg: any): number {
		const encoded = this.encode(arg);
		return encoded.length;
	}

	/**
	 * Encode data to hex string for debugging/storage
	 */
	encodeToHex(arg: any): string {
		const buffer = this.encode(arg);
		return buffer.toString('hex');
	}

	/**
	 * Decode from hex string
	 */
	decodeFromHex<T = unknown>(hex: string): T {
		if (!/^[0-9a-fA-F]*$/.test(hex)) {
			throw new Error('Invalid hex string');
		}
		return this.decode(Buffer.from(hex, 'hex'));
	}

	/**
	 * Encode data to base64 string
	 */
	encodeToBase64(arg: any): string {
		const buffer = this.encode(arg);
		return buffer.toString('base64');
	}

	/**
	 * Decode from base64 string
	 */
	decodeFromBase64<T = unknown>(base64: string): T {
		try {
			return this.decode(Buffer.from(base64, 'base64'));
		} catch (error) {
			throw new Error(`Invalid base64 string: ${error}`);
		}
	}

	/**
	 * Clone an object by encoding and decoding it
	 * Useful for deep cloning complex objects
	 */
	clone<T>(obj: T): T {
		return this.decode(this.encode(obj));
	}

	/**
	 * Compare two objects by their encoded representation
	 */
	isEqual(a: any, b: any): boolean {
		try {
			const encodedA = this.encode(a);
			const encodedB = this.encode(b);
			return encodedA.equals(encodedB);
		} catch {
			return false;
		}
	}
}
