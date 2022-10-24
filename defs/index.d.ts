declare const _Buffer: any;
import { CoderTools } from './classes/CoderTools';
import { DataCoder } from './classes/DataCoder';
import { Serializer } from './classes/Serializer';
export { Options } from 'msgpackr/unpack';
declare const dataCoder: DataCoder;
declare const serializer: Serializer;
export { CoderTools, dataCoder, serializer, DataCoder, Serializer, _Buffer };
declare const _default: {
    CoderTools: typeof CoderTools;
    dataCoder: DataCoder;
    serializer: Serializer;
    DataCoder: typeof DataCoder;
    Serializer: typeof Serializer;
    _Buffer: any;
};
export default _default;
