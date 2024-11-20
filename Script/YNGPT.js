const $ = new Env('ChatGPT解锁检测');
const TIMEOUT = 3000;

async function test_chatgpt() {
    let panel = {};
    let web = "✗";
    let api = "✗"; 
    let app = "✗";
    let region = "--";
    let warp = "✗";

    try {
        // 检测网页端
        let webResp = await http({
            url: 'https://chat.openai.com',
            timeout: TIMEOUT
        });
        web = webResp.status === 200 ? "✓" : "✗";

        // 检测 API
        let apiResp = await http({
            url: 'https://api.openai.com/v1/models',
            timeout: TIMEOUT
        });
        api = apiResp.status === 200 ? "✓" : "✗";

        // 检测 APP 端
        let appResp = await http({
            url: 'https://ios.chat.openai.com/api/auth/session',
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'ChatGPT-iOS/1.2023.96'
            }
        });
        app = appResp.status === 200 ? "✓" : "✗";

        // 获取地区代码
        let geoResp = await http({
            url: 'https://chat.openai.com/cdn-cgi/trace'
        });
        region = geoResp.body?.match(/loc=([A-Z]+)/)?.[1] || '--';

        // 检测 Warp 状态
        let cloudflareResp = await http({
            url: 'https://chat.openai.com/cdn-cgi/trace' 
        });
        warp = cloudflareResp.body?.includes('warp=on') ? "✓" : "✗";

        // 格式化显示内容,使用换行符分隔
        const content = `ChatGPT 可用性检测
网页版: ${web}
API: ${api}  
移动端: ${app}
地区: ${region}
Warp: ${warp}`;

        // 根据解锁状态设置面板样式
        panel = {
            title: 'ChatGPT 解锁检测',
            content,
            icon: web === "✓" ? 'checkmark.circle' : 'xmark.circle',
            'icon-color': web === "✓" ? '#1B813E' : '#CB1B45', // 成功绿色,失败红色
            backgroundColor: '#1A1B1E' // 深色背景
        };

    } catch (err) {
        // 错误处理
        panel = {
            title: 'ChatGPT 解锁检测',
            content: '检测异常，请刷新重试\n可能是网络问题',
            icon: 'xmark.circle',
            'icon-color': '#CB1B45'
        };
    }

    $done(panel);
}

// HTTP 请求封装
function http(opt) {
    return new Promise((resolve, reject) => {
        $httpClient.get(opt, (err, resp, body) => {
            if (err) reject(err);
            else {
                resp.body = body;
                resolve(resp);
            }
        });
    });
}

test_chatgpt();
