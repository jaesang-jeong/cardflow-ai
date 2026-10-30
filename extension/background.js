// CardFlow AI Background Service Worker

// Enable side panel on extension action click (Chrome 116+)
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((e) => {
    console.log('Sidepanel behavior notice:', e);
  });
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'create-card-news',
    title: 'CardFlow: 이 기사로 카드뉴스 만들기',
    contexts: ['page', 'selection', 'link']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-card-news' && tab?.id) {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
  }
});
