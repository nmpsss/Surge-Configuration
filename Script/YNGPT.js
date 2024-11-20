const url = "https://chat.openai.com/cdn-cgi/trace";

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

function notify(status, countryCode, icon = null, color = null) {
  $done({
    title: 'ChatGPT',
    content: `${status} ${getCountryFlagEmoji(countryCode)}${countryCode}`,
    icon: icon,
    'icon-color': color
  });
}

$httpClient.get({
  url: url,
  timeout: 5000
}, function(error, response, data) {
  if (error) {
    notify('检测失败', 'XX', 'exclamationmark.triangle', '#D65C51');
    return;
  }

  let countryCode = 'XX';
  try {
    countryCode = data.split('\n')
      .find(line => line.startsWith('loc='))
      ?.split('=')[1] || 'XX';
  } catch (e) {
    console.log('Parse error:', e);
  }

  // 检测 API
  $httpClient.get({
    url: 'https://api.openai.com/compliance/cookie_requirements',
    headers: {
      'accept': '*/*',
      'authorization': 'Bearer null'
    },
    timeout: 5000
  }, function(error1, response1, data1) {
    // 检测 WebUI
    $httpClient.get({
      url: 'https://ios.chat.openai.com/',
      timeout: 5000
    }, function(error2, response2, data2) {
      let apiAvailable = !error1 && !data1?.includes('unsupported_country');
      let webAvailable = !error2 && !data2?.includes('VPN');

      if (apiAvailable && webAvailable) {
        notify('完全支持', countryCode, 'checkmark.circle', '#43CD80');
      } else if (apiAvailable) {
        notify('仅API', countryCode, 'bolt.circle', '#F9A825');
      } else if (webAvailable) {
        notify('仅WebUI', countryCode, 'globe.americas.fill', '#3478F6');
      } else {
        notify('无法访问', countryCode, 'xmark.circle', '#D65C51');
      }
    });
  });
});
