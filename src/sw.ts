let intervalId = 0;
let currentHour = 0;
const channel = new BroadcastChannel("sound-connection");
const self = globalThis as unknown as ServiceWorkerGlobalScope;

// 通知をセット
const setNotification = async () => {
  if ("Notification" in self && Notification.permission === "granted") {
    await postNotification();
  }
};
// 通知を送信
const postNotification = async () => {
  self.registration.showNotification("ClockNotify", {
    body: `${currentHour}時になりました。`,
    icon: "/logo.png",
    tag: "hourlyNotification",
  });
  channel.postMessage("play-sound");
};
self.addEventListener("install", () => {
  console.log("ServiceWorker installed");
  self.skipWaiting();
});
// クライアントからメッセージを受信
self.addEventListener("message", (event) => {
  if (event.data === "play") {
    self.setTimeout(() => {
      intervalId = self.setInterval(async () => {
        const current = new Date();
        // Draft: 1時間間隔以外での通知も対応できるよう、1分単位のインターバルを登録
        if (current.getMinutes() === 0 && current.getSeconds() === 0) {
          currentHour = current.getHours();
          await setNotification();
        }
        // 5分おきにクライアントとの接続確認
        if (current.getMinutes() % 5 === 0 && current.getSeconds() === 0) {
          channel.postMessage("check-connection");
        }
      }, 1000);
    }, 1000 - new Date().getUTCMilliseconds());
  } else if (event.data === "pause") {
    self.clearInterval(intervalId);
    intervalId = 0;
  }
});
