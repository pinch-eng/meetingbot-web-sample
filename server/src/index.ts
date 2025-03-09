import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import zoomRoutes from './routes/zoom';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 30015;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API 路由
app.use('/api/zoom', zoomRoutes);

// 静态文件服务 - 生产环境下提供 React 构建文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 