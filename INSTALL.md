# OPTI 安装部署指南

> 本指南将从零开始，详细讲解如何在服务器上部署 OPTI（原神版MBTI测试系统）

---

## 目录

- [前置准备](#前置准备)
- [第一步：安装宝塔面板](#第一步安装宝塔面板)
- [第二步：宝塔面板基础配置](#第二步宝塔面板基础配置)
- [第三步：安装Node.js环境](#第三步安装nodejs环境)
- [第四步：克隆项目代码](#第四步克隆项目代码)
- [第五步：安装项目依赖](#第五步安装项目依赖)
- [第六步：配置环境变量](#第六步配置环境变量)
- [第七步：使用PM2启动服务](#第七步使用pm2启动服务)
- [第八步：配置Nginx反向代理](#第八步配置nginx反向代理)
- [第九步：配置防火墙与端口](#第九步配置防火墙与端口)
- [第十步：验证部署](#第十步验证部署)
- [常见问题排查](#常见问题排查)

---

## 前置准备

### 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1核 | 2核+ |
| 内存 | 1GB | 2GB+ |
| 硬盘 | 10GB | 20GB+ |
| 带宽 | 1Mbps | 5Mbps+ |
| 系统 | CentOS 7+ / Ubuntu 18+ / Debian 10+ | CentOS 7.9 |

### 需要准备的信息

- [x] 服务器IP地址
- [x] 服务器SSH登录密码（或密钥）
- [x] 域名（可选，也可以使用IP+端口访问）
- [x] AI服务商API Key（至少一个）
  - 智谱GLM：https://open.bigmodel.cn/
  - DeepSeek：https://platform.deepseek.com/
  - 千问（阿里云百炼）：https://bailian.console.aliyun.com/
  - 火山引擎：https://console.volcengine.com/ark

---

## 第一步：安装宝塔面板

### 1.1 SSH连接服务器

使用SSH工具（如PuTTY、Xshell、Windows Terminal）连接服务器：

```bash
ssh root@你的服务器IP
```

### 1.2 执行安装命令

**CentOS 7+ / CentOS 8+（推荐）：**

```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

**Ubuntu 18+ / Debian 10+：**

```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

### 1.3 确认安装

安装过程中会提示是否安装，输入 `y` 并回车确认。

### 1.4 记录面板信息

安装完成后，会显示类似以下信息，**请务必保存**：

```
==================================================================
外网面板地址: https://xxx.xxx.xxx.xxx:8888/xxxxxxxx
内网面板地址: https://192.168.x.x:8888/xxxxxxxx
username: xxxxxxxx
password: xxxxxxxx
==================================================================
```

---

## 第二步：宝塔面板基础配置

### 2.1 登录宝塔面板

1. 打开浏览器，访问面板地址（外网面板地址）
2. 输入用户名和密码登录
3. 首次登录会提示绑定宝塔账号，按提示完成绑定

### 2.2 安装推荐套件

登录后，面板会推荐安装LNMP套件。**本项目只需要Nginx**，其他组件可以不安装：

| 软件 | 是否安装 | 说明 |
|------|---------|------|
| Nginx | ✅ 必须 | 反向代理 |
| MySQL | ❌ 不需要 | 项目使用JSON文件存储 |
| PHP | ❌ 不需要 | 项目使用Node.js |
| phpMyAdmin | ❌ 不需要 | 无数据库 |

**安装方式**：
1. 点击左侧菜单「软件商店」
2. 搜索「Nginx」
3. 点击「安装」，选择「极速安装」
4. 等待安装完成（约2-5分钟）

### 2.3 修改面板端口（可选但推荐）

为了安全，建议修改面板端口：

1. 点击左侧菜单「面板设置」
2. 修改「面板端口」为其他端口（如 18888）
3. 点击「保存」

---

## 第三步：安装Node.js环境

### 3.1 安装Node.js版本管理器

1. 点击左侧菜单「软件商店」
2. 搜索「Node版本管理器」
3. 点击「安装」
4. 等待安装完成

### 3.2 安装Node.js

1. 安装完成后，点击「Node版本管理器」的「设置」
2. 在「版本管理」标签页，选择安装 **v16.9.0**（推荐版本）
3. 点击「安装」
4. 等待安装完成

### 3.3 验证安装

点击「终端」按钮，输入以下命令验证：

```bash
node -v
# 应显示: v16.9.0

npm -v
# 应显示: 7.x.x 或更高
```

---

## 第四步：克隆项目代码

### 4.1 进入网站目录

在终端中执行：

```bash
cd /www/wwwroot
```

### 4.2 克隆GitHub仓库

```bash
git clone https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator.git mbti
```

### 4.3 进入项目目录

```bash
cd mbti
```

### 4.4 查看项目结构

```bash
ls -la
```

应该看到以下目录结构：

```
/www/wwwroot/mbti/
├── index.html            # 前端入口
├── server.js             # 服务器入口
├── package.json          # 依赖配置
├── assets/               # 静态资源
├── config/               # 配置文件
├── css/                  # 样式文件
├── data/                 # 数据文件
├── js/                   # 前端JS
├── routes/               # 后端路由
└── services/             # 后端服务
```

---

## 第五步：安装项目依赖

### 5.1 使用完整路径执行npm

宝塔面板的Node.js需要使用完整路径：

```bash
/www/server/nodejs/v16.9.0/bin/npm install
```

### 5.2 等待安装完成

安装过程约需1-3分钟，看到以下输出表示成功：

```
added xxx packages in xxs
```

---

## 第六步：配置环境变量

### 6.1 创建.env文件

在终端中执行以下命令创建环境变量文件：

```bash
cat > /www/wwwroot/mbti/.env << 'EOF'
# 服务端口
PORT=3000

# 智谱GLM配置（推荐）
GLM_API_KEY=your_glm_api_key_here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4-flash

# DeepSeek配置（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# 千问配置（可选）
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 火山引擎配置（可选）
VOLCANO_API_KEY=your_volcano_api_key_here
VOLCANO_API_URL=https://ark.cn-beijing.volces.com/api/v3
VOLCANO_ENDPOINT_SEED_2_LITE=ep-m-xxxxxxxxxxxxx
VOLCANO_ENDPOINT_SEED_1_6=ep-m-xxxxxxxxxxxxx
EOF
```

### 6.2 修改API Key

使用文本编辑器修改 `.env` 文件，填入你的真实API Key：

```bash
# 使用vim编辑
vim /www/wwwroot/mbti/.env

# 或使用宝塔面板的文件管理器编辑
```

**重要提示**：
- 将 `your_glm_api_key_here` 替换为你的真实API Key
- 至少配置一个AI服务商
- API URL 不要修改，代码会自动拼接端点

### 6.3 验证配置

```bash
cat /www/wwwroot/mbti/.env
```

确认API Key已正确填写。

---

## 第七步：使用PM2启动服务

### 7.1 安装PM2

```bash
/www/server/nodejs/v16.9.0/bin/npm install -g pm2
```

### 7.2 启动服务

```bash
cd /www/wwwroot/mbti
pm2 start server.js --name mbti
```

### 7.3 设置开机自启

```bash
pm2 startup
pm2 save
```

### 7.4 查看服务状态

```bash
pm2 list
```

应该看到类似输出：

```
┌─────┬──────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name     │ status  │ cpu     │ memory  │ uptime   │
├─────┼──────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ mbti     │ online  │ 0%      │ 50M     │ 10s      │
└─────┴──────────┴─────────┴─────────┴─────────┴──────────┘
```

### 7.5 常用PM2命令

```bash
# 查看日志
pm2 logs mbti

# 重启服务
pm2 restart mbti

# 停止服务
pm2 stop mbti

# 删除服务
pm2 delete mbti
```

---

## 第八步：配置Nginx反向代理

### 8.1 添加站点

1. 点击宝塔面板左侧「网站」
2. 点击「添加站点」
3. 填写信息：
   - 域名：填写你的域名（或留空使用IP访问）
   - 根目录：`/www/wwwroot/mbti`
   - PHP版本：纯静态
   - 数据库：不创建
4. 点击「提交」

### 8.2 配置Nginx

1. 在网站列表中，点击刚创建站点的「设置」
2. 点击左侧「配置文件」
3. **完全替换**为以下配置：

```nginx
server {
    listen 8080;
    server_name _;
    
    # 允许访问 about_test.json（关于本测试）
    location = /data/about_test.json {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 允许访问统计数据文件（公开访问）
    location ~* ^/data/(mbti_statistics|mbti_compatibility_stats)\.json$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 允许访问题目文件
    location ~* ^/data/questions/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 禁止访问 data 目录下的其他 JSON 文件（用户数据保护）
    location ~* ^/data/.*\.json$ {
        deny all;
        return 403;
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        return 403;
    }
    
    # 禁止访问 node_modules
    location ~* /node_modules/ {
        deny all;
        return 403;
    }
    
    # 禁止访问服务端文件
    location ~* ^/(routes|services)/.*\.js$ {
        deny all;
        return 403;
    }
    
    # 禁止访问配置文件
    location ~* \.(env|git|gitignore)$ {
        deny all;
        return 403;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|mp3|ogg|wav|css|js|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # SSE 流式响应配置（AI分析接口）
    location ~* ^/api/mallm/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection '';
        
        # SSE 关键配置
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        gzip off;
    }
    
    # 默认代理
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # 日志
    access_log /www/wwwroot/mbti/access.log;
    error_log /www/wwwroot/mbti/error.log;
}
```

4. 点击「保存」

### 8.3 重载Nginx

```bash
nginx -t && nginx -s reload
```

---

## 第九步：配置防火墙与端口

### 9.1 宝塔面板开放端口

1. 点击宝塔面板左侧「安全」
2. 添加端口规则：
   - 端口：`8080`
   - 备注：`MBTI测试系统`
   - 点击「放行」

### 9.2 云服务商安全组配置

如果使用云服务器（阿里云、腾讯云、华为云等），还需要在云服务商控制台开放端口：

**阿里云**：
1. 进入ECS实例详情
2. 点击「安全组」
3. 点击「配置规则」→「入方向」→「手动添加」
4. 端口范围：`8080/8080`
5. 授权对象：`0.0.0.0/0`

**腾讯云**：
1. 进入CVM实例详情
2. 点击「安全组」→「配置规则」
3. 点击「入站规则」→「添加规则」
4. 端口：`8080`
5. 来源：`0.0.0.0/0`

### 9.3 防火墙命令行配置（可选）

如果服务器使用firewalld：

```bash
# 查看防火墙状态
systemctl status firewalld

# 开放8080端口
firewall-cmd --zone=public --add-port=8080/tcp --permanent

# 重载防火墙
firewall-cmd --reload

# 查看已开放端口
firewall-cmd --list-ports
```

---

## 第十步：验证部署

### 10.1 检查服务状态

```bash
# 检查Node.js进程
ps -ef | grep node

# 检查端口监听
ss -lntp | grep 3000

# 检查PM2状态
pm2 list
```

### 10.2 本地测试API

```bash
# 测试AI模型列表接口
curl http://127.0.0.1:3000/api/ai-models

# 测试主页
curl http://127.0.0.1:8080
```

### 10.3 浏览器访问

打开浏览器，访问：

```
http://你的服务器IP:8080
```

如果看到原神版MBTI测试页面，说明部署成功！

---

## 常见问题排查

### Q1: npm命令找不到

**原因**：宝塔面板的Node.js需要使用完整路径

**解决方案**：

```bash
# 使用完整路径
/www/server/nodejs/v16.9.0/bin/npm install

# 或添加到PATH
export PATH=$PATH:/www/server/nodejs/v16.9.0/bin
```

### Q2: PM2进程无法开机自启

**解决方案**：

```bash
# 重新生成启动脚本
pm2 unstartup
pm2 startup
pm2 save
```

### Q3: 端口被占用

**排查步骤**：

```bash
# 查看端口占用
ss -lntp | grep 3000

# 杀死进程
kill -9 <PID>
```

### Q4: 无法访问网站

**排查步骤**：

```bash
# 1. 检查服务是否运行
pm2 list

# 2. 检查端口是否监听
ss -lntp | grep 3000

# 3. 检查Nginx是否运行
systemctl status nginx

# 4. 检查防火墙
firewall-cmd --list-ports

# 5. 检查Nginx配置
nginx -t

# 6. 查看错误日志
tail -f /www/wwwroot/mbti/error.log
```

### Q5: AI分析接口报错

#### 错误：余额不足（HTTP 402）

**解决方案**：
1. 登录AI服务商控制台充值
2. 或切换到其他已充值的AI服务商

#### 错误：请求频繁（HTTP 429）

**解决方案**：
1. 等待1分钟后重试
2. 升级AI服务商套餐
3. 切换到其他AI服务商

#### 错误：API Key无效（HTTP 401）

**解决方案**：
1. 检查 `.env` 文件中的API Key是否正确
2. 确认API Key没有过期
3. 重启服务：`pm2 restart mbti`

### Q6: 更新项目代码

```bash
# 进入项目目录
cd /www/wwwroot/mbti

# 拉取最新代码
git pull origin main

# 重新安装依赖（如有更新）
/www/server/nodejs/v16.9.0/bin/npm install

# 重启服务
pm2 restart mbti

# 查看日志确认
pm2 logs mbti
```

---

## 部署完成检查清单

- [ ] 宝塔面板已安装并登录
- [ ] Nginx已安装
- [ ] Node.js v16.9.0已安装
- [ ] 项目代码已克隆到 `/www/wwwroot/mbti`
- [ ] 依赖已安装（npm install）
- [ ] `.env` 文件已配置API Key
- [ ] PM2已启动服务（状态为online）
- [ ] PM2已设置开机自启
- [ ] Nginx反向代理已配置
- [ ] 防火墙已开放8080端口
- [ ] 云服务商安全组已开放8080端口
- [ ] 浏览器可正常访问 `http://服务器IP:8080`

---

## 联系支持

如遇到问题，请访问：
- **GitHub**: https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator
- **提交Issue**: https://github.com/asdjglze/OPTI-Otherworldly_Personality_Type_Indicator/issues

---

**文档版本**: v1.0.0  
**最后更新**: 2026-04-14
