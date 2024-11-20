console.log('Received argument:', $argument);

// 确保 $argument 是有效字符串并使用 reduce 模拟 Object.fromEntries
const params = ($argument && typeof $argument === 'string') 
  ? $argument.split('&').reduce((acc, item) => {
      const [key, value] = item.split('=');
      acc[key] = value;
      return acc;
  }, {})
  : {};

console.log('Params:', JSON.stringify(params));

console.log('Starting script with params:', JSON.stringify(params));

function getCountryFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == 'TW') countryCode = 'CN';
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt()));
}

function safeJsonParse(str) {
  try {
    return typeof str === 'string' ? JSON.parse(str) : str;
  } catch (e) {
    console.log('JSON Parse Error:', e.message);
    return null;
  }
}

console.log('Making first request to OpenAI API...');

$httpClient.get({
  url: 'https://api.openai.com/compliance/cookie_requirements',
  headers: {
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0'
  }
}, (err1, resp1, body1) => {
  console.log('First request completed');
  console.log('Error 1:', err1);
  console.log('Response 1 status:', resp1?.status);
  console.log('Body 1:', JSON.stringify(body1));
  
  body1 = safeJsonParse(body1);
  console.log('Parsed body 1:', JSON.stringify(body1));
  
  console.log('Making second request to iOS endpoint...');
  
  $httpClient.get({
    url: 'https://ios.chat.openai.com/',
    headers: {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0'
    }
  }, (err2, resp2, body2) => {
    console.log('Second request completed');
    console.log('Error 2:', err2);
    console.log('Response 2 status:', resp2?.status);
    console.log('Body 2:', body2 ? body2.substring(0, 100) + '...' : null);
    
    console.log('Making third request to trace endpoint...');
    
    $httpClient.get({
      url: 'https://chat.openai.com/cdn-cgi/trace'
    }, (err3, resp3, body3) => {
      console.log('Third request completed');
      console.log('Error 3:', err3);
      console.log('Response 3 status:', resp3?.status);
      console.log('Body 3:', body3);
      
      let loc = '';
      
      try {
        console.log('Processing trace data...');
        if (body3) {
          const cf = {};
          body3.split('\n').forEach(line => {
            if (line) {
              const parts = line.split('=');
              if(parts[0]) cf[parts[0]] = parts[1];
            }
          });
          console.log('Parsed CF data:', JSON.stringify(cf));
          if(cf.loc) loc = getCountryFlagEmoji(cf.loc) + cf.loc;
        }

        console.log('Checking errors...');
        const hasCookieError = err1 || (typeof body1 === 'object' && body1 !== null && body1.error && body1.error.includes('unsupported_country'));
        const hasIosError = err2 || (body2 && body2.includes('VPN'));
        
        console.log('Cookie error:', hasCookieError);
        console.log('iOS error:', hasIosError);
        
        let status = 'bad';
        let gpt = 'GPT: ';
        
        if (!hasCookieError && !hasIosError) {
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
          gpt += '❓';
        }

        console.log('Status:', status);
        console.log('GPT:', gpt);

        const iconUsed = (status === 'yes' || status === 'web' || status === 'app') ? 
          params.icon : params.iconerr;
        
        const iconColor = (status === 'yes' || status === 'web' || status === 'app') ? 
          params['icon-color'] : params['iconerr-color'];

        console.log('Final response:', JSON.stringify({
          title: params.title || 'ChatGPT',
          content: `${gpt}   区域: ${loc || '未知'}`,
          icon: iconUsed,
          'icon-color': iconColor
        }));

        $done({
          title: params.title || 'ChatGPT',
          content: `${gpt}   区域: ${loc || '未知'}`,
          icon: iconUsed,
          'icon-color': iconColor
        });

      } catch (e) {
        console.log('Error in processing:', e.message);
        console.log('Error stack:', e.stack);
        
        $done({
          title: params.title || 'ChatGPT',
          content: 'GPT: ❌ 检测失败',
          icon: params.iconerr,
          'icon-color': params['iconerr-color']
        });
      }
    });
  });
});
