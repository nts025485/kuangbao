---

## 🌐 Cloudflare Worker VLESS 中转服务说明文档

### 注：越下面越猛，越容易触发限流,自行抉择使用版本。

### 📌 项目简介

本项目是一个基于 **Cloudflare Workers** 的轻量级 VLESS 中转服务，支持：

* ✅ VLESS over WebSocket 中转
* ✅ UUID 验证
* ✅ 多 IP 随机分流
* ✅ 自动生成订阅链接
* ✅ NAT64 IPv6 支持
* ✅ 备用反代 IP 回退

适用于绕过封锁、优化连接质量、国内外中转等场景。

---

### 🚀 功能特性

* ✅ VLESS 协议转发，兼容所有主流客户端
* ✅ Cloudflare 全球加速 + 中转支持
* ✅ 多出口 IP 支持，支持自定义节点名称
* ✅ 智能 NAT64 转换（适配纯 IPv6 网络）
* ✅ 自动回退至备用反代 IP
* ✅ 内置订阅链接生成器，无需额外订阅服务

---

## 🛠️ 使用部署指南

### 1️⃣ 创建 Worker

1. 登录 Cloudflare → Workers & Pages → 创建 Worker
2. 在编辑器中粘贴脚本（使用优化后的代码版本）
3. 点击 “Save and Deploy” 部署

### 2️⃣ 设置环境变量（可选但推荐）

进入 Worker → `Settings` → `Variables`，添加如下变量：

| 变量名       | 类型   | 说明                       |
| --------- | ---- | ------------------------ |
| `UUID`    | Text | 用于连接验证的唯一 UUID（**必填**）   |
| `ID`      | Text | 自定义订阅路径标识，如 `123456`     |
| `IP`      | Text | 多个出口 IP，换行分隔             |
| `TXT`     | Text | 可选的订阅附加信息（如备注/公告）        |
| `PROXYIP` | Text | 备用反代地址，如 `1.2.3.4:443`   |
| `启用反代功能`  | Text | `true` 启用备用反代            |
| `NAT64`   | Text | `true` 启用 IPv4 → IPv6 转换 |
| `我的节点名字`  | Text | 节点名称（展示在订阅中，默认值：狂暴）      |

📌 示例配置：

```
UUID = 5aba5b77-48eb-4ae2-b60d-5bfee7ac169e
ID = 123456
IP = 1.1.1.1(自行替换本地优选 护食.jpg)
PROXYIP = sjc.o00o.ooo:443
启用反代功能 = true
NAT64 = true
我的节点名字 = 狂暴中转
```

---

## 🔗 使用说明

### 🧾 客户端配置（v2rayN / v2rayNG / Clash.Meta）

| 参数       | 配置值                               |
| -------- | --------------------------------- |
| 协议       | vless                             |
| 地址       | 你的 Worker 域名（如 `xxx.workers.dev`） |
| 端口       | 443                               |
| UUID     | 与环境变量 `UUID` 一致                   |
| 加密方式     | none                              |
| 传输方式     | ws                                |
| TLS      | ✅ 开启                              |
| 路径       | `/?ed=2560`                       |
| Host/SNI | 同你的域名                             |

---

### 📬 订阅地址路径说明

| 路径          | 功能说明                     |
| ----------- | ------------------------ |
| `/ID`       | 返回提示页面（订阅地址说明）           |
| `/ID/vless` | 自动生成 VLESS 订阅列表（多 IP 支持） |

📌 示例链接：

```
https://your-worker-subdomain.workers.dev/123456
https://your-worker-subdomain.workers.dev/123456/vless
```

---

## 🧪 测试部署成功

使用浏览器访问：

```text
https://your-worker.workers.dev/123456
https://your-worker.workers.dev/123456/vless
```

能看到订阅链接说明 / vless 链接即部署成功。

允许套用各位大佬的优选SUB：
以MR大佬的SUB为例：点击 https://owo.o00o.ooo/ 将你上面得到的订阅链接的节点套入，点击“生成优选订阅”即可。
<img width="1920" height="1040" alt="QQ图片20250712144001" src="https://github.com/user-attachments/assets/3016b514-d334-4792-8108-c35843a76529" />




---

## ❓ 常见问题解答（FAQ）

### 1. 客户端连接失败怎么办？

* ✅ 检查客户端 UUID 是否与你设置的 `UUID` 一致
* ✅ IP 被封：更换 `IP` 变量的地址
* ✅ NAT64 问题：关闭 `NAT64` 试试
* ✅ 备用反代无效：检查 `PROXYIP` 是否可连接

### 2. 支持哪些客户端？

* ✅ v2rayN（Windows）
* ✅ v2rayNG / SagerNet（Android）
* ✅ Shadowrocket / Stash（iOS）
* ✅ Clash.Meta / MetaX（全平台）

---

## 📦 附加说明

### 📁 自建订阅转换功能（可选）

你可直接使用 `/ID/vless` 路径生成标准 VLESS 链接，无需借助 Sub-Converter 服务。

如需自定义返回内容，可在环境变量中设置 `TXT` 为任意文本或订阅内容。

---
