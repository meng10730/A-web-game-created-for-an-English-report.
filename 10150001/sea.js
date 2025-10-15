// -------------------- 背景影片 --------------------
const skyVideo = document.getElementById("skyVideo");
skyVideo.src = "./sky.mp4";
skyVideo.loop = true;
skyVideo.muted = true;
skyVideo.play().catch(() => {});

const oceanVideo = document.getElementById("oceanVideo");
oceanVideo.src = "./0002.mp4";
oceanVideo.loop = true;
oceanVideo.play().catch(() => {});

// -------------------- 音樂與音效 --------------------
const introMusic = new Audio("./intro.mp3");
introMusic.loop = true;
introMusic.volume = 0.3;

const bgMusic = new Audio("./sea.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.7;

const startSound = new Audio("./click.mp3");
startSound.volume = 0.7;

const catchSound = document.getElementById("catchSound");
catchSound.volume = 0.6;

// -------------------- 遊戲畫布 --------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");
const finalScore = document.getElementById("finalScore");
const scoreBoard = document.getElementById("scoreBoard");
const timerDisplay = document.getElementById("timer");
const topWordsDisplay = document.getElementById("topWords");

const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const restartGameBtn = document.getElementById("restartGameBtn");
const muteBtn = document.getElementById("muteBtn");

// -------------------- 全域變數 --------------------
const words = [
  { eng: "Oil Spill", zh: "石油洩漏" },
  { eng: "Mermaid", zh: "美人魚" },
  { eng: "Ecological Damage", zh: "生態破壞" },
  { eng: "Endangered Species", zh: "瀕危物種" },
  { eng: "Plankton", zh: "浮游生物" },
  { eng: "Lobster", zh: "龍蝦" },
  { eng: "Fishing Net", zh: "漁網" },
  { eng: "Atoll", zh: "環礁" },
  { eng: "Currents", zh: "洋流" },
  { eng: "Coral", zh: "珊瑚礁" },
];

let fallingWords = [];
let fishes = [];
let floatingTranslations = [];
let score = 0;
let missedCount = 0;
let isPaused = false;
let isGameRunning = false;
let wordCount = {};
let timeLeft = 60;
let timerInterval = null;

const player = { x: 0, y: 0, width: 200, height: 120, speed: 8, moveLeft: false, moveRight: false, facingRight: false };

const boatImg = new Image();
boatImg.src = "./boat1008.png";
const pauseImage = new Image();
pauseImage.src = "./0001.png";

// 7 張魚圖片
const fishImages = [];
for (let i = 1; i <= 7; i++) {
  const img = new Image();
  img.src = `fish${i}.png`;
  fishImages.push(img);
}

// -------------------- 畫布大小 --------------------
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// -------------------- 使用者第一次點擊播放 Intro 音樂 --------------------
let introStarted = false;
document.body.addEventListener("click", () => {
  if (!introStarted) {
    introMusic.play().catch(() => {});
    introStarted = true;
  }
}, { once: true });

// -------------------- 遊戲控制函數 --------------------
function startGame() {
  timeLeft = 40;
  timerDisplay.style.color = "white";
  timerDisplay.textContent = "剩餘時間：" + timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused && isGameRunning) {
      timeLeft--;
      timerDisplay.textContent = "剩餘時間：" + timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }
  }, 1000);

  isPaused = false;
  isGameRunning = true;
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  resetGame();

  startSound.currentTime = 0;
  startSound.play().catch(() => {});

  introMusic.pause();
  introMusic.currentTime = 0;

  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => console.log("瀏覽器阻擋自動播放"));
}

function resetGame() {
  score = 0;
  missedCount = 0;
  fallingWords = [];
  fishes = [];
  floatingTranslations = [];
  wordCount = {};
  player.x = canvas.width / 2;
  player.y = canvas.height * 0.35;
  player.facingRight = false;
  scoreBoard.textContent = "分數：" + score;
  topWordsDisplay.innerHTML = "";
  for (let i = 0; i < 20; i++) spawnFish();
}

