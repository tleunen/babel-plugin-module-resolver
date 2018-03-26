// should resolve the path based on the root config
import SubHeader from 'components/Header/SubHeader';
export { SubHeader2 } from 'components/Header/SubHeader';
export { something };

// should alias the path
import test from 'test';
export { test2 } from 'test';

// should not change a relative path
import Utils from './utils';
export { Utils2 } from './utils';

// should handle an empty path
import empty from '';
export { empty2 } from '';

// should only apply the alias once
// babel-core/store should becore babel-core/lib/store, not babel-core/lib/lib/store
import BabelStore from 'babel-core/store';
export { BabelStore2 } from 'babel-core/store';
