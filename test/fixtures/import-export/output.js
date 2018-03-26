// should resolve the path based on the root config
import SubHeader from '../../testproject/src/components/Header/SubHeader';
export { SubHeader2 } from '../../testproject/src/components/Header/SubHeader';
export { something };

// should alias the path
import test from '../../testproject/test';
export { test2 } from '../../testproject/test';

// should not change a relative path
import Utils from './utils';
export { Utils2 } from './utils';

// should handle an empty path
import empty from '';
export { empty2 } from '';

// should only apply the alias once
// babel-core/store should becore babel-core/lib/store, not babel-core/lib/lib/store
import BabelStore from 'babel-core/lib/store';
export { BabelStore2 } from 'babel-core/lib/store';
