const $ = new Env('ChatGPT解锁检测');
const TIMEOUT = 3000;

(async () => {
  let panel_result = {
    title: 'ChatGPT解锁检测',
    content: '',
    icon: 'checkmark.circle'
  }

  let result = []
  
  try {
    // 检测网页端
    let web = await new Promise((resolve) => {
      $httpClient.get({
        url: 'https://chat.openai.com',
        timeout: TIMEOUT
      }, function (error, response, data) {
        if (error || response.status !== 200) {
          resolve('未解锁')
        } else {
          resolve('已解锁')
        }
      })
    })
    result.push(`Web: ${web}`)

    // 检测移动端
    let app = await new Promise((resolve) => {
      $httpClient.get({
        url: 'https://ios.chat.openai.com/',
        timeout: TIMEOUT
      }, function (error, response, data) {
        if (error) {
          resolve('检测失败')
          return
        }
        try {
          if (response.status === 403 && JSON.parse(data).cf_details === "Request is not allowed. Please try again later.") {
            resolve('已解锁')
          } else {
            resolve('未解锁')
          }
        } catch (e) {
          resolve('未解锁')
        }
      })
    })
    result.push(`APP: ${app}`)

    // 获取地区
    let region = await new Promise((resolve) => {
      $httpClient.get({
        url: 'https://chat.openai.com/cdn-cgi/trace',
        timeout: TIMEOUT
      }, function (error, response, data) {
        if (error) {
          resolve('检测失败')
          return
        }
        let region = data?.match(/loc=([A-Z]+)/)?.[1] || '--'
        resolve(`地区: ${region}`)
      })
    })
    result.push(region)
    
    panel_result.content = result.join('\n')
    
  } catch (err) {
    panel_result.content = '检测异常，请刷新重试'
  }
  
  $done(panel_result)
})()
