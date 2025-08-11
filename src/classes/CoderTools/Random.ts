export class Random {
	// Random helpers
	static randomBytes(length: number): Buffer {
		// Handle negative lengths gracefully by treating them as 0
		const safeLength = Math.max(0, length);
		const buf = Buffer.allocUnsafe(safeLength);
		for (let i = 0; i < safeLength; i++) {
			buf[i] = Math.floor(Math.random() * 256);
		}
		return buf;
	}

	static randomHex(length: number): string {
		const bytes = this.randomBytes(length);
		return Buffer.from(bytes).toString('hex').toUpperCase();
	}

	static randomBase64(length: number): string {
		const bytes = this.randomBytes(length);
		return Buffer.from(bytes).toString('base64');
	}
}
