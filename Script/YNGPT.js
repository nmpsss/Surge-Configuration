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
            timeout: TIMEOUT
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

        // 使用数组存储检测结果
        let result = [];
        result.push(`网页版: ${web}`);
        result.push(`API: ${api}`);
        result.push(`移动端: ${app}`);
        result.push(`地区: ${region}`);
        result.push(`Warp: ${warp}`);

        panel = {
            title: 'ChatGPT 解锁检测',
            content: result.join('\n'),
            icon: web === "✓" ? 'checkmark.circle' : 'xmark.circle',
            'icon-color': web === "✓" ? '#1B813E' : '#CB1B45'
        };

    } catch (err) {
        panel = {
            title: 'ChatGPT 解锁检测',
            content: ['检测异常', '请刷新重试'].join('\n'),
            icon: 'xmark.circle',
            'icon-color': '#CB1B45'
        };
    }

    $done(panel);
}

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