function gameOver() {
  isGameRunning = false;
  clearInterval(timerInterval);

  endScreen.classList.remove("hidden");
  finalScore.textContent = `你的分數：${score}`;

  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedWords.length > 0) {
    const topWords = sortedWords.map(([eng, count]) => {
  const wordObj = words.find(item => item.eng === eng);
  const zh = wordObj ? wordObj.zh : "（無翻譯）";
  return `${eng}（${zh}）：${count} 次`;
}).join("<br>");
topWordsDisplay.innerHTML = topWords;

  } else {
    topWordsDisplay.innerHTML = "你沒有抓到任何單字！";
  }
}

// -------------------- 生成單字與魚 --------------------
function spawnWord() {
  if (Math.random() < 0.004) {
    const word = words[Math.floor(Math.random() * words.length)];
    fallingWords.push({
      text: word.eng,
      zh: word.zh,
      x: Math.random() * (canvas.width - 100),
      y: -50,
      speed: 2 + Math.random()
    });
  }
}

function spawnFish() {
  const img = fishImages[Math.floor(Math.random() * fishImages.length)];
  const baseSize = 60 + Math.random() * 40;
  fishes.push({
    x: Math.random() * canvas.width,
    y: canvas.height * (0.55 + Math.random() * 0.4),
    size: baseSize,
    speed: (Math.random() * 1 + 2) * (Math.random() < 0.5 ? 1 : -1),
    heldWords: [],
    img: img
  });
}

// -------------------- 玩家控制 --------------------
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") { player.moveLeft = true; player.facingRight = false; }
  if (e.key === "ArrowRight") { player.moveRight = true; player.facingRight = true; }
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") player.moveLeft = false;
  if (e.key === "ArrowRight") player.moveRight = false;
});

// 空白鍵暫停/繼續
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!isGameRunning) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️ 繼續" : "⏸ 暫停";

    if (isPaused) {
      bgMusic.pause();
      introMusic.pause();
    } else {
      if (!muted) {
        bgMusic.play().catch(() => {});
        introMusic.play().catch(() => {});
      }
    }
  }
});

// -------------------- 按鈕事件 --------------------
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartToMenu);
restartGameBtn.addEventListener("click", restartToMenu);

function restartToMenu() {
  isGameRunning = false;
  isPaused = false;
  clearInterval(timerInterval);

  bgMusic.pause();
  introMusic.currentTime = 0;
  introMusic.play().catch(() => {});

  startScreen.classList.remove("hidden");
  endScreen.classList.add("hidden");

  score = 0;
  missedCount = 0;
  wordCount = {};
  scoreBoard.textContent = "分數：" + score;
  timerDisplay.textContent = "剩餘時間：60";
}

// 🔇 靜音控制
let muted = false;
muteBtn.addEventListener("click", () => {
  muted = !muted;
  introMusic.muted = muted;
  bgMusic.muted = muted;
  catchSound.muted = muted;
  startSound.muted = muted;
  muteBtn.textContent = muted ? "🔊 開啟聲音" : "🔇 靜音";
});

