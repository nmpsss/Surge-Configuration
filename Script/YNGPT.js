// 配置项
const config = {
    checkInterval: 300,  // 检测间隔(秒)
    retryAttempts: 3,   // 重试次数 
    timeoutMs: 5000,    // 超时时间(毫秒)
    platforms: {
        web: true,      // 检测网页版
        api: true,      // 检测API
        mobile: true    // 检测移动端
    }
};

// 支持的地区列表
const supportedRegions = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

// 可接受的WARP状态
const validWarpStatus = ["plus", "on"];

// 检测端点
const endpoints = {
    web: "https://chat.openai.com/cdn-cgi/trace",
    api: "https://api.openai.com/v1/models",
    mobile: "https://ios.chat.openai.com/api/auth/session"
};

// 初始化参数
let iconUrl = ' ';
let iconColor = '#157EFB';
let args = {};

// 处理传入参数
if (typeof $argument !== 'undefined') {
    $argument.split('&').forEach(item => {
        const [key, value] = item.split('=');
        args[key] = value;
    });
    
    if (args.icon) iconUrl = args.icon;
    if (args['icon-color']) iconColor = args['icon-color'];
}

// 请求头
const headers = {
    'web': {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    'api': {
        'User-Agent': 'OpenAI/iOS/1.2023.96',
        'Authorization': 'Bearer sk-xxxxxx' // 需要替换为实际的API key
    },
    'mobile': {
        'User-Agent': 'OpenAI/iOS/1.2023.96',
        'X-OpenAI-Client-Platform': 'ios'
    }
};

// 主检测函数
async function checkAvailability() {
    let results = {
        web: { status: false, error: null },
        api: { status: false, error: null },
        mobile: { status: false, error: null },
        location: null,
        warp: null
    };
    
    // 检测函数
    async function makeRequest(platform) {
        return new Promise((resolve) => {
            $httpClient.get({
                url: endpoints[platform],
                headers: headers[platform],
                timeout: config.timeoutMs
            }, function(error, response, data) {
                if (error) {
                    resolve({ success: false, error: error });
                    return;
                }
                
                if (platform === 'web') {
                    try {
                        const lines = data.split('\n');
                        const cfData = {};
                        lines.forEach(line => {
                            const [key, value] = line.split('=');
                            if (key && value) cfData[key.trim()] = value.trim();
                        });
                        
                        results.location = cfData.loc || null;
                        results.warp = cfData.warp || null;
                        resolve({ 
                            success: response.status === 200 && supportedRegions.includes(cfData.loc),
                            data: cfData 
                        });
                    } catch (e) {
                        resolve({ success: false, error: 'Parse Error' });
                    }
                } else {
                    resolve({ success: response.status === 200 });
                }
            });
        });
    }

    // 执行检测
    for (let i = 0; i < config.retryAttempts; i++) {
        if (config.platforms.web) {
            const webResult = await makeRequest('web');
            results.web.status = webResult.success;
            results.web.error = webResult.error;
        }
        
        if (config.platforms.api) {
            const apiResult = await makeRequest('api');
            results.api.status = apiResult.success;
            results.api.error = apiResult.error;
        }
        
        if (config.platforms.mobile) {
            const mobileResult = await makeRequest('mobile');
            results.mobile.status = mobileResult.success;
            results.mobile.error = mobileResult.error;
        }
        
        // 如果所有启用的检测都成功，跳出重试
        if ((!config.platforms.web || results.web.status) &&
            (!config.platforms.api || results.api.status) &&
            (!config.platforms.mobile || results.mobile.status)) {
            break;
        }
    }
    
    return results;
}

// 格式化输出
function formatOutput(results) {
    const status = {
        true: '✓',
        false: '✘'
    };
    
    const isWarpValid = results.warp && validWarpStatus.includes(results.warp);
    
    let content = [];
    if (config.platforms.web) {
        content.push(`网页版: ${status[results.web.status]}`);
    }
    if (config.platforms.api) {
        content.push(`API: ${status[results.api.status]}`);
    }
    if (config.platforms.mobile) {
        content.push(`移动端: ${status[results.mobile.status]}`);
    }
    
    content.push(`地区: ${results.location || 'Unknown'}`);
    content.push(`Warp: ${isWarpValid ? '✓' : '✘'}`);
    
    return {
        title: 'ChatGPT 可用性检测',
        content: content.join('  '),
        icon: iconUrl,
        'icon-color': iconColor
    };
}

// 执行检测并输出结果
(async () => {
    try {
        const results = await checkAvailability();
        const output = formatOutput(results);
        $done(output);
    } catch (error) {
        $done({
            title: 'ChatGPT 检测',
            content: '检测出错: ' + error.message,
            icon: iconUrl,
            'icon-color': iconColor
        });
    }
})();
