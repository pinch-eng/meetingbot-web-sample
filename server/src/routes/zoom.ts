import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { joinZoomMeeting, checkMeetingStatus } from '../controllers/zoomController';

const router = express.Router();

// 从环境变量获取 Zoom SDK 凭证
const SDK_KEY = process.env.ZOOM_SDK_KEY || '';
const SDK_SECRET = process.env.ZOOM_SDK_SECRET || '';

// 生成签名
router.post('/msig', (req: Request, res: Response) => {
  try {
    const { meetingNumber, role } = req.body;
    
    // 检查必要参数
    if (!meetingNumber || role === undefined) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(SDK_KEY + meetingNumber + timestamp + role).toString('base64');
    const hash = crypto.createHmac('sha256', SDK_SECRET).update(msg).digest('base64');
    const signature = Buffer.from(`${SDK_KEY}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');

    return res.json({ signature });
  } catch (error: any) {
    console.error('生成签名时出错:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
});

// 加入会议
router.post('/join', joinZoomMeeting);

// 检查会议状态
router.get('/status', checkMeetingStatus);

// 获取 ZAK 令牌的端点 (需要实现)
router.get('/hzak', (req: Request, res: Response) => {
  // 这需要 Zoom OAuth 集成
  res.json({ zakToken: '' });
});

// 获取会议详情的端点 (需要实现)
router.get('/mnum', (req: Request, res: Response) => {
  // 这需要 Zoom API 集成
  res.json({ meetingNumber: '', password: '' });
});

export default router; 