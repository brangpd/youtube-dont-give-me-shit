// ==UserScript==
// @name         屏蔽 YouTube 推荐的中文垃圾视频
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  屏蔽 YouTube 推荐的中文垃圾视频
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const blockedChannelsList = new Set();

  function blockRecommendedContent() {
    // 1. 处理视频页侧栏推荐 (compact-video-renderer)
    const sidebarItems = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer');
    processItems(sidebarItems, 'yt-formatted-string');

    // 2. 处理首页推荐 (rich-item-renderer)
    const homepageItems = document.querySelectorAll('ytd-rich-item-renderer');
    processItems(homepageItems, 'yt-formatted-string');
  }

  function processItems(items, authorSelector) {
    items.forEach(item => {
      const authorElements = item.querySelectorAll(authorSelector);
      let shouldBlock = false;
      authorElements.forEach(el => {
        const text = el.textContent.trim();
        if (blockedChannelsList.has(text)) {
          shouldBlock = true;
          console.log(`屏蔽匹配项: ${text}`);
        }
      });

      if (shouldBlock) {
        item.style.opacity = '0';
        item.style.pointerEvents = 'none';
        item.style.transition = 'opacity 0.3s ease';
        item.title = 'Block!';

        // const marker = document.createElement('div');
        // marker.textContent = 'Block!';
        // marker.style.position = 'absolute';
        // marker.style.background = 'rgba(255,0,0,0.7)';
        // marker.style.color = 'white';
        // marker.style.padding = '2px 5px';
        // marker.style.borderRadius = '3px';
        // marker.style.zIndex = '1000';
        // item.style.position = 'relative';
        // item.appendChild(marker);
      }
    });
  }

  // 初始执行
  blockRecommendedContent();

  // 使用MutationObserver监听内容变化
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(() => {
      blockRecommendedContent();
    });
  });

  const observeTargets = [
    document.querySelector('ytd-watch-next-secondary-results-renderer'),
    document.querySelector('ytd-rich-grid-renderer'),
    document.querySelector('ytd-browse')
  ].filter(Boolean);

  observeTargets.forEach(target => {
    observer.observe(target, {
      childList: true,
      subtree: true
    });
  });

  const debounce = (func, delay) => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(func, delay);
    };
  };

  window.addEventListener('scroll', debounce(blockRecommendedContent, 300), { passive: true });

  document.addEventListener('yt-navigate-finish', blockRecommendedContent);

  // setInterval(blockRecommendedContent, 5000);
})();
