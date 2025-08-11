// Import all subclasses
import {Mixin}             from 'ts-mixer';
import {BaseEncoding}      from './BaseEncoding';
import {BitOperations}     from './BitOperations';
import {BufferUtils}       from './BufferUtils';
import {Checksum}          from './Checksum';
import {HexUtils}          from './HexUtils';
import {NumericConversion} from './NumericConversion';
import {Random}            from './Random';
import {Validations}       from './Validations';

// Export composite CoderTools class
export class CoderTools extends Mixin(BaseEncoding, BitOperations, BufferUtils, Checksum, HexUtils, NumericConversion, Random, Validations) {}

// Export individual subclasses for direct access if needed
export {
	BaseEncoding,
	BitOperations,
	BufferUtils,
	Checksum,
	HexUtils,
	NumericConversion,
	Random,
	Validations
};
