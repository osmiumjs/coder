const {describe, it} = require('mocha');
const {expect} = require('chai');

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

class TestClassSer {
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

function doTests(coderName, title) {
	const {dataCoder, serializer, _Buffer, CoderTools} = require(`../dist/${coderName}`);
	const Buffer = _Buffer;

	function encodeDecode(val) {
		return dataCoder.decode(dataCoder.encode(val));
	}

	function serializeDeserialize(serializer, data) {
		return serializer.deserialize(serializer.serialize(data));
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
					expect(encodeDecode(str8)).to.equal(str8);
				});

				it('2-byte length', function () {
					const str16 = 'X'.repeat(65535);
					expect(encodeDecode(str16)).to.equal(str16);
				});

				it('4-byte length', function () {
					const str32 = 'X'.repeat(65536);
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
					expect(encodeDecode(int8)).to.equal(int8);
					expect(encodeDecode(0)).to.be.not.equal(int8);
				});

				it('2-byte length, positive integer', function () {
					const int16 = 255 * 255;
					expect(encodeDecode(int16)).to.equal(int16);
				});

				it('4-byte length, positive integer', function () {
					const int32 = 255 * 255 * 256 * 256;
					expect(encodeDecode(int32)).to.equal(int32);
				});

				it('8-byte length (max 53 bit), positive integer', function () {
					const int53 = Number.MAX_SAFE_INTEGER;
					expect(encodeDecode(int53)).to.equal(int53);
				});

				it('1-byte length, negative integer', function () {
					const nint8 = -255;
					const type = dataCoder.encode(nint8)[0];
					expect(encodeDecode(0)).to.be.not.equal(nint8);
				});

				it('2-byte length, negative integer', function () {
					const nint16 = -255 * 255;
					expect(encodeDecode(nint16)).to.equal(nint16);
				});

				it('4-byte length, negative integer', function () {
					const nint32 = -255 * 255 * 256 * 256;
					expect(encodeDecode(nint32)).to.equal(nint32);
				});

				it('8-byte length (max 53 bit), negative integer', function () {
					const nint53 = Number.MIN_SAFE_INTEGER;
					expect(encodeDecode(nint53)).to.equal(nint53);
				});

				it('8-byte length (max 53 bit), positive double/float', function () {
					const double = 2314979.417293014;
					expect(encodeDecode(double)).to.equal(double);
				});

				it('8-byte length (max 53 bit), negative double/float', function () {
					const ndouble = -989012752.280917344;
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
					expect(encodeDecode(arrayEmpty)).to.eql(arrayEmpty);
				});

				it('1-byte length', function () {
					const array8 = makeArray(255);
					expect(encodeDecode(array8)).to.eql(array8);
				});

				it('2-byte length', function () {
					const array16 = makeArray(65535);
					expect(encodeDecode(array16)).to.eql(array16);
				});

				it('4-byte length', function () {
					const array32 = makeArray(65536);
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
					expect(encodeDecode(object8)).to.eql(object8);
				});

				it('2-byte size', function () {
					const object16 = makeObject(65535);
					expect(encodeDecode(object16)).to.eql(object16);
				});

