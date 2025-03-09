ZoomMtg.setZoomJSLib('https://source.zoom.us/3.1.6/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')


var authEndpoint = "http://localhost:30015/api/zoom/msig";
var zakEndpoint = "http://localhost:30015/api/zoom/hzak";
var meetingDetailsEndpoint = "http://localhost:30015/api/zoom/mnum";

var sdkKey = "veiZs5bwRdCuJ6UdI64D6Q";

// 移除硬编码的 URL
// var url = "https://us05web.zoom.us/j/87187828120?pwd=pLQJGSqqLRRCXXeuAlnh7ElzPiQa2D.1";

// 初始化变量
var meetingNumber = "";
var passWord = "";

// -----------------------------------
var role = 0; // 1 for host; 0 for attendee or webinar
var userName = "AI Translator";

var getlocalRecordingToken = "";

var registrantToken = ''
var zakToken = ''
var leaveUrl = "https://zoom.us"


function getSignature() {
  // 从输入框获取 URL
  var url = document.getElementById('meeting_url').value;
  
  if (!url) {
    alert('请输入 Zoom 会议链接');
    return;
  }
  
  try {
    var { meetingNumber: mNum, password: pwd } = getMeetingNumberAndPasswordFromUrl(url);
    meetingNumber = mNum;
    passWord = pwd;
    
    console.log(meetingNumber, passWord);
    
    if (!meetingNumber || !passWord) {
      alert('无效的 Zoom 会议链接，请检查后重试');
      return;
    }
    
    fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meetingNumber: meetingNumber,
        role: role
      })
    }).then((response) => {
      return response.json()
    }).then((data) => {
      console.log(data)
      startMeeting(data.signature)
    }).catch((error) => {
      console.log(error)
      alert('获取签名失败，请重试');
    })
  } catch (error) {
    console.error('解析会议链接时出错:', error);
    alert('无效的 Zoom 会议链接，请检查后重试');
  }
}


function startMeeting(signature) {

  document.getElementById('zmmtg-root').style.display = 'block'

  ZoomMtg.init({
    leaveUrl: leaveUrl,
    disablePreview: true, // Add this line
    success: (success) => {
      console.log(success)
      ZoomMtg.join({
        signature: signature,
        sdkKey: sdkKey,
        meetingNumber: meetingNumber,
        passWord: passWord,
        userName: userName,
        tk: registrantToken,
        zak: zakToken,
        success: handleJoinSuccess,
        error: handleLeaveError,
        
      })
    },
    error: (error) => {
      console.log(error)
    }
  })
}

// ------------- Bot Helper functions ------------------//
function handleJoinAudioClick() {
  var buttonFound = false;

  var t = setInterval(function () {
    var startButton = document.getElementsByClassName(
      "join-audio-by-voip__join-btn"
    )[0];

    if (startButton && !startButton.disabled) {
      console.log("Frontend: button not found");
      buttonFound = true;
      startButton.click();
    }

    var startButton = document.getElementsByClassName(
      "join-audio-by-voip__join-btn"
    )[0];

    console.log("Frontend: button found");

    if (startButton == null && buttonFound) {
      clearInterval(t);
    }
  }, 500);
}

function handleDisableVideoClick() {
  var buttonFound = false;

  var startButton = document.getElementsByClassName(
    "send-video-container__btn"
  )[0];

  function handleClick() {
    if (startButton && !startButton.disabled) {
      console.log("Frontend: button not found");
      buttonFound = true;
      startButton.click();
      startButton.removeEventListener("click", handleClick);
    }
  }

  if (startButton) {
    startButton.addEventListener("click", handleClick);
    console.log("Video Button found");
  }
}

function handleJoinSuccess(success) {
  console.log(success, 'join meeting success');

  // Not working has expected!
   handleJoinAudioClick();
   handleDisableVideoClick();

  startMediaCapturePermissionTimer();
  setupMediaCaptureListeners();
}

function startMediaCapturePermissionTimer() {

 
  setInterval(() => {
    requestMediaCapturePermission();
    console.log('pinging every 15 seconds');
  }, 15000);
}

