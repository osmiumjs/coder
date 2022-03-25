declare const _Buffer: any;
import * as oTools from '@osmium/tools';
import { CoderTools } from './classes/CoderTools';
import { DataCoder } from './classes/DataCoder';
import { Serializer } from './classes/Serializer';
export { Options } from 'msgpackr/unpack';
declare const dataCoder: DataCoder;
declare const serializer: Serializer;
export { oTools, CoderTools, dataCoder, serializer, DataCoder, Serializer, _Buffer };
declare const _default: {
    oTools: typeof oTools;
    CoderTools: typeof CoderTools;
    dataCoder: DataCoder;
    serializer: Serializer;
    DataCoder: typeof DataCoder;
    Serializer: typeof Serializer;
    _Buffer: any;
};
export default _default;
