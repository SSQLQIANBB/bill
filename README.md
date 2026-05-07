# Bill

智能记账 App 项目骨架，前端使用 React Native/Expo，服务端使用 FastAPI，数据库使用 MySQL。

## 目录

- `apps/mobile`: React Native App，支持 Android/iOS。
- `services/api`: FastAPI 服务，提供微信授权登录、手机号验证码登录等接口。
- `docker-compose.yml`: 本地 MySQL。

## 本地启动

### 1. 数据库

```bash
docker compose up -d mysql
```

### 2. 服务端

```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 移动端

```bash
cd apps/mobile
npm install
npm run start
```

在真机调试时，将 `apps/mobile/src/services/api.ts` 中的 `API_BASE_URL` 调整为电脑局域网 IP。
