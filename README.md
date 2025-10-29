# hammal

Hammal 是运行于 Cloudflare Workers 上的 Docker 镜像加速工具，用于解决获取 Docker 官方镜像无法正常访问的问题。

## 功能特性

- **Docker Hub 代理加速**：通过 Cloudflare Workers 加速 Docker 镜像拉取
- **智能认证**：自动获取和缓存 Docker Hub 认证令牌，突破速率限制
- **访问控制**：支持 Basic Auth 认证，可选启用
- **令牌缓存**：利用 Cloudflare KV 缓存认证令牌，减少 API 调用
- **路径重写**：自动处理官方库路径转换

## 架构

```
Docker Client
    ↓
Hammal (Cloudflare Workers)
    ↓
Docker Hub (registry-1.docker.io)
```

## 前置要求

- Node.js 和 pnpm
- Cloudflare 账户（免费账户即可）
- Docker Hub 账户（可选，用于认证）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置 wrangler.toml

编辑 `wrangler.toml`，配置你的 Cloudflare 账户信息：

```toml
name = "hammal"
account_id = "your-account-id"
main = "src/index.ts"
workers_dev = true
compatibility_date = "2024-06-08"

kv_namespaces = [
  { binding = "HAMMAL_CACHE", id = "your-kv-namespace-id" }
]
```

### 3. 设置 Docker Hub 凭证（推荐）

Docker Hub 对未认证请求的限制为 6 次/小时，认证用户可获得 200 次/小时。建议配置凭证以获得更高的请求配额。

```bash
# 设置 Docker Hub 用户名
wrangler secret put DOCKER_USERNAME
# 输入你的 Docker Hub 用户名

# 设置 Docker Hub 密码或访问令牌
wrangler secret put DOCKER_PASSWORD
# 输入你的 Docker Hub 密码或个人访问令牌
```

**创建个人访问令牌（推荐）**：
1. 登录 Docker Hub
2. 访问 https://hub.docker.com/settings/security
3. 创建新的 Personal Access Token
4. 使用令牌作为密码设置

### 4. 部署到 Cloudflare

```bash
pnpm deploy
```

## 访问控制

### 启用 Registry 认证

如果希望限制 Hammal 的访问权限，可以启用 Basic Auth 认证：

```bash
# 设置 registry 用户名
wrangler secret put REGISTRY_USERNAME
# 输入自定义用户名，例如：myuser

# 设置 registry 密码
wrangler secret put REGISTRY_PASSWORD
# 输入自定义密码，例如：mypassword
```

启用认证后，所有请求都需要提供有效的凭证。

### 禁用 Registry 认证（默认）

如果不设置 `REGISTRY_USERNAME` 和 `REGISTRY_PASSWORD`，Registry 将完全开放，无需认证。

## 使用方法

### 配置 Docker 镜像源

在 Docker 配置文件中添加镜像源（假设 Hammal 部署在 `hammal.example.com`）：

**Linux/Mac - ~/.docker/config.json**

```json
{
  "registry-mirrors": [
    "https://hammal.example.com"
  ]
}
```

**或编辑 /etc/docker/daemon.json**

```json
{
  "registry-mirrors": [
    "https://hammal.example.com"
  ]
}
```

重启 Docker 服务：

```bash
sudo systemctl restart docker
```

**Windows - Docker Desktop Settings**

1. 右键点击 Docker Desktop 系统托盘图标
2. 选择 Settings
3. 进入 Docker Engine
4. 添加配置：

```json
{
  "registry-mirrors": [
    "https://hammal.example.com"
  ]
}
```

5. 点击 Apply & Restart

### 直接使用

```bash
# 无认证情况
docker pull hammal.example.com/library/nginx:latest

# 启用认证时，使用 docker login
docker login hammal.example.com
# 输入用户名和密码

docker pull hammal.example.com/library/nginx:latest
```

### 通过 curl 测试

```bash
# 无认证
curl https://hammal.example.com/v2/

# 启用认证
curl -u "myuser:mypassword" https://hammal.example.com/v2/
```

## 故障排查

### 429 Too Many Requests

**原因**：未认证用户达到 Docker Hub 速率限制

**解决方案**：设置 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` 以进行认证

### 401 Unauthorized

如果 Registry 启用了认证，请确保：
- 正确设置了 `REGISTRY_USERNAME` 和 `REGISTRY_PASSWORD`
- Docker 客户端已执行 `docker login` 并提供正确的凭证

### 无法拉取镜像

检查以下内容：
- Hammal worker 已部署成功
- 镜像源配置正确
- 网络连接正常
- 查看 Cloudflare 仪表板中的 worker 日志

## 许可证

本项目同时许可于 MIT 和 Apache 2.0 协议。

## 相关文档

详细文档：https://singee.atlassian.net/wiki/spaces/MAIN/pages/5079084/Cloudflare+Workers+Docker 