				it('4-byte size', function () {
					const object32 = makeObject(65536);
					expect(encodeDecode(object32)).to.eql(object32);
				});
			});

			describe('Map', function () {
				it('Map number/string', function () {
					const map = (new Map()).set(1, '1').set(2, '2').set(3, '3').set(4, '4');
					expect(encodeDecode(map)).to.eql(map);
				});

				it('Map array/number', function () {
					const map = (new Map()).set(['1'], 1).set(['2'], 2).set(['3'], 3).set(['4'], 4);
					expect(encodeDecode(map)).to.eql(map);
				});

				it('Map object/array', function () {
					const map = (new Map()).set({a: 'a'}, [1]).set({b: 'b'}, [2]).set({c: 'c'}, [3]).set({d: 'd'}, [4]);
					expect(encodeDecode(map)).to.eql(map);
				});
			});

			describe('Set', function () {
				it('Set number', function () {
					const map = (new Set()).add(1).add(2).add(3).add(4);
					expect(encodeDecode(map)).to.eql(map);
				});

				it('Set array', function () {
					const map = (new Set()).add([1]).add([2]).add([3]).add([4]);
					expect(encodeDecode(map)).to.eql(map);
				});

				it('Set object', function () {
					const map = (new Set()).add({a: 'a'}).add({b: 'b'}).add({c: 'c'}).add({d: 'd'});
					expect(encodeDecode(map)).to.eql(map);
				});
			});

			describe('Complex types', function () {
				it('Date', function () {
					const date = new Date();
					expect(encodeDecode(date)).to.eql(date);
				});

				it('Buffer, 1-byte length', function () {
					const buf8 = Buffer.from('SuperTest123');
					expect(encodeDecode(buf8)).to.eql(buf8);
				});

				it('Buffer, 2-byte length', function () {
					const buf16 = Buffer.from('X'.repeat(65535));
					expect(encodeDecode(buf16)).to.eql(buf16);
				});

				it('Buffer, 4-byte length', function () {
					const buf32 = Buffer.from('X'.repeat(65536));
					expect(encodeDecode(buf32)).to.eql(buf32);
				});
			});

			describe('Custom types', function () {
				it('TestClass, 1-byte length', function () {
					dataCoder.use(101, TestClass, (v) => v.getValue(), (v) => new TestClass(v));

					const coded = dataCoder.encode(new TestClass('hellomoto'));
					const cInst = dataCoder.decode(coded);

					expect(cInst).to.be.instanceOf(TestClass);
					expect(typeof (cInst.getValue)).to.be.equals('function');
					expect(cInst.getValue()).to.be.equal('hellomoto');
				});
			});
		});

		describe(`${title}::Binary schema-based serializer test`, function () {
			it('Object', function () {
				const sample = {key1: true, key2: 291, key3: 'hello', key4: {a: 1, b: -20, c: 'hello'}};
				serializer.registerSchema(1, Object.keys(sample));
				expect(serializeDeserialize(serializer, sample)).to.eql(sample);
			});

			it('Object with custom', function () {
				const testValue = {test: new TestClassSer('hellomoto2')};

				serializer.registerSchema(2, Object.keys(testValue));

				serializer.use(102, TestClassSer, (v) => v.getValue(), (v) => new TestClassSer(v));

				const coded = serializer.serialize(testValue);
				const cInst = serializer.deserialize(coded);

				expect(cInst.test).to.be.instanceOf(TestClassSer);
				expect(typeof (cInst.test.getValue)).to.be.equals('function');
				expect(cInst.test.getValue()).to.be.equal('hellomoto2');
			});
		});

		describe(`${title}::Coder tools`, function () {
			const testStr = 'HelloMoto Тест123';

			describe('BaseX code/encode tools', function () {
				it('Base16 encode/decode', function () {
					expect(CoderTools.base16Encode(testStr)).to.equal('48656C6C6F4D6F746F20D0A2D0B5D181D182313233');
					expect(CoderTools.base16Decode(CoderTools.base16Encode(testStr))).to.equal(testStr);
				});

				it('base32 encode/decode', function () {
					expect(CoderTools.base32Encode(testStr)).to.equal('JBSWY3DPJVXXI3ZA2CRNBNORQHIYEMJSGM======');
					expect(CoderTools.base32Decode(CoderTools.base32Encode(testStr))).to.equal(testStr);
				});

				it('base36 encode/decode', function () {
					expect(CoderTools.base36Encode(testStr)).to.equal('1O4WS5AQ7XCB0KR8GZYNLDEHXZHW8XI5V');
					expect(CoderTools.base36Decode(CoderTools.base36Encode(testStr))).to.equal(testStr);
				});

				it('base58 encode/decode', function () {
					expect(CoderTools.base58Encode(testStr)).to.equal('5TChexcVj6f6WksjrzhvPYZRHHnpz');
					expect(CoderTools.base58Decode(CoderTools.base58Encode(testStr))).to.equal(testStr);
				});

				it('base62 encode/decode', function () {
					expect(CoderTools.base62Encode(testStr)).to.equal('GEqhfT5yW8QElmFSBPgHHjsOSinF');
					expect(CoderTools.base62Decode(CoderTools.base62Encode(testStr))).to.equal(testStr);
				});

				it('base64 encode/decode', function () {
					expect(CoderTools.base64Encode(testStr)).to.equal('SGVsbG9Nb3RvINCi0LXRgdGCMTIz');
					expect(CoderTools.base64Decode(CoderTools.base64Encode(testStr))).to.equal(testStr);
				});

				it('base66 encode/decode', function () {
					expect(CoderTools.base66Encode(testStr)).to.equal('FRBg8olLsIcAKxdYJVo1~TM!5RTs');
					expect(CoderTools.base66Decode(CoderTools.base66Encode(testStr))).to.equal(testStr);
				});
			});
		});
	});
}

doTests('index', 'Full');
doTests('index.min', 'Minimifed');
