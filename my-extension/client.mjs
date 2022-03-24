import copyPageId from './modules/copyPageId.mjs';
import scrollToTopBtn from './modules/scrollToTop.mjs';
import srs from './modules/srs.mjs';

export default async function ({ web, components, notion }, db) {
  (await db.get(['copy_page_id_btn'])) && copyPageId(web, components, notion);

  scrollToTopBtn(web, components);

  (await db.get(['hide_help_btn'])) &&
    document.body.classList.add('hide-help-btn');

  srs(web, components, notion, db);
}
