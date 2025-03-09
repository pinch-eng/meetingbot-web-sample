import React, { useState } from 'react';
import './App.css';
import ZoomMeeting from './components/ZoomMeeting';

function App() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeeting = () => {
    if (meetingUrl) {
      setIsJoining(true);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Zoom 会议助手</h1>
      </header>
      <main>
        {!isJoining ? (
          <div className="meeting-container">
            <div className="form-group">
              <label htmlFor="meeting_url">Zoom 会议链接:</label>
              <input
                type="text"
                id="meeting_url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="输入 Zoom 会议链接"
              />
            </div>
            <button onClick={handleJoinMeeting}>加入会议</button>
          </div>
        ) : (
          <ZoomMeeting meetingUrl={meetingUrl} onLeave={() => setIsJoining(false)} />
        )}
      </main>
    </div>
  );
}

export default App; 