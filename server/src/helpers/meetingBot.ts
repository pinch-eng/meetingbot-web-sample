import puppeteer from 'puppeteer';

/**
 * 自动点击加入会议按钮
 */
export async function clickJoinMeetingButton(meetingUrl: string): Promise<void> {
  console.log('启动自动化浏览器...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--use-fake-ui-for-media-stream', '--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置浏览器上下文以允许媒体访问
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost:3000', ['camera', 'microphone']);
    
    // 导航到客户端页面
    await page.goto("http://localhost:3000", {
      waitUntil: "load",
      timeout: 0,
    });
    
    // 设置导航超时
    await page.setDefaultNavigationTimeout(0);
    
    // 输入会议 URL
    await page.type('#meeting_url', meetingUrl);
    
    // 点击加入会议按钮
    await page.click('button');
    
    // 等待 Zoom 会议加载
    await page.waitForSelector('#zmmtg-root', { visible: true, timeout: 30000 });
    
    // 等待加入音频按钮出现并点击
    await page.waitForFunction(
      () => {
        const button = document.querySelector('.join-audio-by-voip__join-btn');
        if (button) {
          (button as HTMLElement).click();
          return true;
        }
        return false;
      },
      { timeout: 30000, polling: 1000 }
    );
    
    console.log('成功加入会议和音频');
    
    // 保持浏览器打开，直到手动关闭
  } catch (error) {
    console.error('自动化过程中出错:', error);
    await browser.close();
  }
}

/**
 * 移除 Chromium 警告
 */
export function removeChromiumAlert(): void {
  try {
    // 这个函数在 Windows 上可能不需要
    console.log('尝试移除 Chromium 警告...');
  } catch (error) {
    console.error('移除 Chromium 警告时出错:', error);
  }
} 