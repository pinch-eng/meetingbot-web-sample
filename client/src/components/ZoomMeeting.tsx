import React, { useEffect, useState } from 'react';
import { ZoomMtg } from '@zoomus/websdk';
import axios from 'axios';

// 导入 Zoom CSS
import '@zoomus/websdk/dist/css/bootstrap.css';
import '@zoomus/websdk/dist/css/react-select.css';

interface ZoomMeetingProps {
  meetingUrl: string;
  onLeave: () => void;
}

// 从 URL 中提取会议号和密码
const getMeetingNumberAndPasswordFromUrl = (url: string): { meetingNumber: string; password: string } => {
  try {
    // 处理 URL 格式: https://zoom.us/j/1234567890?pwd=abcdef
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const meetingNumber = pathParts[pathParts.length - 1];
    
    // 从查询参数中获取密码
    const params = new URLSearchParams(urlObj.search);
    const password = params.get('pwd') || '';
    
    return { meetingNumber, password };
  } catch (error) {
    console.error('解析会议 URL 时出错:', error);
    return { meetingNumber: '', password: '' };
  }
};

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({ meetingUrl, onLeave }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeZoom = async () => {
      try {
        // 初始化 Zoom SDK
        ZoomMtg.setZoomJSLib('https://source.zoom.us/3.1.6/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        
        // 设置语言
        ZoomMtg.i18n.load('zh-CN');
        ZoomMtg.i18n.reload('zh-CN');

        // 解析会议 URL
        const { meetingNumber, password } = getMeetingNumberAndPasswordFromUrl(meetingUrl);
        
        if (!meetingNumber) {
          setError('无效的会议链接');
          setLoading(false);
          return;
        }

        // 获取签名
        const response = await axios.post('/api/zoom/msig', {
          meetingNumber,
          role: 0, // 0 表示参与者
        });

        const { signature } = response.data;

        // 加入会议
        ZoomMtg.init({
          leaveUrl: window.location.origin,
          success: () => {
            ZoomMtg.join({
              signature,
              meetingNumber,
              passWord: password, // 注意：这里是 passWord 而不是 password
              userName: '会议助手',
              sdkKey: process.env.REACT_APP_ZOOM_SDK_KEY || '',
              userEmail: '',
              success: () => {
                setLoading(false);
                console.log('加入会议成功');
                
                // 自动加入音频 - 使用 Zoom SDK 3.1.6 的正确方法
                setTimeout(() => {
                  // 注意：在 3.1.6 版本中，这个方法可能不可用，我们需要使用其他方法
                  try {
                    // 尝试使用 Zoom SDK 的方法自动加入音频
                    const audioBtn = document.querySelector('.join-audio-by-voip__join-btn');
                    if (audioBtn && audioBtn instanceof HTMLElement) {
                      audioBtn.click();
                    }
                  } catch (e) {
                    console.error('自动加入音频失败:', e);
                  }
                }, 2000);
              },
              error: (error: any) => {
                setLoading(false);
                setError(`加入会议失败: ${error.errorMessage}`);
                console.error('加入会议失败:', error);
              }
            });
          },
          error: (error: any) => {
            setLoading(false);
            setError(`初始化 Zoom 失败: ${error.errorMessage}`);
            console.error('初始化 Zoom 失败:', error);
          }
        });

        // 设置离开会议的处理函数
        ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data: any) => {
          if (data.meetingStatus === 3) { // 3 表示会议已结束
            onLeave();
          }
        });
      } catch (error: any) {
        setLoading(false);
        setError(`发生错误: ${error.message}`);
        console.error('Zoom 会议错误:', error);
      }
    };

    initializeZoom();

    // 清理函数
    return () => {
      try {
        ZoomMtg.leaveMeeting({});
      } catch (error) {
        console.error('离开会议时出错:', error);
      }
    };
  }, [meetingUrl, onLeave]);

  if (loading) {
    return <div>正在加载会议...</div>;
  }

  if (error) {
    return (
      <div>
        <p>错误: {error}</p>
        <button onClick={onLeave}>返回</button>
      </div>
    );
  }

  return (
    <div>
      <div id="zmmtg-root"></div>
    </div>
  );
};

export default ZoomMeeting; 