1 // Website you intended to retrieve for users.
2 const upstream = 'demo.piesocket.com'
3 
4 // Custom pathname for the upstream website.
5 const upstream_path = '/'
6 
7 // Website you intended to retrieve for users using mobile devices.
8 const upstream_mobile = 'demo.piesocket.com'
9 
10 // Countries and regions where you wish to suspend your service.
11 const blocked_region = ['KP', 'SY', 'PK', 'CU']
12 
13 // IP addresses which you wish to block from using your service.
14 const blocked_ip_address = ['0.0.0.0', '127.0.0.1']
15 
16 // Whether to use HTTPS protocol for upstream address.
17 const https = false
18 
19 // Whether to disable cache.
20 const disable_cache = false
21 
22 // Replace texts.
23 const replace_dict = {
24     '$upstream': '$custom_domain',
25     '//demo.piesocket.com': ''
26 }
27 
28 addEventListener('fetch', event => {
29     event.respondWith(fetchAndApply(event.request));
30 })
31 
32 async function fetchAndApply(request) {
33     const region = request.headers.get('cf-ipcountry').toUpperCase();
34     const ip_address = request.headers.get('cf-connecting-ip');
35     const user_agent = request.headers.get('user-agent');
36 
37     let response = null;
38     let url = new URL(request.url);
39     let url_hostname = url.hostname;
40 
41     if (https == true) {
42         url.protocol = 'https:';
43     } else {
44         url.protocol = 'http:';
45     }
46 
47     if (await device_status(user_agent)) {
48         var upstream_domain = upstream;
49     } else {
50         var upstream_domain = upstream_mobile;
51     }
52 
53     url.host = upstream_domain;
54     if (url.pathname == '/') {
55         url.pathname = upstream_path;
56     } else {
57         url.pathname = upstream_path + url.pathname;
58     }
59 
60     if (blocked_region.includes(region)) {
61         response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
62             status: 403
63         });
64     } else if (blocked_ip_address.includes(ip_address)) {
65         response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
66             status: 403
67         });
68     } else {
69         let method = request.method;
70         let request_headers = request.headers;
71         let new_request_headers = new Headers(request_headers);
72 
73         new_request_headers.set('Host', upstream_domain);
74         new_request_headers.set('Referer', url.protocol + '//' + url_hostname);
75 
76         let original_response = await fetch(url.href, {
77             method: method,
78             headers: new_request_headers
79         })
80 
81         connection_upgrade = new_request_headers.get("Upgrade");
82         if (connection_upgrade && connection_upgrade.toLowerCase() == "websocket") {
83             return original_response;
84         }
85 
86         let original_response_clone = original_response.clone();
87         let original_text = null;
88         let response_headers = original_response.headers;
89         let new_response_headers = new Headers(response_headers);
90         let status = original_response.status;
91         
92         if (disable_cache) {
93             new_response_headers.set('Cache-Control', 'no-store');
94         }
95 
96         new_response_headers.set('access-control-allow-origin', '*');
97         new_response_headers.set('access-control-allow-credentials', true);
98         new_response_headers.delete('content-security-policy');
99         new_response_headers.delete('content-security-policy-report-only');
100         new_response_headers.delete('clear-site-data');
101         
102         if (new_response_headers.get("x-pjax-url")) {
103             new_response_headers.set("x-pjax-url", response_headers.get("x-pjax-url").replace("//" + upstream_domain, "//" + url_hostname));
104         }
105         
106         const content_type = new_response_headers.get('content-type');
107         if (content_type != null && content_type.includes('text/html') && content_type.includes('UTF-8')) {
108             original_text = await replace_response_text(original_response_clone, upstream_domain, url_hostname);
109         } else {
110             original_text = original_response_clone.body
111         }
112         
113         response = new Response(original_text, {
114             status,
115             headers: new_response_headers
116         })
117     }
118     return response;
119 }
120 
121 async function replace_response_text(response, upstream_domain, host_name) {
122     let text = await response.text()
123 
124     var i, j;
125     for (i in replace_dict) {
126         j = replace_dict[i]
127         if (i == '$upstream') {
128             i = upstream_domain
129         } else if (i == '$custom_domain') {
130             i = host_name
131         }
132 
133         if (j == '$upstream') {
134             j = upstream_domain
135         } else if (j == '$custom_domain') {
136             j = host_name
137         }
138 
139         let re = new RegExp(i, 'g')
140         text = text.replace(re, j);
141     }
142     return text;
143 }
144 
145 
146 async function device_status(user_agent_info) {
147     var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
148     var flag = true;
149     for (var v = 0; v < agents.length; v++) {
150         if (user_agent_info.indexOf(agents[v]) > 0) {
151             flag = false;
152             break;
153         }
154     }
155     return flag;
156 }
