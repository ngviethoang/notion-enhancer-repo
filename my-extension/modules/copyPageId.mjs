export default async function copyPageId(web, components, notion) {
  const blockActionSelector =
      '.notion-overlay-container .notion-scroller.vertical .notion-focusable > div > div > [style*="text-overflow: ellipsis;"]',
    hoveredActionSelector =
      '.notion-overlay-container .notion-scroller.vertical .notion-focusable[style*="background:"]',
    blockCopyClass = 'my_extension--block_button';

  const $blockCopyTemplate = web.html`
    <div class="${blockCopyClass}" role="button" tabindex="0">
      ${await components.feather('copy')}
      <span>Copy ID</span>
    </div>`;

  const getLinkButtons = () =>
      [...document.querySelectorAll(blockActionSelector)]
        .filter(($action) => ['Copy link'].includes($action.textContent))
        .map(($action) => $action.closest('.notion-focusable')),
    insertBlockCopy = () => {
      const $btns = getLinkButtons();
      $btns.forEach(($btn) => {
        if (
          !$btn.previousElementSibling?.classList?.contains?.(blockCopyClass)
        ) {
          const $copy = $blockCopyTemplate.cloneNode(true);
          $btn.before($copy);

          $copy.addEventListener('mouseover', () => {
            document
              .querySelectorAll(hoveredActionSelector)
              .forEach(($action) => {
                $action.style.background = '';
              });
          });

          $copy.addEventListener('click', async () => {
            $btn.click();
            const id = notion.getPageID().replace(/-/g, '');
            web.copyToClipboard(id);
          });
        }
      });
    };
  insertBlockCopy();
  web.addDocumentObserver(insertBlockCopy, [blockActionSelector]);
}
