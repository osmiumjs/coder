export class CRC32 {
	private static table: Int32Array = (() => {
		const table = new Array(256);
		for (let i = 0; i < 256; i++) {
			let c = i;
			for (let j = 0; j < 8; j++) {
				c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
			}
			table[i] = c >>> 0;
		}

		return new Int32Array(table);
	})();

	static calc(data: string | Uint8Array): number {
		let crc = 0xFFFFFFFF;

		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			data = encoder.encode(data);
		}

		for (const element of data) {
			crc = (crc >>> 8) ^ CRC32.table[(crc ^ element) & 0xFF];
		}

		return (crc ^ -1) >>> 0;
	}
}