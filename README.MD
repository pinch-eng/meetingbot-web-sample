# Zoom 会议助手

这是一个使用 TypeScript、React 和 Express 构建的 Zoom 会议助手应用程序。它允许用户通过输入 Zoom 会议链接来加入会议，并提供自动化功能，如自动加入音频。

## 功能

- 通过 URL 加入 Zoom 会议
- 自动加入音频
- 使用 Puppeteer 进行浏览器自动化
- 响应式设计

## 技术栈

### 前端
- React
- TypeScript
- Zoom Web SDK
- Axios

### 后端
- Node.js
- Express
- TypeScript
- Puppeteer (浏览器自动化)

## 项目结构

```
meetingbot-web-sample/
├── client/                  # React 前端
│   ├── public/
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # 自定义 React Hooks
│   │   ├── services/        # API 服务
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server/                  # Express 后端
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── routes/          # 路由
│   │   ├── services/        # 服务
│   │   ├── types/           # TypeScript 类型
│   │   ├── utils/           # 工具函数
│   │   ├── helpers/         # 助手函数 (包括 meetingBot)
│   │   └── index.ts         # 入口文件
│   ├── package.json
│   └── tsconfig.json
└── package.json             # 根项目配置
```

## 安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/meetingbot-web-sample.git
cd meetingbot-web-sample
```

2. 安装依赖
```bash
npm run install-all
```

3. 创建环境变量文件
```bash
cp .env.example .env
```

4. 编辑 `.env` 文件，添加你的 Zoom SDK 凭证

## 开发

1. 启动开发服务器
```bash
npm run dev
```

这将同时启动前端和后端服务器：
- 前端: http://localhost:3000
- 后端: http://localhost:30015

## 构建

```bash
npm run build
```

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
NODE_ENV=production npm run server
```

## Zoom SDK 设置

1. 访问 [Zoom Developer Portal](https://marketplace.zoom.us/)
2. 创建一个 SDK 应用
3. 获取 SDK Key 和 Secret
4. 在 `.env` 文件中设置这些凭证

## 注意事项

- 确保你的 Zoom SDK 应用已正确配置
- 浏览器自动化需要 Chrome/Chromium 浏览器
- 在某些环境中，可能需要调整 Puppeteer 的配置

## 许可证

MIT


