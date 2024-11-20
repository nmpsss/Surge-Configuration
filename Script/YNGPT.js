const web_url = "https://chat.openai.com/";
const api_url = "https://ios.chat.openai.com/";

let result = {
    title: "ChatGPT 解锁检测",
    content: "检测中...",
    icon: "ellipsis.circle",
    "icon-color": "#9A7FF7"
};

(async () => {
    try {
        let webCheck = await checkWeb();
        let apiCheck = await checkApi();
        
        let content = [];
        content.push(`网页版: ${webCheck ? "✅" : "❌"}`);
        content.push(`APP版: ${apiCheck ? "✅" : "❌"}`);
        
        result.content = content.join("\n");
        result.icon = (webCheck || apiCheck) ? "checkmark.circle" : "xmark.circle";
        result["icon-color"] = (webCheck || apiCheck) ? "#1B9F3E" : "#CB1B45";
        
    } catch (err) {
        result.content = "检测失败，请重试";
        result.icon = "xmark.circle";
        result["icon-color"] = "#CB1B45";
    }
    $done(result);
})();

async function checkWeb() {
    try {
        let resp = await fetch(web_url);
        return resp.status === 200;
    } catch (err) {
        return false;
    }
}

async function checkApi() {
    try {
        let resp = await fetch(api_url);
        let data = await resp.json();
        return data.cf_details === "Request is not allowed. Please try again later." && data.type === "dc";
    } catch (err) {
        return false;
    }
}

function fetch(url) {
    return new Promise((resolve, reject) => {
        $httpClient.get(url, (err, resp, data) => {
            if (err) reject(err);
            else resolve({
                status: resp.status,
                json() { return JSON.parse(data) }
            });
        });
    });
}
