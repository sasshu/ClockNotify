import { useState, useEffect, useRef } from "react";
import logo from "/logo.png";
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
  const audioRef = useRef(new Audio());

  // const playCuckoo = () => {
  //   audioRef.current?.play();
  // };

  const handlePlayClick = () => {
    initializeClock();
  };

  const handlePauseClick = () => {
    clearInterval(intervalId);
    setIntervalId(0);
  };

  const initializeClock = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newId = setInterval(() => {
        const currentClock = getCurrentClock();
        setClock(currentClock);
        if (currentClock.minute == 19 && currentClock.second == 0) {
          new Notification("ClockNotify", {
            body: `${currentClock.hour}時になりました。`,
            icon: logo,
            tag: "hourlyNotification",
          });
          audioRef.current?.play();
        }
      }, 1000);
      setIntervalId(newId);
      setIsLoading(false);
    }, 1000 - new Date().getUTCMilliseconds());
  };

  useEffect(() => {
    setClock(getCurrentClock());

    if (!canNotify) {
      Notification.requestPermission().then((permission) => {
        setCanNotify(permission === "granted");
      });
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

      {/* <button onClick={playCuckoo}>音を鳴らす</button> */}
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
