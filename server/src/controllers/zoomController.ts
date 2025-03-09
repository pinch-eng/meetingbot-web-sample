import { Request, Response } from 'express';
import { clickJoinMeetingButton } from '../helpers/meetingBot';

/**
 * 加入 Zoom 会议
 * @route POST /api/zoom/join
 * @access Public
 */
export const joinZoomMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingUrl } = req.body;
    
    if (!meetingUrl) {
      res.status(400).json({ error: '缺少会议 URL' });
      return;
    }
    
    // 启动自动化浏览器加入会议
    clickJoinMeetingButton(meetingUrl)
      .then(() => {
        console.log('自动化浏览器已启动');
      })
      .catch((error) => {
        console.error('启动自动化浏览器时出错:', error);
      });
    
    // 立即返回响应，因为浏览器启动是异步的
    res.status(200).json({ message: '正在加入会议...' });
  } catch (error: any) {
    console.error('加入会议时出错:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 检查会议状态
 * @route GET /api/zoom/status
 * @access Public
 */
export const checkMeetingStatus = (req: Request, res: Response): void => {
  // 这里可以实现检查会议状态的逻辑
  res.status(200).json({ status: 'unknown' });
}; 