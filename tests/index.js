const {describe, it} = require('mocha');
const {expect} = require('chai');
const types = require('../dist/lib/binarySerializer/types');

function doTests(coderName, title) {
	const {dataCoder, serializer, coderTools, _Buffer} = require(`../dist/${coderName}`);
	const Buffer = _Buffer;

	function encodeDecode(val) {
		dataCoder.use(0xF2, (v) => v instanceof RegExp, (v) => {
			const regArr = v.toString().split('/').reverse();
			const flags = regArr[0];
			regArr[0] = '';
			let regExpStr = regArr.reverse().join('/');
			regExpStr = regExpStr.substr(1, regExpStr.length - 2);

			return dataCoder.encode([regExpStr, flags]);
		}, (v) => {
			const rExp = dataCoder.decode(v);
			return new RegExp(rExp[0], rExp[1]);
		});

		return dataCoder.decode(dataCoder.encode(val));
	}

	function serializeDeserialize(serializer, data) {
		return serializer.deserialize(serializer.serialize(data), Object.keys(data));
	}

	describe(`==== Test for "${title}" version ====`, function () {
		describe(`${title}::Binary serializer test`, function () {
			describe('Primitives', () => {
				it('undefined', function () {
					expect(encodeDecode(undefined)).to.equal(undefined);
				});

				it('null', function () {
					expect(encodeDecode(null)).to.equal(null);
				});

				it('zero (0)', function () {
					expect(encodeDecode(0)).to.equal(0);
				});

				it('false', function () {
					expect(encodeDecode(false)).to.equal(false);
				});

				it('true', function () {
					expect(encodeDecode(true)).to.equal(true);
				});

				it('infinity', function () {
					expect(encodeDecode(Infinity)).to.equal(Infinity);
				});

				it('infinity negative', function () {
					expect(encodeDecode(-Infinity)).to.equal(-Infinity);
				});

				it('NaN', function () {
					expect(encodeDecode(NaN)).to.be.NaN;
				});
			});

			describe('String', function () {
				it('empty', function () {
					expect(encodeDecode('')).to.equal('');
				});

				it('1-byte length', function () {
					const str8 = 'X'.repeat(255);
					const type = dataCoder.encode(str8)[0];
					expect(encodeDecode(type)).to.equal(types.STR8, 'Incorrect type');
					expect(encodeDecode(str8)).to.equal(str8);
				});

				it('2-byte length', function () {
					const str16 = 'X'.repeat(65535);
					const type = dataCoder.encode(str16)[0];
					expect(encodeDecode(type)).to.equal(types.STR16, 'Incorrect type');
					expect(encodeDecode(str16)).to.equal(str16);
				});

				it('4-byte length', function () {
					const str32 = 'X'.repeat(65536);
					const type = dataCoder.encode(str32)[0];
					expect(encodeDecode(type)).to.equal(types.STR32, 'Incorrect type');
					expect(encodeDecode(str32)).to.equal(str32);
				});

				it('UTF-8', function () {
					const str = 'Huöut væ 💥💖 Iñtërnâtiônàlizætiønабвгдейка123';
					expect(encodeDecode(str)).to.equal(str);
				});
			});

			describe('Numeric', function () {
				it('1-byte length, positive integer', function () {
					const int8 = 255;
					const type = dataCoder.encode(int8)[0];
					expect(encodeDecode(type)).to.equal(types.UINT8, 'Incorrect type');
					expect(encodeDecode(int8)).to.equal(int8);
					expect(encodeDecode(0)).to.be.not.equal(int8);
				});

				it('2-byte length, positive integer', function () {
					const int16 = 255 * 255;
					const type = dataCoder.encode(int16)[0];
					expect(encodeDecode(type)).to.equal(types.UINT16, 'Incorrect type');
					expect(encodeDecode(int16)).to.equal(int16);
				});

				it('4-byte length, positive integer', function () {
					const int32 = 255 * 255 * 256 * 256;
					const type = dataCoder.encode(int32)[0];
					expect(encodeDecode(type)).to.equal(types.UINT32, 'Incorrect type');
					expect(encodeDecode(int32)).to.equal(int32);
				});

				it('8-byte length (max 53 bit), positive integer', function () {
					const int53 = Number.MAX_SAFE_INTEGER;
					const type = dataCoder.encode(int53)[0];
					expect(encodeDecode(type)).to.equal(types.UINT53, 'Incorrect type');
					expect(encodeDecode(int53)).to.equal(int53);
				});

				it('1-byte length, negative integer', function () {
					const nint8 = -255;
					const type = dataCoder.encode(nint8)[0];
					expect(encodeDecode(type)).to.equal(types.NUINT8, 'Incorrect type');
					expect(encodeDecode(nint8)).to.equal(nint8);
					expect(encodeDecode(0)).to.be.not.equal(nint8);
				});

				it('2-byte length, negative integer', function () {
					const nint16 = -255 * 255;
					const type = dataCoder.encode(nint16)[0];
					expect(encodeDecode(type)).to.equal(types.NUINT16, 'Incorrect type');
					expect(encodeDecode(nint16)).to.equal(nint16);
				});

				it('4-byte length, negative integer', function () {
					const nint32 = -255 * 255 * 256 * 256;
					const type = dataCoder.encode(nint32)[0];
					expect(encodeDecode(type)).to.equal(types.NUINT32, 'Incorrect type');
					expect(encodeDecode(nint32)).to.equal(nint32);
				});

				it('8-byte length (max 53 bit), negative integer', function () {
					const nint53 = Number.MIN_SAFE_INTEGER;
					const type = dataCoder.encode(nint53)[0];
					expect(encodeDecode(type)).to.equal(types.NUINT53, 'Incorrect type');
					expect(encodeDecode(nint53)).to.equal(nint53);
				});

				it('8-byte length (max 53 bit), positive double/float', function () {
					const double = 2314979.417293014;
					const type = dataCoder.encode(double)[0];
					expect(encodeDecode(type)).to.equal(types.DOUBLE, 'Incorrect type');
					expect(encodeDecode(double)).to.equal(double);
				});

				it('8-byte length (max 53 bit), negative double/float', function () {
					const ndouble = -989012752.280917344;
					const type = dataCoder.encode(ndouble)[0];
					expect(encodeDecode(type)).to.equal(types.DOUBLE, 'Incorrect type');
					expect(encodeDecode(ndouble)).to.equal(ndouble);
				});
			});

			function makeArray(len) {
				const array8 = new Array(len - 4);
				array8.fill(undefined);
				array8.push('testString');
				array8.push(false);
				array8.push({test: 123, hello: [1, 2]});
				array8.push(1293876192);
				return array8;
			}

			describe('Array', function () {
				it('empty', function () {
					const arrayEmpty = [];
					const type = dataCoder.encode(arrayEmpty)[0];
					expect(encodeDecode(type)).to.equal(types.ARRAY8, 'Incorrect type');
					expect(encodeDecode(arrayEmpty)).to.eql(arrayEmpty);
				});

				it('1-byte length', function () {
					const array8 = makeArray(255);
					const type = dataCoder.encode(array8)[0];
					expect(encodeDecode(type)).to.equal(types.ARRAY8, 'Incorrect type');
					expect(encodeDecode(array8)).to.eql(array8);
				});

				it('2-byte length', function () {
					const array16 = makeArray(65535);
					const type = dataCoder.encode(array16)[0];
					expect(encodeDecode(type)).to.equal(types.ARRAY16, 'Incorrect type');
					expect(encodeDecode(array16)).to.eql(array16);
				});

				it('4-byte length', function () {
					const array32 = makeArray(65536);
					const type = dataCoder.encode(array32)[0];
					expect(encodeDecode(type)).to.equal(types.ARRAY32, 'Incorrect type');
					expect(encodeDecode(array32)).to.eql(array32);
				});
			});

			function makeObject(size) {
				let ans = {};
				for (let i = 0; i < size; i++) {
					ans[i] = true;
				}
				return ans;
			}

			describe('Objects', function () {
				it('1-byte size', function () {
					const object8 = makeObject(255);
					const type = dataCoder.encode(object8)[0];
					expect(encodeDecode(type)).to.equal(types.OBJECT8, 'Incorrect type');
					expect(encodeDecode(object8)).to.eql(object8);
				});

				it('2-byte size', function () {
					const object16 = makeObject(65535);
					const type = dataCoder.encode(object16)[0];
					expect(encodeDecode(type)).to.equal(types.OBJECT16, 'Incorrect type');
					expect(encodeDecode(object16)).to.eql(object16);
				});

				it('4-byte size', function () {
					const object32 = makeObject(65536);
					const type = dataCoder.encode(object32)[0];
					expect(encodeDecode(type)).to.equal(types.OBJECT32, 'Incorrect type');
					expect(encodeDecode(object32)).to.eql(object32);
				});
			});

			describe('Complex types', function () {
				it('Date', function () {
					const date = new Date();
					const type = dataCoder.encode(date)[0];
					expect(encodeDecode(type)).to.equal(types.DATE, 'Incorrect type');
					expect(encodeDecode(date)).to.eql(date);
				});

				it('Buffer, 1-byte length', function () {
					const buf8 = Buffer.from('SuperTest123');
					const type = dataCoder.encode(buf8)[0];
					expect(encodeDecode(type)).to.equal(types.BUFFER8, 'Incorrect type');
					expect(encodeDecode(buf8)).to.eql(buf8);
				});

				it('Buffer, 2-byte length', function () {
					const buf16 = Buffer.from('X'.repeat(65535));
					const type = dataCoder.encode(buf16)[0];
					expect(encodeDecode(type)).to.equal(types.BUFFER16, 'Incorrect type');
					expect(encodeDecode(buf16)).to.eql(buf16);
				});

				it('Buffer, 4-byte length', function () {
					const buf32 = Buffer.from('X'.repeat(65536));
					const type = dataCoder.encode(buf32)[0];
					expect(encodeDecode(type)).to.equal(types.BUFFER32, 'Incorrect type');
					expect(encodeDecode(buf32)).to.eql(buf32);
				});
			});

			class TestClass {
				constructor(value) {
					this.setValue(value);
				}

				setValue(value) {
					this.value = value;
				}

				getValue() {
					return this.value;
				}
			}

			describe('Custom types', function () {
				it('0x22 - TestClass, 1-byte length', function () {
					dataCoder.use(0x22, (v) => (v instanceof TestClass), (v) => dataCoder.encode(v.getValue()), (v) => new TestClass(dataCoder.decode(v)));

					const coded = dataCoder.encode(new TestClass('hellomoto'));
					const cInst = dataCoder.decode(coded);

					expect(coded[0]).to.equal(types.CUSTOM8, 'Incorrect type');
					expect(coded[2]).to.equal(0x22, 'Incorrect custom type');

					expect(cInst).to.be.instanceOf(TestClass);
					expect(typeof (cInst.getValue)).to.be.equals('function');
					expect(cInst.getValue()).to.be.equal('hellomoto');
				});

				it('0x23 - Symbol in object, 1-byte length', function () {
					const testSymbol = Symbol('Test1');
					const testOtherSymbol = Symbol('Test2');
					const testData = {key1: 1, keySymb: testSymbol};

					dataCoder.use(0x23, (v) => v === testSymbol, () => Buffer.from(''), () => testSymbol);

					const coded = dataCoder.encode(testData);
					const cTestSymbol = dataCoder.decode(coded);

					expect(cTestSymbol).to.eql(testData);
					expect(() => encodeDecode(testOtherSymbol)).to.throw();
				});

				it('0x24 - RegExp type', function () {
					const reText = 'test(1|2)';
					const re = new RegExp(reText);

					dataCoder.use(0x24, (v) => v instanceof RegExp, (v) => dataCoder.encode(v.toString()), (v) => new RegExp(dataCoder.decode(v)));

					expect(encodeDecode(re)).to.be.eql(re);
				});
			});
		});

		describe(`${title}::Binary schema-based serializer test`, function () {
			it('Object', function () {
				const sample = {key1: true, key2: 291, key3: 'hello', key4: {a: 1, b: -20, c: 'hello'}};

				expect(serializeDeserialize(serializer, sample)).to.eql(sample);
			});

			it('Object with custom', function () {
				const symbol = Symbol();
				const sample = {key1: true, key2: symbol};
				serializer.use(0x10, (v) => v === symbol, () => Buffer.from(''), () => symbol);

				expect(serializeDeserialize(serializer, sample)).to.eql(sample);
			});
		});

		describe(`${title}::Coder tools`, function () {
			const testStr = 'HelloMoto Тест123';

			describe('BaseX code/encode tools', function () {
				it('Base16 encode/decode', function () {
					expect(coderTools.base16Encode(testStr)).to.equal('48656C6C6F4D6F746F20D0A2D0B5D181D182313233');
					expect(coderTools.base16Decode(coderTools.base16Encode(testStr))).to.equal(testStr);
				});

				it('base32 encode/decode', function () {
					expect(coderTools.base32Encode(testStr)).to.equal('JBSWY3DPJVXXI3ZA2CRNBNORQHIYEMJSGM======');
					expect(coderTools.base32Decode(coderTools.base32Encode(testStr))).to.equal(testStr);
				});

				it('base36 encode/decode', function () {
					expect(coderTools.base36Encode(testStr)).to.equal('1O4WS5AQ7XCB0KR8GZYNLDEHXZHW8XI5V');
					expect(coderTools.base36Decode(coderTools.base36Encode(testStr))).to.equal(testStr);
				});

				it('base58 encode/decode', function () {
					expect(coderTools.base58Encode(testStr)).to.equal('5TChexcVj6f6WksjrzhvPYZRHHnpz');
					expect(coderTools.base58Decode(coderTools.base58Encode(testStr))).to.equal(testStr);
				});

				it('base62 encode/decode', function () {
					expect(coderTools.base62Encode(testStr)).to.equal('GEqhfT5yW8QElmFSBPgHHjsOSinF');
					expect(coderTools.base62Decode(coderTools.base62Encode(testStr))).to.equal(testStr);
				});

				it('base64 encode/decode', function () {
					expect(coderTools.base64Encode(testStr)).to.equal('SGVsbG9Nb3RvINCi0LXRgdGCMTIz');
					expect(coderTools.base64Decode(coderTools.base64Encode(testStr))).to.equal(testStr);
				});

				it('base66 encode/decode', function () {
					expect(coderTools.base66Encode(testStr)).to.equal('FRBg8olLsIcAKxdYJVo1~TM!5RTs');
					expect(coderTools.base66Decode(coderTools.base66Encode(testStr))).to.equal(testStr);
				});
			});
		});
	});
}

doTests('index', 'Full');
doTests('index.min', 'Minimifed');
