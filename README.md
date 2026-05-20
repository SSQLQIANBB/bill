# Bill

智能记账 App 项目骨架，前端使用 React Native/Expo，服务端使用 FastAPI，数据库使用 MySQL。

## 目录

- `apps/mobile`: React Native App，支持 Android/iOS/Web。
- `services/api`: FastAPI 服务，提供微信授权登录、手机号验证码登录、注册、密码登录等接口。
- `docker-compose.yml`: 本地 MySQL。

## 环境变量

前端和后端分别维护自己的环境变量文件：

- 前端：`apps/mobile/.env.development`
- 前端：`apps/mobile/.env.uat`
- 前端：`apps/mobile/.env.production`
- 后端：`services/api/.env.development`
- 后端：`services/api/.env.uat`
- 后端：`services/api/.env.production`

默认环境是 `development`。如果要启动其他环境，在当前终端设置 `APP_ENV`：

```powershell
$env:APP_ENV="uat"
```

## 本地启动

### 1. 数据库

```powershell
cd D:\Bill
docker compose --env-file services/api/.env.development up -d mysql
```

### 2. 服务端

```powershell
cd D:\Bill\services\api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.run
```

### 3. 移动端 Web 调试

另开一个终端：

```powershell
cd D:\Bill\apps\mobile
npm install
npm run web
```

默认访问：

- 前端：`http://localhost:19006`
- 后端：`http://127.0.0.1:8000`
- 后端健康检查：`http://127.0.0.1:8000/health`

真机调试时，修改 `apps/mobile/.env.development` 中的 `EXPO_PUBLIC_API_HOST` 为电脑局域网 IP。
