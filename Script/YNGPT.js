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

        const lines = [
            "ChatGPT 解锁检测",
            `网页版：${web}`,
            `API：${api}`,
            `移动端：${app}`,
            `地区：${region}`,
            `Warp：${warp}`
        ];

        panel = {
            title: "ChatGPT 解锁检测",
            content: lines.join("\n"),
            icon: web === "✓" ? 'checkmark.circle' : 'xmark.circle',
            'icon-color': web === "✓" ? '#1B813E' : '#CB1B45',
            backgroundColor: '#1A1B1E'
        };

    } catch (err) {
        panel = {
            title: "ChatGPT 解锁检测",
            content: "检测异常\n请刷新重试",
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
