// index.js

// 监听 fetch 事件，Worker 会在接收到请求时执行此回调
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  /**
   * 处理传入的请求，并代理 WebSocket 连接到目标域名
   * @param {Request} request - 原始请求对象
   * @returns {Promise<Response>} - 处理后的响应对象
   */
  async function handleRequest(request) {
    try {
      // 检查请求是否为 WebSocket 升级请求
      const upgradeHeader = request.headers.get('Upgrade')
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        return new Response('该端点仅处理 WebSocket 连接。', { status: 400 })
      }
  
      // 解析原始请求的 URL，并修改其 hostname 为目标域名
      const url = new URL(request.url)
      // 请替换为你要代理的目标 WebSocket 服务的域名
      url.hostname = 'demo.piesocket.com'
  
      // 构造新的 Request 对象，保持原始请求的所有信息
      const newRequest = new Request(url.toString(), request)
  
      // 发起 fetch 请求，Cloudflare Worker 会自动处理 WebSocket 的升级
      const response = await fetch(newRequest)
      return response
    } catch (err) {
      // 捕获并返回错误信息，便于调试
      return new Response('Error occurred: ' + err.toString(), { status: 500 })
    }
  }
  