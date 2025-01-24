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
  const [clock, setClock] = useState(getCurrentClock());
  const [canNotify, setCanNotify] = useState(
    Notification.permission === "granted"
  );
  const [intervalId, setIntervalId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState({});
  const audioRef = useRef(new Audio());
  const channel = new BroadcastChannel("sound-connection");

  // 時計を進める
  const handlePlayClick = () => {
    initializeClock();
    (registration as ServiceWorkerRegistration).active?.postMessage("play");
  };

  // 時計を止める
  const handlePauseClick = () => {
    clearInterval(intervalId);
    setIntervalId(0);
    (registration as ServiceWorkerRegistration).active?.postMessage("pause");
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

    if (!canNotify) {
      Notification.requestPermission().then((permission) => {
        setCanNotify(permission === "granted");
      });
    }

    if ("serviceWorker" in navigator) {
      // ServiceWorkerの登録
      navigator.serviceWorker
        .register("/sw.ts")
        .then((registration) => {
          setRegistration(registration);
          // handlePlayClick(registration);
        })
        .catch(() => {
          console.error("ServiceWorker registration failed");
        });
      // ServiceWorkerからメッセージを受信
      // 音はクライアント側でのみ再生可能
      channel.onmessage = (event) => {
        // console.log("Received", event.data);
        if (event.data === "play-sound") {
          audioRef.current?.play();
        }
      };

      // アプリのアンロード時にService Workerの時計を停止
      onbeforeunload = () => {
        navigator.serviceWorker.controller?.postMessage("stop");
      };
    }
  }, []);

  return (
    <>
      <p>1時間ごとにデスクトップ通知を送ります。</p>
      {intervalId == 0 && <p>時計の停止中、通知は届きません。</p>}
      {intervalId !== 0 && (
        <p>次の通知は{clock.hour === 23 ? 0 : clock.hour + 1}時です。</p>
      )}
      {!canNotify && (
        <p>
          ※通知を受け取るには、サイトの設定から通知をオンにする必要があります。
        </p>
      )}
      <h1 className="clock">{clock.time}</h1>

      <audio ref={audioRef} src={cuckooMp3}></audio>
      {intervalId == 0 && (
        <button
          className="audio-button"
          onClick={handlePlayClick}
          disabled={isLoading}
          title="時計を進める"
        >
          <div className="play-icon"></div>
        </button>
      )}
      {intervalId !== 0 && (
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
