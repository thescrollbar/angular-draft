import { AngularDraftPage } from './app.po';

describe('angular-draft App', () => {
  let page: AngularDraftPage;

  beforeEach(() => {
    page = new AngularDraftPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
