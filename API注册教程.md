# 📝 API Key 注册教程（图文详解）

## 一、豆包 API Key 注册（5分钟）

### 步骤1：访问火山引擎控制台
1. 打开浏览器，访问：https://console.volcengine.com/ark
2. 点击右上角 **"登录/注册"**

### 步骤2：注册账号
**方式一：手机号注册**
1. 选择 "手机号注册"
2. 输入手机号，获取验证码
3. 设置密码，完成注册

**方式二：微信扫码登录**（推荐，更快）
1. 选择 "微信登录"
2. 用手机微信扫码
3. 授权登录

### 步骤3：实名认证
登录后会提示实名认证（必须完成）：
1. 点击 "立即认证"
2. 选择 "个人认证"
3. 填写真实姓名和身份证号
4. 上传身份证正反面照片
5. 等待审核（通常 1-5 分钟）

### 步骤4：进入模型推理页面
1. 左侧菜单找到 "机器学习平台"
2. 点击 "模型推理"
3. 进入控制台

### 步骤5：创建接入点
1. 点击 "创建接入点"
2. 填写信息：
   - **接入点名称**：`travel-planner`（随便起）
   - **选择模型**：在下拉菜单中选择 **`doubao-pro-32k`**
   - **描述**：旅行规划系统（可不填）
3. 点击 "确定"

### 步骤6：获取 API Key
1. 左侧菜单点击 "API Key 管理"
2. 点击 "新建 API Key"
3. 填写名称：`travel-key`
4. 点击 "确定"
5. **立即复制 API Key**（格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）
6. ⚠️ **重要**：保存到安全的地方，关闭后无法再查看

### 步骤7：获取 Endpoint ID
1. 返回 "接入点列表"
2. 找到刚创建的 `travel-planner`
3. 复制 **Endpoint ID**（格式：`ep-xxxxxxxxxxxx`）

### ✅ 完成
你现在应该有两个关键信息：
- `DOUBAO_API_KEY`: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
- `DOUBAO_ENDPOINT_ID`: ep-xxxxxxxxxxxx

---

## 二、百度搜索 API Key 注册（5分钟）

### 步骤1：访问百度智能云
1. 打开浏览器，访问：https://cloud.baidu.com/
2. 点击右上角 **"登录"**

### 步骤2：登录百度账号
**方式一：百度账号**
1. 输入手机号/用户名和密码
2. 登录

**方式二：微信扫码**（推荐）
1. 点击 "微信登录"
2. 手机微信扫码
3. 授权登录

### 步骤3：进入产品控制台
1. 登录后，点击顶部 "产品服务"
2. 在搜索框输入 "搜索"
3. 找到 **"网页搜索"** 服务
4. 点击进入

### 步骤4：开通服务
1. 点击 "立即开通"
2. 阅读服务协议，勾选同意
3. 点击 "开通"
4. 提示开通成功

### 步骤5：创建应用
1. 进入 "网页搜索" 控制台
2. 点击 "创建应用"
3. 填写信息：
   - **应用名称**：`travel-search`
   - **应用类型**：选择 "网页搜索"
   - **应用描述**：旅行信息搜索（可不填）
4. 点击 "立即创建"

### 步骤6：获取密钥
1. 在应用列表找到 `travel-search`
2. 点击应用名称进入详情
3. 找到 **API Key** 和 **Secret Key**
4. 分别复制保存：
   - `BAIDU_API_KEY`: xxxxxxxxxxxxxxxxxxxxxxxx
   - `BAIDU_SECRET_KEY`: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

### ✅ 完成
你现在应该有两个密钥：
- `BAIDU_API_KEY`: 24位字符串
- `BAIDU_SECRET_KEY`: 32位字符串

---

## 三、配置项目

### 步骤1：找到项目目录
打开终端/命令行，进入项目文件夹：
```bash
cd travel-planner-doubao
```

### 步骤2：创建 .env 文件
复制模板文件：
```bash
# macOS/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

### 步骤3：编辑 .env 文件
用文本编辑器打开 `.env` 文件：

```bash
# macOS
open -a TextEdit .env

