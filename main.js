// ==UserScript==
// @name         YouTube 铲屎官
// @namespace    http://tampermonkey.net/
// @version      0.0
// @description  屏蔽 YouTube 主页、视频页推荐的中文垃圾
// @author       Brang Pakdring
// @license      AGPL-3.0-only
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js
// @updateURL    https://github.com/brangpd/youtube-dont-give-me-shit/releases/latest/download/main.user.js
// @downloadURL  https://github.com/brangpd/youtube-dont-give-me-shit/releases/latest/download/main.user.js
// ==/UserScript==

(function () {
  'use strict';

  function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  const blockedChannelsList = new Set();
  const sensitiveWordsList = new Set();
  for (const word of structuredClone(sensitiveWordsList)) {
    sensitiveWordsList.delete(word);
    sensitiveWordsList.add(b64DecodeUnicode(word));
  }

  function blockRecommendedContent() {
    // 1. 处理视频页侧栏推荐 (compact-video-renderer)
    const sidebarItems = document.querySelectorAll('ytd-compact-video-renderer:not(.ytdgms-processed)');
    processItems(sidebarItems, 'yt-formatted-string.ytd-channel-name', 'h3');
    // 这两种侧栏会随机出现，机制暂时不明。
    const sidebarItems2 = document.querySelectorAll('yt-lockup-view-model:not(.ytdgms-processed)');
    processItems(sidebarItems2, 'div.yt-content-metadata-view-model-wiz__metadata-row', 'a.yt-lockup-metadata-view-model-wiz__title');

    // 2. 处理首页推荐 (rich-item-renderer)
    const homepageItems = document.querySelectorAll('ytd-rich-item-renderer:not(.ytdgms-processed)');
    // 长视频
    processItems(homepageItems, 'yt-formatted-string', 'yt-formatted-string#video-title');
    processItems(homepageItems, 'yt-core-attributed-string', '.yt-lockup-metadata-view-model__title');
    // 短视频
    processItems(homepageItems, '', 'h3.shortsLockupViewModelHostMetadataTitle.shortsLockupViewModelHostOutsideMetadataTitle');
  }

  function clearBlock() {
    const sidebarItems = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer.ytdgms-processed')
    for (const item of sidebarItems) {
      item.classList.remove('ytdgms-processed');
    }
    const homepageItems = document.querySelectorAll('ytd-rich-item-renderer.ytdgms-processed');
    for (const item of homepageItems) {
      item.classList.remove('ytdgms-processed');
    }
  }

  function processItems(items, authorSelector, titleSelector) {
    items.forEach(item => {
      item.classList.add('ytdgms-processed');

      let shouldBlock = false;
      if (authorSelector) {
        const authorElements = item.querySelectorAll(authorSelector);
        authorElements.forEach(el => {
          if (shouldBlock) return;
          const text = el.textContent.trim();
          if (blockedChannelsList.has(md5(text))) {
            shouldBlock = true;
            console.log(`屏蔽匹配项(频道): ${text}`);
          }
        });
      }

      if (titleSelector) {
        if (!shouldBlock) {
          const titleElement = item.querySelector(titleSelector);
          if (titleElement) {
            const titleText = titleElement.textContent.trim();
            for (const word of sensitiveWordsList) {
              if (titleText.includes(word)) {
                shouldBlock = true;
                console.log(`屏蔽匹配项(标题): ${word} - ${titleText}`);
                break;
              }
            }
          }
        }
      }

      if (shouldBlock) {
        item.style.display = 'none';
        // item.style.opacity = '0';
        // item.style.pointerEvents = 'none';
        // item.style.transition = 'opacity 0.05s ease';
        // item.title = 'Block!';

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
  document.addEventListener('yt-navigate-start', clearBlock);

  setInterval(blockRecommendedContent, 1000);
})();
