const _Buffer = require('buffer').Buffer;

import * as oTools from '@osmium/tools';
import {CoderTools} from './classes/CoderTools';
import {DataCoder} from './classes/DataCoder';
import {Serializer} from './classes/Serializer';

export {Options} from 'msgpackr/unpack';

const dataCoder = new DataCoder();
const serializer = new Serializer(dataCoder);

export {
	oTools,
	CoderTools,
	dataCoder,
	serializer,
	DataCoder,
	Serializer,
	_Buffer
};

export default {
	oTools,
	CoderTools,
	dataCoder,
	serializer,
	DataCoder,
	Serializer,
	_Buffer
};