# Windows
notepad .env

# 或使用 VS Code
code .env
```

填入你的密钥：
```env
# 豆包 API 配置
DOUBAO_API_KEY=你刚才复制的豆包API_Key
DOUBAO_ENDPOINT_ID=你刚才复制的Endpoint_ID

# 百度搜索 API 配置
BAIDU_API_KEY=你刚才复制的百度API_Key
BAIDU_SECRET_KEY=你刚才复制的百度Secret_Key

# 服务器配置
PORT=3000
```

**示例**（这是假的，请用你自己的）：
```env
DOUBAO_API_KEY=12345678-1234-1234-1234-123456789012
DOUBAO_ENDPOINT_ID=ep-20240115123456
BAIDU_API_KEY=ABCdefGHIjklMNOpqrSTUvwx
BAIDU_SECRET_KEY=ABCdefGHIjklMNOpqrSTUvwxyzABCDEF
PORT=3000
```

保存文件。

---

## 四、启动项目

### 方式一：使用快速启动脚本（推荐）

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
双击运行 `start.bat` 文件

### 方式二：手动启动

#### 1. 安装依赖
```bash
cd backend
npm install
```

#### 2. 启动后端
```bash
node server.js
```

应该看到：
```
==================================================
✅ 后端服务器启动成功！
🌐 服务地址: http://localhost:3000
📝 健康检查: http://localhost:3000/health
==================================================
```

#### 3. 打开前端
在浏览器中打开：
```
frontend/index.html
```

---

## 五、测试

### 1. 测试后端连接
在浏览器访问：
```
http://localhost:3000/health
```

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "apis": {
    "doubao": "✅ 正常",
    "baidu": "✅ 正常"
  }
}
```

### 2. 测试生成方案
在前端页面输入：
```
想去马尔代夫度蜜月，5天，预算2万/人
```

点击 "生成方案"，等待 5-10 秒，应该看到完整的旅行方案。

---

## 🛠️ 常见问题

### Q1: 豆包 API 返回 401 错误
**原因**：API Key 或 Endpoint ID 填写错误

**解决**：
1. 检查 `.env` 文件中的 `DOUBAO_API_KEY` 和 `DOUBAO_ENDPOINT_ID`
2. 确认复制时没有多余的空格
3. 确认 API Key 在火山引擎控制台中状态为"启用"

### Q2: 百度 API 返回 110 错误
**原因**：Access Token 无效

**解决**：
1. 检查 `.env` 文件中的 `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY`
2. 确认百度云控制台应用状态正常
3. 重启后端服务器（重新获取 Token）

### Q3: 前端无法连接后端
**错误**：`Failed to fetch` 或 `ERR_CONNECTION_REFUSED`

**解决**：
1. 确认后端服务器已启动（访问 http://localhost:3000/health）
2. 检查后端没有报错
3. 确认端口 3000 没有被占用

### Q4: 生成速度很慢
**原因**：网络延迟或 API 响应慢

**优化**：
1. 检查网络连接
2. 豆包和百度服务器都在国内，应该很快
3. 如果持续慢，尝试重启服务器

### Q5: 豆包返回频率限制错误
**错误**：`429 Too Many Requests`

**原因**：超过 50次/分钟限制

**解决**：代码已包含限流保护，等待 1 分钟后自动恢复

---

## 📞 需要帮助？

### 提供以下信息：
1. 错误截图
2. 后端终端日志
3. `.env` 配置（**隐藏密钥部分**，只说有没有填）
4. 操作系统版本

我会帮你解决问题！

---

## ✅ 检查清单

完成注册后，确认你有以下信息：

- [ ] 豆包 API Key（36位，包含4个短横线）
- [ ] 豆包 Endpoint ID（以 `ep-` 开头）
- [ ] 百度 API Key（24位）
- [ ] 百度 Secret Key（32位）
- [ ] 已创建 `.env` 文件并填入上述信息
- [ ] 后端启动成功，访问 /health 返回正常
- [ ] 前端可以打开，显示初始消息
- [ ] 测试生成一个方案，成功返回结果

全部打勾后，恭喜你配置完成！🎉
