/*
Enhanced ChatGPT Availability Check for Surge Panel
*/

// 辅助函数：安全的 HTTP 请求
function safeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    $httpClient.get({
      url,
      headers,
      timeout: 5000 // 5秒超时
    }, (error, response, data) => {
      if (error) {
        reject(error);
      } else {
        resolve({ response, data });
      }
    });
  });
}

// 主检测函数
async function checkChatGPT() {
  // 开始检测时显示加载状态
  $done({
    title: 'ChatGPT',
    content: '检测中...',
    icon: 'arrow.clockwise', // 添加加载图标
    'icon-color': '#3478F6' // 蓝色图标
  });

  try {
    // 1. 获取地区信息
    let countryCode = 'XX';
    try {
      const { data: traceData } = await safeRequest('https://chat.openai.com/cdn-cgi/trace');
      const locMatch = traceData.match(/loc=([A-Z]{2})/);
      if (locMatch) {
        countryCode = locMatch[1];
      }
    } catch (e) {
      console.log('Trace request failed:', e);
    }

    // 2. API检测
    let platformAvailable = false;
    try {
      const { data: platformData } = await safeRequest('https://api.openai.com/compliance/cookie_requirements', {
        'authority': 'api.openai.com',
        'accept': '*/*',
        'authorization': 'Bearer null'
      });
      platformAvailable = !platformData.includes('unsupported_country');
    } catch (e) {
      console.log('Platform API check failed:', e);
    }

    // 3. WebUI检测
    let webUIAvailable = false;
    try {
      const { data: webData } = await safeRequest('https://ios.chat.openai.com/');
      webUIAvailable = !webData.includes('VPN');
    } catch (e) {
      console.log('WebUI check failed:', e);
    }

    // 状态判断
    let status, icon, iconColor;
    if (!platformAvailable && !webUIAvailable) {
      status = '无法访问';
      icon = 'xmark.circle';
      iconColor = '#D65C51';
    } else if (platformAvailable && webUIAvailable) {
      status = '完全支持';
      icon = 'checkmark.circle';
      iconColor = '#43CD80';
    } else if (platformAvailable) {
      status = '仅API';
      icon = 'bolt.circle';
      iconColor = '#F9A825';
    } else {
      status = '仅WebUI';
      icon = 'globe.americas.fill';
      iconColor = '#3478F6';
    }

    // 更新面板
    $done({
      title: 'ChatGPT',
      content: `${status} ${getCountryFlagEmoji(countryCode)}${countryCode}`,
      icon: icon,
      'icon-color': iconColor
    });

  } catch (error) {
    // 最终的错误处理
    console.log('Final error:', error);
    $done({
      title: 'ChatGPT',
      content: `检测失败 ${getCountryFlagEmoji('XX')}XX`,
      icon: 'exclamationmark.triangle',
      'icon-color': '#D65C51'
    });
  }
}

// 获取国旗Emoji函数
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

// 启动检测
$httpAPI.get = $httpClient.get;
if (typeof $argument === 'undefined') {
  checkChatGPT();
}
