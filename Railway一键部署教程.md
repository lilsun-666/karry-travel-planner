# 🚀 Railway 一键部署教程

## ✨ 3步完成免费部署（不到10分钟）

---

## 📋 准备工作

你需要：
1. ✅ GitHub账号（没有？访问 https://github.com 注册，免费）
2. ✅ 豆包API密钥（你已经有了）

---

## 🎯 部署步骤

### 第1步：上传代码到GitHub

#### 1.1 创建GitHub仓库
1. 访问 https://github.com/new
2. 填写：
   - **Repository name**: `karry-travel-planner`（或任意名称）
   - **Description**: `智能旅行规划助手`
   - **可见性**: 选择 **Private**（私有）或 **Public**（公开）
3. **不要勾选**任何初始化选项（README、.gitignore等）
4. 点击 **Create repository**

#### 1.2 推送代码到GitHub
复制GitHub显示的命令，在终端执行：

```bash
cd /Users/karryfan/.box/Workspace/output/f8b18a19-89a6-4705-9440-b757d999289f/travel-planner-doubao

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/karry-travel-planner.git

# 推送代码
git branch -M main
git push -u origin main
```

**提示**：如果提示输入密码，需要使用 **Personal Access Token**：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成token后复制，**替代密码**使用

---

### 第2步：部署到Railway

#### 2.1 注册Railway
1. 访问 https://railway.app
2. 点击 **"Login"** → **"Login with GitHub"**
3. 授权Railway访问GitHub

#### 2.2 创建项目
1. 进入Railway Dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 找到并选择 `karry-travel-planner` 仓库
5. 点击 **"Deploy Now"**

Railway会自动：
- ✅ 识别Node.js项目
- ✅ 安装依赖（npm install）
- ✅ 启动服务（node backend/server.js）

#### 2.3 等待部署
- 左侧会显示部署日志
- 等待状态变为 **"Active"**（约2-3分钟）

---

### 第3步：配置环境变量

#### 3.1 添加环境变量
1. 在项目页面，点击 **"Variables"** 标签
2. 点击 **"+ New Variable"**
3. 添加以下变量：

**第1个变量**：
- **Variable name**: `DOUBAO_API_KEY`
- **Value**: `你的豆包API密钥`（从你的.env文件复制）

**第2个变量**：
- **Variable name**: `DOUBAO_ENDPOINT_ID`
- **Value**: `你的豆包端点ID`（从你的.env文件复制）

**第3个变量**（可选）：
- **Variable name**: `NODE_ENV`
- **Value**: `production`

4. 点击 **"Add"** 保存

#### 3.2 重新部署
- 添加环境变量后，Railway会自动重新部署
- 等待1-2分钟

---

### 第4步：获取访问地址

#### 4.1 生成公网域名
1. 在项目页面，点击 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. Railway会分配一个域名，例如：
   ```
   https://karry-travel-planner-production.up.railway.app
   ```

#### 4.2 测试访问
1. 复制生成的域名
2. 在浏览器中打开
3. 看到 **Karry旅行家** 界面说明成功！

---

## ✅ 完成！现在你可以：

1. **分享链接**：把Railway生成的域名发给朋友
   ```
   https://你的项目名.up.railway.app
   ```

2. **随时访问**：在任何设备浏览器打开链接使用

3. **自动更新**：修改代码后 `git push`，Railway自动重新部署

---

## 📱 使用建议

### 分享给朋友时
直接发送Railway域名：
```
嘿！试试这个智能旅行规划助手：
https://你的项目名.up.railway.app

输入你的旅行需求，AI会生成个性化方案！
```

### 移动端访问
朋友可以在手机浏览器直接打开使用，体验完全一样！

---

## 🔧 常见问题

### Q1: 部署失败怎么办？
**A**: 查看Railway项目的 **"Deployments"** 标签，点击最新的部署查看日志，通常是环境变量配置错误。

### Q2: 访问域名显示错误？
**A**: 检查：
1. 环境变量是否正确配置（DOUBAO_API_KEY 和 DOUBAO_ENDPOINT_ID）
2. 部署状态是否为 "Active"
3. 等待1-2分钟让服务完全启动

### Q3: 如何查看日志？
**A**: 在Railway项目页面：
1. 点击 **"Deployments"** 标签
2. 点击最新的部署
3. 查看实时日志

### Q4: 如何更新代码？
**A**: 修改代码后：
```bash
cd /Users/karryfan/.box/Workspace/output/f8b18a19-89a6-4705-9440-b757d999289f/travel-planner-doubao
git add .
git commit -m "更新说明"
git push
```
Railway会自动检测并重新部署。

### Q5: Railway免费版有什么限制？
**A**: 
- ✅ 每月500小时运行时间（对于小流量完全够用）
- ✅ 自动休眠：15分钟无访问自动休眠，访问时自动唤醒（首次访问会慢5-10秒）
- ✅ 完全免费，无需信用卡

### Q6: 域名能自定义吗？
**A**: Railway免费版只能使用分配的域名，如需自定义域名需升级到付费版（5美元/月）。

### Q7: 如何删除项目？
**A**: 在Railway项目页面：
1. 点击 **"Settings"** 标签
2. 滚动到底部
3. 点击 **"Delete Project"**

---

## 💰 费用说明

### Railway免费额度
- ✅ **500小时/月**运行时间
- ✅ 自动休眠机制（15分钟无访问休眠）
- ✅ 实际使用：每天2-3小时，一个月不到100小时
- ✅ **完全免费**，无需信用卡

### 豆包API费用
- 免费版额度通常够个人和小范围使用
- 如果访问量大，考虑升级到付费版

---

## 🎉 成功案例

部署成功后，你会看到：
```
✅ 项目状态: Active
✅ 访问地址: https://xxx.up.railway.app
✅ 最后部署: 2分钟前
✅ 环境变量: 已配置
```

---

## 📞 需要帮助？

如果遇到问题：
1. 检查Railway部署日志
2. 确认环境变量配置正确
3. 访问 https://railway.app/help

---

**Karry旅行家** - 智能定制您的旅程 ✈️

现在开始部署吧！🚀
