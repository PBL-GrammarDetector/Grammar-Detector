export default async function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 只接受 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // 打印收到的请求体（在 Vercel 日志里可以看到）
        console.log('Request body:', req.body);
        
        // 确保 req.body 存在
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is empty' });
        }
        
        const response = await fetch('https://www.dmxapi.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DMXAPI_KEY}`
            },
            body: JSON.stringify(req.body)
        });
        
        // 检查上游响应状态
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upstream API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `Upstream API error: ${response.status}`,
                details: errorText 
            });
        }
        
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}
