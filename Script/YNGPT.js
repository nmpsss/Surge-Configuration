/*
Enhanced ChatGPT Availability Check for Surge Panel
*/

const URLS = {
  PLATFORM_API: 'https://api.openai.com/compliance/cookie_requirements',
  IOS_CHAT: 'https://ios.chat.openai.com/',
  CDN_TRACE: 'https://chat.openai.com/cdn-cgi/trace'
};

const HEADERS = {
  PLATFORM: {
    'authority': 'api.openai.com',
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'authorization': 'Bearer null',
    'content-type': 'application/json',
    'origin': 'https://platform.openai.com',
    'referer': 'https://platform.openai.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  },
  IOS: {
    'authority': 'ios.chat.openai.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'zh-CN,zh;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  }
};

// 检测ChatGPT可用性
async function checkChatGPT() {
  try {
    // 获取地区信息
    const traceResponse = await $httpClient.get(URLS.CDN_TRACE);
    const countryCode = traceResponse.data.split('\n')
      .find(line => line.startsWith('loc='))
      ?.split('=')[1] || 'XX';

    // 检测平台API
    const platformResponse = await $httpClient.get({
      url: URLS.PLATFORM_API,
      headers: HEADERS.PLATFORM
    });

    // 检测iOS客户端
    const iosResponse = await $httpClient.get({
      url: URLS.IOS_CHAT,
      headers: HEADERS.IOS
    });

    // 解析检测结果
    const hasUnsupportedCountry = platformResponse.data.includes('unsupported_country');
    const hasVPNMessage = iosResponse.data.includes('VPN');

    let statusEmoji, statusText;
    
    if (!hasVPNMessage && !hasUnsupportedCountry) {
      statusEmoji = '✓';
      statusText = '完全支持';
    } else if (!hasUnsupportedCountry && hasVPNMessage) {
      statusEmoji = '❖';
      statusText = '网页可用';
    } else if (hasUnsupportedCountry && !hasVPNMessage) {
      statusEmoji = '⚡';
      statusText = 'API可用';
    } else {
      statusEmoji = '×';
      statusText = '不可用';
    }

    updatePanel(statusEmoji, statusText, countryCode);
  } catch (error) {
    console.error(error);
    updatePanel('!', '检测失败', 'XX');
  }
}

// 更新面板显示
function updatePanel(statusEmoji, statusText, countryCode) {
  let body = {
    title: 'ChatGPT',
    content: `${statusEmoji} ${statusText}   ${getCountryFlagEmoji(countryCode)}${countryCode}`
  };

  $done(body);
}

//获取国旗Emoji函数
function getCountryFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == 'TW') {
    countryCode = 'CN';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

// 开始检测
checkChatGPT();
