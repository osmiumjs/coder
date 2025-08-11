export class Validations {
	// Validation
	static isValidBase64(str: string): boolean {
		try {
			return Buffer.from(str, 'base64').toString('base64') === str;
		} catch {
			return false;
		}
	}

	static isValidHex(str: string): boolean {
		return /^[0-9A-Fa-f]*$/.test(str) && str.length % 2 === 0;
	}

	static isValidBinary(str: string): boolean {
		return /^[01]*$/.test(str);
	}

	// URL helpers
	static urlSafeEncode(str: string): string {
		return encodeURIComponent(str);
	}

	static urlSafeDecode(str: string): string {
		return decodeURIComponent(str);
	}

	// UUID v4 (simple)
	static generateUUID(): string {
		const randomHex = (length: number): string => {
			const bytes = Buffer.allocUnsafe(length).map(() => Math.floor(Math.random() * 256));
			return Buffer.from(bytes).toString('hex');
		};

		const hex = randomHex(16).toLowerCase();
		return [
			hex.slice(0, 8),
			hex.slice(8, 12),
			'4' + hex.slice(13, 16),
			((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
			hex.slice(20, 32)
		].join('-');
	}

	static isValidUUID(uuid: string): boolean {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
	}
}
