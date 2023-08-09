import React from 'react';
import './App.css';

export default function App() {
  const [mediaStream, setMediaStream] = React.useState(null);
  const [mediaRecorder, setMediaRecorder] = React.useState(null);
  const [recordedBlob, setRecordedBlob] = React.useState(null);
  
  const mediaRef = React.useRef(null);
  const recordingRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const constraints = {audio: true, video: true,};
  
  const createMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaRef.current.srcObject = stream;
      setMediaStream(stream);
      handleRecording(stream);
    }
    catch(err) {
      console.log(err)
    }
  };

  const closeMediaStream = () => {
    if (mediaStream !== null) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      closeRecording();
    }
  };

  const handleRecording = (stream) => {
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: 'video/webm'});
      const url = URL.createObjectURL(blob);
      recordingRef.current.src = url;
      chunksRef.current = [];
      setRecordedBlob(blob);
      console.log('stopped')
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    console.log({recorder})
  };

  const closeRecording = () => {
    if(mediaRecorder !== null) {
      mediaRecorder.stop();
    }
  };

  const handleStartPlayback = () => {
    if (recordingRef.current && recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      recordingRef.current.src = url;
      recordingRef.current.play();
    }
  };

  return (
    <div className="App">
      <h1>Meeting Minutes</h1>
      <div className="content">
        <button onClick={mediaStream !== null ? closeMediaStream : createMediaStream}>{mediaStream !== null ? 'Stop' : 'Start'}</button>
        {recordedBlob !== null && <button onClick={handleStartPlayback}>play</button>}
      </div>
      <div className="content">
        <video className="video" ref={mediaRef} autoPlay playsInline />
        <video className="video" ref={recordingRef} playsInline controls />
      </div>
    </div>
  );
}
