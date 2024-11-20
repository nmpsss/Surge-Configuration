let url = "https://api.openai.com/compliance/cookie_requirements";
let url2 = "https://ios.chat.openai.com";

// 发送 HTTP 请求并在 Promise 中处理
Promise.all([
  $httpClient.get(url),
  $httpClient.get(url2)
]).then(([res1, res2]) => {
  let result1 = res1.data.includes("unsupported_country");
  let result2 = res2.data.includes("VPN");
  let countryCode = "Unknown";
  
  // 获取国家代码
  $httpClient.get("https://chat.openai.com/cdn-cgi/trace", (error, response, data) => {
    if (!error) {
      countryCode = data.match(/loc=([A-Z]+)/)?.[1] || "Unknown";
    }
    
    let gpt, iconUsed, iconCol;
    
    if(!result2 && !result1) {
      // 完全可用
      gpt = "ChatGPT: ✓";
      iconUsed = icon ? icon : undefined;
      iconCol = iconColor ? iconColor : undefined;
    } else if(!result1 && result2) {
      // 仅 Web 可用  
      gpt = "ChatGPT: Web Only";
      iconUsed = icon ? icon : undefined;
      iconCol = iconColor ? iconColor : undefined;
    } else if(result1 && !result2) {
      // 仅 APP 可用
      gpt = "ChatGPT: APP Only";
      iconUsed = icon ? icon : undefined; 
      iconCol = iconColor ? iconColor : undefined;
    } else {
      // 完全不可用
      gpt = "ChatGPT: ✗";
      iconUsed = iconerr ? iconerr : undefined;
      iconCol = iconerrColor ? iconerrColor : undefined;
    }

    // 组装通知数据
    let body = {
      title: titlediy ? titlediy : 'ChatGPT',
      content: `${gpt}   区域: ${countryCode}`,
      icon: iconUsed ? iconUsed : undefined,
      'icon-color': iconCol ? iconCol : undefined
    };

    $done(body);
  });
}).catch((error) => {
  // 处理错误
  let body = {
    title: titlediy ? titlediy : 'ChatGPT', 
    content: "ChatGPT: 检测失败",
    icon: iconerr ? iconerr : undefined,
    'icon-color': iconerrColor ? iconerrColor : undefined
  };
  
  $done(body);
});
