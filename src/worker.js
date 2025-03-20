export default {
    async fetch(request, env) {
      const upgradeHeader = request.headers.get('Upgrade');
      
      // WebSocket代理处理
      if (upgradeHeader === 'websocket') {
        return handleWebSocket(request, env);
      }
  
      // HTTP请求响应
      return new Response(
        `WS Proxy Worker (Dev Mode)\nTarget: ${env.TARGET_WS}`,
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }
  };
  
  async function handleWebSocket(request, env) {
    try {
      // 构造代理URL
      const proxyUrl = new URL(env.TARGET_WS);
      const clientUrl = new URL(request.url);
      
      // 合并路径（示例：将dev域名的路径传递给目标）
      proxyUrl.pathname = clientUrl.pathname;
  
      // 创建代理请求
      return fetch(proxyUrl, {
        headers: request.headers,
        method: request.method,
        body: request.body,
        redirect: 'manual',
        webSocket: request.webSocket
      });
    } catch (err) {
      console.error(`WS Proxy Error: ${err}`);
      return new Response('WebSocket proxy error', { status: 502 });
    }
  }