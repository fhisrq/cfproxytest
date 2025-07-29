export interface Env {
  ENDPOINT_HOST: string;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      // 检查是否为WebSocket升级请求
      const upgradeHeader = request.headers.get('Upgrade');
      // if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      //   return new Response('该端点仅处理 WebSocket 连接。', { status: 400 });
      // }

      // 解析请求URL并替换目标主机
      const url = new URL(request.url);
      url.hostname = env.ENDPOINT_HOST;  // 使用环境变量中的目标主机

      // 创建新请求对象
      const newRequest = new Request(url.toString(), {
        headers: request.headers,
        method: request.method,
        body: request.body,
        redirect: 'follow'
      });

      // 转发请求并返回响应
      return await fetch(newRequest);
    } catch (err) {
      // 错误处理
      return new Response('Error occurred: ' + err.toString(), { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;