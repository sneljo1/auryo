import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { harness } from './_utils/_harness';
import { loaded } from '../utils';

chai.should();
chai.use(chaiAsPromised);

// harness("app", () => {
//     it('should load react', () => {
//         return app.client
//             .waitForExist('.auryo', 5000)
//     });
// })
