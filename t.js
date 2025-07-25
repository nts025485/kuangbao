import { connect } from 'cloudflare:sockets';

// 预编译所有固定数据
const D = new TextDecoder(), E = new TextEncoder();
const S = '123456', U = '5aba5b77-48eb-4ae2-b60d-5bfee7ac169e';
const P = ['13.250.14.76'], R = 'sjc.o00o.ooo:443', N = '狂暴';

// UUID预编译为字节数组
const UB = new Uint8Array(16);
const uh = U.replace(/-/g, '');
for (let i = 0; i < 16; i++) UB[i] = parseInt(uh.substr(i * 2, 2), 16);

// 预编译响应数据
const OK_RESP = new Uint8Array([0, 0]);
const SUB_PATH = `/${S}`;
const VLESS_PATH = `/${S}/vless`;

// 预编译配置模板
const CONFIG_TEMPLATE = (h, a, p, n) => `vless://${U}@${a}:${p}?encryption=none&security=tls&type=ws&host=${h}&sni=${h}&path=%2F%3Fed%3D2560#${n}`;

// 固定资源池
const WRITE_BUFFER = new Array(3); // 固定3个槽位
let bufferIndex = 0;

// 极简UUID检查 - 内联优化
const checkUUID = b => {
    return b[1] === UB[0] && b[2] === UB[1] && b[3] === UB[2] && b[4] === UB[3] &&
           b[5] === UB[4] && b[6] === UB[5] && b[7] === UB[6] && b[8] === UB[7] &&
           b[9] === UB[8] && b[10] === UB[9] && b[11] === UB[10] && b[12] === UB[11] &&
           b[13] === UB[12] && b[14] === UB[13] && b[15] === UB[14] && b[16] === UB[15];
};

// 极简连接函数
const conn = async (h, p, d) => {
    try {
        const s = await connect({ hostname: h, port: p });
        await s.opened;
        return { s, d };
    } catch {
        const [rh, rp] = R.split(':');
        const s = await connect({ hostname: rh, port: +rp || p });
        await s.opened;
        return { s, d };
    }
};

// 极简VLESS解析 - 移除switch优化
const parseV = async buf => {
    const a = new Uint8Array(buf);
    const t = a[17];
    const port = (a[18 + t + 1] << 8) | a[18 + t + 2];
    let o = 18 + t + 4;
    let host;
    
    // 内联地址解析 - 最常见的域名类型优先
    if (a[o - 1] === 2) {
        const l = a[o++];
        host = D.decode(a.subarray(o, o + l));
        o += l;
    } else if (a[o - 1] === 1) {
        host = `${a[o]}.${a[o + 1]}.${a[o + 2]}.${a[o + 3]}`;
        o += 4;
    } else {
        // IPv6 - 简化处理
        const p = [];
        for (let i = 0; i < 8; i++) {
            p[i] = ((a[o + i * 2] << 8) | a[o + i * 2 + 1]).toString(16);
        }
        host = p.join(':');
        o += 16;
    }
    
    return await conn(host, port, buf.slice(o));
};

// 极简隧道 - 移除所有动态逻辑
const tunnel = (ws, tcp, init) => {
    const w = tcp.writable.getWriter();
    let active = 1;
    
    ws.send(OK_RESP);
    if (init) w.write(init);
    
    const end = () => {
        if (!active) return;
        active = 0;
        try { w.releaseLock(); tcp.close(); } catch {}
    };
    
    // 直接写入模式 - 无缓冲
    ws.addEventListener('message', ({ data }) => {
        if (!active) return;
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : 
                     typeof data === 'string' ? E.encode(data) : data;
        w.write(bytes).catch(end);
    });
    
    // 直接管道模式
    tcp.readable.pipeTo(new WritableStream({
        write: chunk => active && ws.send(chunk),
        close: end,
        abort: end
    })).catch(end);
    
    ws.addEventListener('close', end);
};

// 预编译配置生成
const genConf = h => {
    let result = '';
    for (let i = 0; i < P.length; i++) {
        const [a, p = 443] = P[i].split(':');
        result += CONFIG_TEMPLATE(h, a, p, N) + '\n';
    }
    result += CONFIG_TEMPLATE(h, h, 443, N);
    return result;
};

export default {
    async fetch(req, env) {
        const url = new URL(req.url);
        const host = req.headers.get('Host');
        
        // 极简路由 - 内联判断
        if (req.headers.get('Upgrade') !== 'websocket') {
            const path = url.pathname;
            return path === SUB_PATH ? 
                new Response(`订阅地址: https://${host}${VLESS_PATH}`) :
                path === VLESS_PATH ?
                new Response(genConf(host)) :
                new Response('Hello Worker!');
        }
        
        // 极简WebSocket处理
        const proto = req.headers.get('sec-websocket-protocol');
        if (!proto) return new Response('协议错误', { status: 400 });
        
        // 优化Base64解码 - 避免字符串操作
        const b64 = proto.replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(b64);
        const len = raw.length;
        const data = new Uint8Array(len);
        for (let i = 0; i < len; i++) data[i] = raw.charCodeAt(i);
        
        // 内联UUID检查
        if (!checkUUID(data)) {
            return new Response('认证失败', { status: 403 });
        }
        
        try {
            const { s: tcpSocket, d: initialData } = await parseV(data.buffer);
            const [client, server] = new WebSocketPair();
            server.accept();
            tunnel(server, tcpSocket, initialData);
            return new Response(null, { status: 101, webSocket: client });
        } catch {
            return new Response('连接失败', { status: 502 });
        }
    }
};