function requestMediaCapturePermission() {
  ZoomMtg.mediaCapturePermission({
    operate: 'request',
    success: handleMediaCapturePermissionSuccess,
    error: handleMediaCapturePermissionError
  });
}

function handleMediaCapturePermissionSuccess(success) {
  console.log(success, 'media capture permission success');
  if (success.allow) {

    startMediaCapture();
    console.log('Media capture permission changed to ALLOW');
  } else {
    stopMediaCapture();
    console.log('Media capture permission changed to DENY');
    leaveMeetingAndHandleError();
  }
}

function handleMediaCapturePermissionError(error) {
  if (error.errorCode == '1') {
    console.log('Media capture permission Active');
    startMediaCapture();
  } else {
    console.log(error, 'media capture permission error');
  }
}

function startMediaCapture() {
  ZoomMtg.mediaCapture({ record: "start" });
}

function stopMediaCapture() {
  ZoomMtg.mediaCapture({ record: "stop" });
}
function pauseMediaCapture() {
  ZoomMtg.mediaCapture({ record: "pause" });
}

function leaveMeetingAndHandleError() {
  ZoomMtg.leaveMeeting({
    success: handleLeaveSuccess,
    error: handleLeaveError
  });
}

function handleLeaveSuccess(success) {
  console.log(success, 'Bot has left the meeting');
}

function handleLeaveError(error) {
  console.log(error, 'Bot failed to leave the meeting, use visibilityState of hidden to trigger leave');
  setupAccidentalLeaveListener(document, ZoomMtg);
}

function setupAccidentalLeaveListener(doc, zoom) {
  doc.addEventListener("visibilitychange", function() {
    if (doc.visibilityState === 'hidden') {
      zoom.leaveMeeting()
    }
  });
}

function setupMediaCaptureListeners() {
  ZoomMtg.inMeetingServiceListener('onMediaCapturePermissionChange', handleMediaCapturePermissionChange);
  ZoomMtg.inMeetingServiceListener('onMediaCaptureStatusChange', handleMediaCaptureStatusChange);
  ZoomMtg.inMeetingServiceListener('onUserLeave', handleUserLeave);
}

function handleMediaCapturePermissionChange({  allow: boolean }) {
  console.log('onMediaCapturePermissionChange --> ', boolean );
  if (boolean ) {
    startMediaCapture();
    console.log('Media capture permission changed to ALLOW');
  } else {
    console.log('Media capture permission changed to DENY');
    stopMediaCapture();
    leaveMeetingAndHandleError();
  }
}

function handleMediaCaptureStatusChange(data) {
  console.log('onMediaCaptureStatusChange --> ', data);
  const { status, userId } = data;
  
  console.log('onMediaCaptureStatusChange --> ', userId);
  // Add your logic for handling media capture status change here

  ZoomMtg.mute({ userId: userId, mute: true });
  
}

function handleUserLeave(data) {
  setupAccidentalLeaveListener(document, ZoomMtg);
  console.log(data, "Detected user left meeting, stopping recording");
}

function handleJoinError(error) {
  console.log(error);
}

//改进函数以更好地处理各种格式的 Zoom URL
function getMeetingNumberAndPasswordFromUrl(url) {
  try {
    // 处理 URL
    if (!url) {
      return {
        meetingNumber: null,
        password: null
      };
    }
    
    // 提取会议号
    let meetingNumber = null;
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    meetingNumber = pathParts[pathParts.length - 1];
    
    // 提取密码
    let password = null;
    const params = new URLSearchParams(urlObj.search);
    if (params.has('pwd')) {
      password = params.get('pwd');
    }
    
    // 确保会议号是有效的数字
    if (meetingNumber && /^\d+$/.test(meetingNumber)) {
      return {
        meetingNumber,
        password
      };
    } else {
      console.error('无效的会议号:', meetingNumber);
      return {
        meetingNumber: null,
        password: null
      };
    }
  } catch (error) {
    console.error('解析 URL 时出错:', error);
    return {
      meetingNumber: null,
      password: null
    };
  }
}