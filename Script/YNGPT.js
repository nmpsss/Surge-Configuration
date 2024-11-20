/*
作者：keywos wuhu@wuhu_zzz 整点猫咪 由 claude 修改
自定义icon、iconerr及icon-color，利用argument参数传递，不同参数用&链接
*/

// 处理参数
const params = {};
if (typeof $argument !== 'undefined') {
  $argument.split('&').forEach(item => {
    const [key, value] = item.split('=');
    params[key] = value;
  });
}

// 检测函数
function checkChatGPT() {
  Promise.all([
    // 检测 cookie requirements
    new Promise((resolve) => {
      $httpClient.get({
        url: 'https://api.openai.com/compliance/cookie_requirements',
        headers: {
          'authority': 'api.openai.com',
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://platform.openai.com',
          'referer': 'https://platform.openai.com/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0'
        }
      }, (err, resp, body) => {
        resolve({type: 'cookie', data: body, error: err});
      });
    }),
    
    // 检测 iOS
    new Promise((resolve) => {
      $httpClient.get({
        url: 'https://ios.chat.openai.com/',
        headers: {
          'authority': 'ios.chat.openai.com',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0'
        }
      }, (err, resp, body) => {
        resolve({type: 'ios', data: body, error: err});
      });
    }),
    
    // 获取地区信息
    new Promise((resolve) => {
      $httpClient.get('https://chat.openai.com/cdn-cgi/trace', (err, resp, body) => {
        resolve({type: 'trace', data: body, error: err});
      });
    })
  ]).then(results => {
    const [cookieCheck, iosCheck, traceCheck] = results;
    
    // 解析地区
    let loc = '';
    if (traceCheck.data) {
      const lines = traceCheck.data.split('\n');
      const cf = {};
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if(key) cf[key] = value;
      });
      if(cf.loc) {
        loc = getCountryFlagEmoji(cf.loc) + cf.loc;
      }
    }
    
    // 判断状态
    const hasCookieError = cookieCheck.data && cookieCheck.data.includes('unsupported_country');
    const hasIosError = iosCheck.data && iosCheck.data.includes('VPN');
    
    let status = 'unknown';
    let gpt = 'GPT: ';
    
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
    const iconUsed = status === 'yes' || status === 'web' || status === 'app' ? 
      params.icon : params.iconerr;
    
    const iconColor = status === 'yes' || status === 'web' || status === 'app' ? 
      params['icon-color'] : params['iconerr-color'];

    $done({
      title: params.title || 'ChatGPT',
      content: `${gpt}   区域: ${loc}`,
      icon: iconUsed,
      'icon-color': iconColor
    });
    
  }).catch(() => {
    $done({
      title: params.title || 'ChatGPT',
      content: 'GPT: ❌ 检测失败',
      icon: params.iconerr,
      'icon-color': params['iconerr-color']
    });
  });
}

// 国旗 emoji 函数
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

// 执行检测
checkChatGPT();
