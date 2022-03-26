import { NotionApi } from './notionApi.mjs';

export default async function srs(web, components, notion, db) {
  const topbarShareSelector =
      '.notion-app-inner .notion-peek-renderer .notion-topbar-share-menu',
    topbarBtnClass = 'my_extension--topbar-btn',
    hiddenClass = 'my-extension--hidden';

  const notionApiKey = await db.get(['notion_key']);
  const corsProxy = await db.get(['cors_proxy']);
  let srsDatabaseIds = await db.get(['srs_ids']);
  srsDatabaseIds = srsDatabaseIds.split(',');

  const notionApi = new NotionApi(notionApiKey, corsProxy);

  const isInvalidPage = (page) => {
    const databaseId = page.parent.database_id.replace(/-/g, '');
    console.log(srsDatabaseIds, databaseId);
    return !srsDatabaseIds.includes(databaseId);
  };

  const srsBtns = [
    {
      type: 'reset',
      icon: 'trending-down',
      title: 'Forgot',
      callback: async () => {
        const pageId = notion.getPageID().replace(/-/g, '');
        const page = await notionApi.getPage(pageId);
        console.log(page);
        if (isInvalidPage(page)) return;

        const response = await notionApi.updatePage(pageId, {
          Level: {
            select: {
              name: '1',
            },
          },
          'Last Revised': {
            date: {
              start: new Date().toISOString().substring(0, 10),
            },
          },
        });
        console.log(response);
      },
    },
    {
      type: 'next',
      icon: 'trending-up',
      title: 'Next',
      callback: async () => {
        const pageId = notion.getPageID().replace(/-/g, '');
        const page = await notionApi.getPage(pageId);
        console.log(page);
        if (isInvalidPage(page)) return;

        let nextLevel = parseInt(page.properties.Level.select?.name || 0);
        nextLevel < 10 && nextLevel++;

        const response = await notionApi.updatePage(pageId, {
          Level: {
            select: {
              name: nextLevel + '',
            },
          },
          'Last Revised': {
            date: {
              start: new Date().toISOString().substring(0, 10),
            },
          },
        });
        console.log(response);
      },
    },
  ];

  const insertTopbarBtns = async () => {
    const $btns = document.querySelectorAll(topbarShareSelector);
    $btns.forEach(($btn) => {
      if (!$btn.previousElementSibling?.classList?.contains?.(topbarBtnClass)) {
        srsBtns.forEach(async (btn) => {
          const $topbarBtnTemplate = web.render(
            web.html`<div class="${topbarBtnClass}" data-type="${btn.type}" role="button" tabindex="0"></div>`,
            web.html`
              ${btn.icon && (await components.feather(btn.icon))}
              <span data-title>${btn.title}</span>
              <span data-loading class="${hiddenClass}">...</span>
            `
          );
          const $srsBtn = $topbarBtnTemplate.cloneNode(true);
          $btn.before($srsBtn);

          $srsBtn.addEventListener('click', async () => {
            const $title = $srsBtn.querySelector(`[data-title]`),
              $loading = $srsBtn.querySelector('[data-loading]');
            $title.classList.add(hiddenClass);
            $loading.classList.remove(hiddenClass);

            // update db
            try {
              await btn.callback();
            } catch (error) {
              console.error(error);
            }

            $title.classList.remove(hiddenClass);
            $loading.classList.add(hiddenClass);
          });
        });
      }
    });
  };
  insertTopbarBtns();
  web.addDocumentObserver(insertTopbarBtns, [topbarShareSelector]);
}
