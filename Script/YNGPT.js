let titlediy, icon, iconerr, iconColor, iconerrColor;
if (typeof $argument !== 'undefined') {
  const args = $argument.split('&');
  for (let i = 0; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key === 'title') {
      titlediy = value;
    } else if (key === 'icon') {
      icon = value;
    } else if (key === 'iconerr') {
      iconerr = value;
    } else if (key === 'icon-color') {
      iconColor = value;
    } else if (key === 'iconerr-color') {
      iconerrColor = value;
    }
  }
}

// 定义检测用的URL和Headers
const API_CHECK = {
  cookie: {
    url: 'https://api.openai.com/compliance/cookie_requirements',
    headers: {
      'authority': 'api.openai.com',
      'accept': '*/*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'authorization': 'Bearer null',
      'content-type': 'application/json',
      'origin': 'https://platform.openai.com',
      'referer': 'https://platform.openai.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
    }
  },
  ios: {
    url: 'https://ios.chat.openai.com/',
    headers: {
      'authority': 'ios.chat.openai.com',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
    }
  },
  trace: {
    url: 'https://chat.openai.com/cdn-cgi/trace'
  }
};

// 并发执行多个请求
Promise.all([
  new Promise((resolve, reject) => {
    $httpClient.get({
      url: API_CHECK.cookie.url,
      headers: API_CHECK.cookie.headers
    }, (error, response, data) => {
      resolve({ type: 'cookie', error, response, data });
    });
  }),
  new Promise((resolve, reject) => {
    $httpClient.get({
      url: API_CHECK.ios.url,
      headers: API_CHECK.ios.headers
    }, (error, response, data) => {
      resolve({ type: 'ios', error, response, data });
    });
  }),
  new Promise((resolve, reject) => {
    $httpClient.get(API_CHECK.trace.url, (error, response, data) => {
      resolve({ type: 'trace', error, response, data });
    });
  })
]).then(results => {
  const cookieCheck = results[0];
  const iosCheck = results[1];
  const traceCheck = results[2];

  // 解析位置信息
  let loc = '';
  if (!traceCheck.error && traceCheck.data) {
    const lines = traceCheck.data.split("\n");
    const cf = lines.reduce((acc, line) => {
      let [key, value] = line.split("=");
      acc[key] = value;
      return acc;
    }, {});
    loc = getCountryFlagEmoji(cf.loc) + cf.loc;
  }

  // 检查解锁状态
  let status = 'unknown';
  let gpt = 'GPT: ';
  
  const hasCookieError = cookieCheck.data && cookieCheck.data.includes('unsupported_country');
  const hasIosError = iosCheck.data && iosCheck.data.includes('VPN');
  
  if (!hasCookieError && !hasIosError && !cookieCheck.error && !iosCheck.error) {
    status = 'yes';
    gpt += '✔️';
  } else if (hasCookieError && hasIosError) {
    status = 'no';
    gpt += '✖️';
  } else if (!hasCookieError && hasIosError) {
    status = 'web';
    gpt += '🌐';
  } else if (hasCookieError && !hasIosError) {
    status = 'app';
    gpt += '📱';
  } else {
    status = 'bad';
    gpt += '❓';
  }

  // 设置图标
  let iconUsed = status === 'yes' || status === 'web' || status === 'app' ? 
    (icon || undefined) : 
    (iconerr || undefined);
  
  let iconCol = status === 'yes' || status === 'web' || status === 'app' ? 
    (iconColor || undefined) : 
    (iconerrColor || undefined);

  // 发送通知
  $done({
    title: titlediy ? titlediy : 'ChatGPT',
    content: `${gpt}   区域: ${loc}`,
    icon: iconUsed,
    'icon-color': iconCol
  });
}).catch(error => {
  $done({
    title: titlediy ? titlediy : 'ChatGPT',
    content: 'GPT: ❌ 检测失败',
    icon: iconerr,
    'icon-color': iconerrColor
  });
});

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
