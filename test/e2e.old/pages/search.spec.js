import { loaded } from '../../utils';
import { harness } from '../_utils/_harness';

harness('search page', () => {
  it('should go to searchpage when typing in searchbox', async () => {
    await loaded();

    return app.client
      .element('#globalSearch input')
      .setValue('test')
      .waitForExist('#search-page', 5000);
  });

  it('should have items', async () => {
    await loaded();

    return app.client.waitForExist('.trackWrapper', 5000);
  });
});
