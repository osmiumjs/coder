const _Buffer = require('buffer').Buffer;

import {CoderTools} from './classes/CoderTools';
import {DataCoder}  from './classes/DataCoder';
import {Serializer} from './classes/Serializer';

export {Options} from 'msgpackr/unpack';

const dataCoder = new DataCoder();
const serializer = new Serializer(dataCoder);

export {
	CoderTools,
	dataCoder,
	serializer,
	DataCoder,
	Serializer,
	_Buffer
};

export default {
	CoderTools,
	dataCoder,
	serializer,
	DataCoder,
	Serializer,
	_Buffer
};