// -------------------- 遊戲邏輯 --------------------
function update() {
  if (!isGameRunning || isPaused) return;

  if (player.moveLeft) player.x -= player.speed;
  if (player.moveRight) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  spawnWord();

  for (let i = fallingWords.length - 1; i >= 0; i--) {
    let w = fallingWords[i];
    w.y += w.speed;

    if (
      w.y + 40 > player.y &&
      w.y < player.y + player.height &&
      w.x + 60 > player.x &&
      w.x < player.x + player.width
    ) {
      score += 3;
      scoreBoard.textContent = "分數：" + score;
      catchSound.currentTime = 0;
      catchSound.play().catch(() => {});
      floatingTranslations.push({ text: w.text, zh: w.zh, x: w.x, y: w.y, timer: 0 });
      wordCount[w.text] = (wordCount[w.text] || 0) + 1;
      fallingWords.splice(i, 1);
      continue;
    }

    if (w.y > canvas.height) {
      const f = fishes.find(f => f.heldWords.length < 3);
      if (f) {
        f.heldWords.push({ text: w.text, zh: w.zh, timer: 0 });
      } else {
        missedCount++;
      }
      fallingWords.splice(i, 1);
    }
  }

  fishes.forEach(f => {
    f.x += f.speed;
    if (f.x < -f.size) f.x = canvas.width + f.size;
    if (f.x > canvas.width + f.size) f.x = -f.size;

    for (let i = f.heldWords.length - 1; i >= 0; i--) {
      let w = f.heldWords[i];
      w.timer++;
      if (w.timer > 180) {
        score -= 2;
        scoreBoard.textContent = "分數：" + score;
        f.heldWords.splice(i, 1);
      }
    }
  });

  floatingTranslations.forEach(ft => ft.timer++);
  floatingTranslations = floatingTranslations.filter(ft => ft.timer < 60);

  if (missedCount >= 10 || score <= -10) gameOver();
}

// -------------------- 畫面繪製 --------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 玩家船
  if (boatImg.complete) {
    ctx.save();
    if (player.facingRight) { ctx.translate(player.x + player.width / 2, 0); ctx.scale(-1, 1); }
    ctx.drawImage(boatImg, player.facingRight ? -player.width / 2 : player.x, player.y, player.width, player.height);
    ctx.restore();
  }

  // 掉落的單字
  fallingWords.forEach(w => {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(w.text, w.x, w.y);
  });

  // 魚與單字
  fishes.forEach(f => {
    ctx.save();
    if (f.img.complete) {
      const ratio = f.img.naturalWidth / f.img.naturalHeight;
      const drawWidth = f.size;
      const drawHeight = f.size / ratio;

      if (f.speed < 0) {
        ctx.translate(f.x, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(f.img, -drawWidth / 2, f.y - drawHeight / 2, drawWidth, drawHeight);
      } else {
        ctx.drawImage(f.img, f.x - drawWidth / 2, f.y - drawHeight / 2, drawWidth, drawHeight);
      }
    }

    // 魚上方的單字
    f.heldWords.forEach((w, i) => {
      ctx.fillStyle = "yellow";
      ctx.font = "18px Arial";
      const textX = f.x - ctx.measureText(w.text).width / 2;
      const textY = f.y - 20 - i * 20;
      w.screenX = textX;
      w.screenY = textY;
      ctx.fillText(w.text, textX, textY);
    });
    ctx.restore();
  });

  // 漂浮的翻譯字
  floatingTranslations.forEach(ft => {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(ft.text, ft.x, ft.y - 10);
    ctx.fillStyle = "yellow";
    ctx.fillText(ft.zh, ft.x, ft.y + 10);
  });

  // 暫停畫面
  if (isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pauseImage.complete) {
      const imgWidth = 800, imgHeight = 600;
      ctx.drawImage(pauseImage, canvas.width / 2 - imgWidth / 2, canvas.height / 2 - imgHeight / 2, imgWidth, imgHeight);
    }
  }
}

// -------------------- 遊戲循環 --------------------
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// -------------------- 點擊魚身單字 --------------------
canvas.addEventListener("click", (e) => {
  if (!isGameRunning || isPaused) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  fishes.forEach(f => {
    f.heldWords.forEach((w, idx) => {
      const wordWidth = ctx.measureText(w.text).width;
      const wordHeight = 18;
      if (
        mouseX >= w.screenX && mouseX <= w.screenX + wordWidth &&
        mouseY >= w.screenY - wordHeight && mouseY <= w.screenY
      ) {
        score += 3;
        scoreBoard.textContent = "分數：" + score;
        catchSound.currentTime = 0;
        catchSound.play().catch(() => {});
        floatingTranslations.push({ text: w.text, zh: w.zh, x: w.screenX, y: w.screenY, timer: 0 });
        wordCount[w.text] = (wordCount[w.text] || 0) + 1;
        f.heldWords.splice(idx, 1);
      }
    });
  });
});



