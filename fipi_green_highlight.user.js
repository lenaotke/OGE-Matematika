// ==UserScript==
// @name         ФИПИ — зелёная рамка выбранного задания
// @namespace    oge-fipi-offline
// @version      1.1
// @description  На странице ФИПИ находит задание из URL #qXXXXXX и выделяет его зелёной рамкой.
// @match        https://oge.fipi.ru/bank/questions.php*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  'use strict';
  const CLASS = 'oge-fipi-target-highlight';
  const STYLE = 'oge-fipi-target-highlight-style';

  function installStyle() {
    if (document.getElementById(STYLE)) return;
    const style = document.createElement('style');
    style.id = STYLE;
    style.textContent = `
      #${CLASS}, .${CLASS} {
        outline: 5px solid #16a34a !important;
        outline-offset: 6px !important;
        box-shadow: 0 0 0 10px rgba(22,163,74,.22) !important;
        border-radius: 10px !important;
        background-color: rgba(220,252,231,.32) !important;
        position: relative !important;
        z-index: 1000 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function wanted() {
    const raw = decodeURIComponent(location.hash || '').replace(/^#/, '');
    return raw.replace(/^q/i, '').toUpperCase();
  }

  function findTask() {
    const id = wanted();
    if (!id) return null;
    // Normal FIPI block: <div id="q37EB4D">.
    let node = document.getElementById('q' + id);
    if (node) return node;
    node = document.getElementById(id);
    if (node) return node;
    // Fallback: find the task status row containing the visible FIPI number.
    const nodes = Array.from(document.querySelectorAll('[id], .task-status, .id-text, .qblock'));
    const marker = new RegExp('(?:Номер|номер)\\s*:\\s*' + id + '\\b', 'i');
    for (const item of nodes) {
      if (marker.test(item.textContent || '')) return item.closest('.qblock') || item;
    }
    return null;
  }

  function highlight() {
    installStyle();
    document.querySelectorAll('.' + CLASS).forEach(x => x.classList.remove(CLASS));
    const node = findTask();
    if (!node) return false;
    node.classList.add(CLASS);
    try { node.scrollIntoView({behavior: 'smooth', block: 'center'}); } catch (_) { node.scrollIntoView(); }
    return true;
  }

  function start() {
    installStyle();
    let attempts = 0;
    const timer = setInterval(() => {
      if (highlight() || ++attempts >= 120) clearInterval(timer);
    }, 250);
    new MutationObserver(() => { if (findTask()) highlight(); })
      .observe(document.documentElement, {childList: true, subtree: true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('hashchange', highlight);
})();
