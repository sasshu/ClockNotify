import { useState, useEffect, useRef } from "react";
import cuckooMp3 from "./assets/cuckoo.mp3";
import "./App.css";

// ex) 17:52 55
const getCurrentClock = () => {
  const date = new Date();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return {
    time: `${hour}:${minute} ${second}`,
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
};

function App() {
  const isNotificationExists = "Notification" in self;
  const [clock, setClock] = useState(getCurrentClock());
  const [canNotify, setCanNotify] = useState(
    isNotificationExists && Notification.permission === "granted"
  );
  const [intervalId, setIntervalId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(new Audio());

  // 時計を進める
  const handlePlayClick = () => {
    initializeClock();
    navigator.serviceWorker.controller?.postMessage("play");
    if (!canNotify && isNotificationExists) {
      Notification.requestPermission().then((permission) => {
        setCanNotify(permission === "granted");
      });
    }
    setIsPlaying(true);
  };

  // 時計を止める
  const handlePauseClick = () => {
    clearInterval(intervalId);
    navigator.serviceWorker.controller?.postMessage("pause");
    setIsPlaying(false);
  };

  // 時計を初期化
  const initializeClock = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      const newId = window.setInterval(() => {
        setClock(getCurrentClock());
      }, 1000);
      setIntervalId(newId);
    }, 1000 - new Date().getUTCMilliseconds());

    setIsLoading(false);
  };

  useEffect(() => {
    setClock(getCurrentClock());

    if ("serviceWorker" in navigator) {
      // ServiceWorkerの登録
      navigator.serviceWorker
        .register(
          import.meta.env.MODE === "production"
            ? "./sw.js"
            : "/dev-sw.js?dev-sw",
          {
            type: import.meta.env.MODE === "production" ? "classic" : "module",
          }
        )
        .catch(() => {
          console.error("ServiceWorker registration failed");
        });
      // ServiceWorkerからメッセージを受信
      // 音はクライアント側でのみ再生可能
      navigator.serviceWorker.onmessage = (event) => {
        if (event.data === "play-sound") {
          audioRef.current?.play();
        } else if (event.data === "check-connection") {
          console.log("ServiceWorker connected");
        }
      };
    }
  }, []);

  return (
    <>
      {isNotificationExists && (
        <>
          <p>1時間ごとにデスクトップ通知を送ります。</p>
          {!isPlaying && <p>時計の停止中、通知は届きません。</p>}
          {isPlaying && (
            <p>次の通知は{clock.hour === 23 ? 0 : clock.hour + 1}時です。</p>
          )}
          {!canNotify && (
            <p>
              ※通知を受け取るには、サイトの設定から通知をオンにする必要があります。
            </p>
          )}
        </>
      )}
      <h1 className="clock">{clock.time}</h1>

      <audio ref={audioRef} src={cuckooMp3}></audio>
      {!isPlaying && (
        <button
          className="audio-button"
          onClick={handlePlayClick}
          disabled={isLoading}
          title="時計を進める"
        >
          <div className="play-icon"></div>
        </button>
      )}
      {isPlaying && (
        <button
          className="audio-button"
          onClick={handlePauseClick}
          disabled={isLoading}
          title="時計を止める"
        >
          <div className="pause-icon"></div>
        </button>
      )}
    </>
  );
}

export default App;
