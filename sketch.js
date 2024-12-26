// 首先宣告玩家物件
let player1 = {
  x: 100,
  y: 200,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 330,
  currentFrame: 0,
  currentAction: 'idle',
  direction: 1,
  bullets: [],
  health: 100, // 生命值
  isAttacking: false,
  isDefending: false,
  maxHealth: 100,
  isHit: false,
  invincible: false,
  lastHitTime: 0
};

let player2 = {
  x: 800,
  y: 200,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 330,
  currentFrame: 0,
  currentAction: 'idle',
  direction: -1,
  bullets: [],
  health: 100,
  isAttacking: false,
  isDefending: false,
  maxHealth: 100,
  isHit: false,
  invincible: false,
  lastHitTime: 0
};

let sprites = {
  player1: {
    idle: {
      img: null,
      width: 24,
      height: 49,
      frames: 4
    },
    walk: {
      img: null,
      width: 34,
      height: 48,
      frames: 8
    },
    jump: {
      img: null,
      width: 39,
      height: 42,
      frames: 7
    },
    attack1: {
      img: null,
      width: 60,
      height: 144,
      frames: 14
    },
    attack2: {
      img: null,
      width: 147,
      height: 48,
      frames: 18
    },
    defend: {
      img: null,
      width: 59.3,
      height: 66,
      frames: 8
    }
  },
  player2: {
    idle: {
      img: null,
      width: 27,
      height: 56,
      frames: 4
    },
    walk: {
      img: null,
      width: 48,
      height: 46,
      frames: 8
    },
    jump: {
      img: null,
      width: 45,
      height: 54,
      frames: 8
    },
    attack1: {
      img: null,
      width: 89.7,
      height: 90,
      frames: 18
    },
    attack2: {
      img: null,
      width: 105.5,
      height: 50,
      frames: 10
    },
    defend: {
      img: null,
      width: 65.5,
      height: 64,
      frames: 12
    }
  },
  background: {
    img: null,
    width: 1000,
    height: 600
  }
};

// 添加一個全局數組來存儲傷害數字
let damageNumbers = [];

// 添加遊戲狀態變量
let gameOver = false;
let winner = null;

function setup() {
  createCanvas(1000, 600);
  frameRate(60);
  
  // 設定初始位置
  player1.x = width/4;
  player1.y = height/2;
  player2.x = (width/4) * 3;
  player2.y = height/2;
  
  // 確認精靈圖片是否載入
  console.log('Sprites loaded:', sprites);
}

function draw() {
  // 繪製背景
  if (sprites.background.img) {
    image(sprites.background.img, 0, 0, width, height);
  } else {
    background(220);
  }
  
  // 檢查遊戲是否結束
  if (gameOver) {
    displayGameOver();
    return;  // 如果遊戲結束，不執行後續的更新
  }
  
  // 檢查是否有玩家血量歸零
  if (player1.health <= 0 || player2.health <= 0) {
    gameOver = true;
    winner = player1.health <= 0 ? "Player 2" : "Player 1";
    return;
  }
  
  // 檢查按鍵輸入
  checkKeys();
  
  // 更新物理
  updatePhysics(player1);
  updatePhysics(player2);
  
  // 檢查碰撞
  checkCollisions();
  
  // 繪製角色
  drawCharacter(player1, sprites.player1);
  drawCharacter(player2, sprites.player2);
  
  // 繪製子彈 
  drawBullets(player1);
  drawBullets(player2);
  
  // 繪製生命值
  drawHealth();
  
  // 繪製傷害數字
  drawDamageNumbers();
  
  // 在最後繪製控制說明
  drawControlsGuide();
  
  if (gameOver) {
    displayGameOver();
  }
}

function preload() {
  // 載入背景圖，修改路徑到 assets/images 目錄
  sprites.background.img = loadImage('assets/12_sfback05.jpg');
  
  // 載入玩家1的精靈圖
  sprites.player1.idle.img = loadImage('all 95 49.png');
  sprites.player1.walk.img = loadImage('all 275 48.png');
  sprites.player1.jump.img = loadImage('all 275 42.png');
  sprites.player1.attack1.img = loadImage('all 835 144.png');
  sprites.player1.attack2.img = loadImage('all 2641 48.png');
  sprites.player1.defend.img = loadImage('all.png');
  
  // 載入玩家2的精靈圖
  sprites.player2.idle.img = loadImage('all 107 56.png');
  sprites.player2.walk.img = loadImage('all 387 46.png');
  sprites.player2.jump.img = loadImage('all 363 54.png');
  sprites.player2.attack1.img = loadImage('all 1615 90.png');
  sprites.player2.attack2.img = loadImage('all 1055 50.png');
  sprites.player2.defend.img = loadImage('all 787 64.png');
  
  // 在載入後檢查圖片是否成功載入
  console.log('Loading defend animations...');
}

function checkKeys() {
  // 玩家1移動控制 (WASD)
  if (!player1.isAttacking) {  
    if (keyIsDown(83)) { // S鍵 - 防禦
      player1.currentAction = 'defend';
      player1.isDefending = true;
    } else {
      player1.isDefending = false;
      if (keyIsDown(65)) { // A鍵 - 左移
        player1.x -= player1.speedX;
        player1.direction = -1;
        player1.currentAction = 'walk';
      } 
      if (keyIsDown(68)) { // D鍵 - 右移
        player1.x += player1.speedX;
        player1.direction = 1;
        player1.currentAction = 'walk';
      }
      if (keyIsDown(87) && !player1.isJumping) { // W鍵 - 跳躍
        player1.speedY = player1.jumpForce;
        player1.isJumping = true;
        player1.currentAction = 'jump';
      }
      if (!keyIsDown(65) && !keyIsDown(68) && !player1.isJumping) {
        player1.currentAction = 'idle';
      }
    }
  }

  // 玩家2移動控制 (方向鍵)
  if (!player2.isAttacking) {  
    if (keyIsDown(DOWN_ARROW)) { // 下方向鍵 - 防禦
      player2.currentAction = 'defend';
      player2.isDefending = true;
    } else {
      player2.isDefending = false;
      if (keyIsDown(LEFT_ARROW)) {
        player2.x -= player2.speedX;
        player2.direction = -1;
        player2.currentAction = 'walk';
      }
      if (keyIsDown(RIGHT_ARROW)) {
        player2.x += player2.speedX;
        player2.direction = 1;
        player2.currentAction = 'walk';
      }
      if (keyIsDown(UP_ARROW) && !player2.isJumping) {
        player2.speedY = player2.jumpForce;
        player2.isJumping = true;
        player2.currentAction = 'jump';
      }
      if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !player2.isJumping) {
        player2.currentAction = 'idle';
      }
    }
  }

  // 確保角色不會超出畫面
  player1.x = constrain(player1.x, 0, width - 50);
  player2.x = constrain(player2.x, 0, width - 50);

  // 更新動畫幀
  if (frameCount % 8 === 0) {
    // 安全地獲取幀數
    let player1Frames = sprites.player1[player1.currentAction]?.frames || sprites.player1.idle.frames;
    let player2Frames = sprites.player2[player2.currentAction]?.frames || sprites.player2.idle.frames;
    
    // 更新幀
    player1.currentFrame = (player1.currentFrame + 1) % player1Frames;
    player2.currentFrame = (player2.currentFrame + 1) % player2Frames;
  }
}

// 修改 keyPressed 函數
function keyPressed() {
  // 玩家1攻擊控制
  if (!player1.isAttacking) {
    if (key === 'f' || key === 'F') { // 基本攻擊
      console.log("Player 1 basic attack");
      shoot(player1, 'attack1');
    } else if (key === 'g' || key === 'G') { // 強力攻擊
      console.log("Player 1 power attack");
      shoot(player1, 'attack2');
    } else if (key === 'r' || key === 'R') { // 連發攻擊
      console.log("Player 1 rapid attack");
      shoot(player1, 'attack3');
    } else if (key === 't' || key === 'T') { // 範圍攻擊
      console.log("Player 1 area attack");
      shoot(player1, 'attack4');
    }
  }

  // 玩家2攻擊控制
  if (!player2.isAttacking) {
    if (keyCode === 32) { // 空白鍵 - 基本攻擊
      console.log("Player 2 basic attack");
      shoot(player2, 'attack1');
    } else if (keyCode === 16) { // Shift - 強力攻擊
      console.log("Player 2 power attack");
      shoot(player2, 'attack2');
    } else if (keyCode === 17) { // Ctrl - 連發攻擊
      console.log("Player 2 rapid attack");
      shoot(player2, 'attack3');
    } else if (keyCode === 18) { // Alt - 範圍攻擊
      console.log("Player 2 area attack");
      shoot(player2, 'attack4');
    }
  }
}

// 修改 shoot 函數
function shoot(player, attackType) {
  if (player.bullets.length < 5) {
    const attackConfigs = {
      attack1: { // 基本攻擊（黃球）
        speed: 15,
        size: 10,
        damage: 5,    // 基本攻擊傷害
        color: [255, 255, 0],
        effectSize: 30,
        recoveryTime: 300,
        bulletCount: 1,
        pattern: 'straight'
      },
      attack2: { // 強力攻擊（紅球）
        speed: 10,
        size: 20,
        damage: 10,   // 強力攻擊傷害
        color: [255, 0, 0],
        effectSize: 50,
        recoveryTime: 800,
        bulletCount: 1,
        pattern: 'heavy'
      },
      attack3: { // 連發攻擊
        speed: 12,
        size: 8,
        damage: 3,    // 連發攻擊每發傷害
        color: [0, 255, 255],
        effectSize: 25,
        recoveryTime: 600,
        bulletCount: 3,
        pattern: 'rapid'
      },
      attack4: { // 範圍攻擊
        speed: 8,
        size: 25,
        damage: 8,    // 範圍攻擊傷害
        color: [255, 0, 255],
        effectSize: 60,
        recoveryTime: 1000,
        bulletCount: 1,
        pattern: 'area'
      }
    };

    const config = attackConfigs[attackType];
    player.isAttacking = true;

    // 根據攻擊模式創建子彈
    switch (config.pattern) {
      case 'rapid':
        // 連發攻擊
        let shotsFired = 0;
        const shootInterval = setInterval(() => {
          if (shotsFired < config.bulletCount) {
            createBullet(player, config, attackType);
            shotsFired++;
          } else {
            clearInterval(shootInterval);
          }
        }, 100);
        break;

      case 'area':
        // 範圍攻擊 - 發射多個角度的子彈
        for (let angle = -30; angle <= 30; angle += 30) {
          createAngledBullet(player, config, attackType, angle);
        }
        break;

      case 'heavy':
        // 強力攻擊 - 較大��單發子彈
        createBullet(player, config, attackType);
        break;

      default:
        // 基本攻擊
        createBullet(player, config, attackType);
        break;
    }

    // 設置攻擊冷卻
    setTimeout(() => {
      player.isAttacking = false;
      if (player.currentAction === attackType) {
        player.currentAction = player.isJumping ? 'jump' : 'idle';
      }
    }, config.recoveryTime);
  }
}

// 創建一般子彈
function createBullet(player, config, attackType) {
  const bullet = {
    x: player.direction === 1 ? player.x + 50 : player.x,
    y: player.y + 30,
    speed: config.speed * player.direction,
    size: config.size,
    damage: config.damage,
    color: config.color,
    effectSize: config.effectSize,
    type: attackType,
    pattern: config.pattern,
    isExploding: false,
    currentFrame: 0,
    explosionFrame: 0,
    angle: 0
  };
  
  player.bullets.push(bullet);
  player.currentAction = attackType;
}

// 創建有角度的子彈（用於範圍攻擊）
function createAngledBullet(player, config, attackType, angle) {
  const radians = angle * Math.PI / 180;
  const bullet = {
    x: player.direction === 1 ? player.x + 50 : player.x,
    y: player.y + 30,
    speed: config.speed * player.direction,
    size: config.size,
    damage: config.damage,
    color: config.color,
    effectSize: config.effectSize,
    type: attackType,
    pattern: config.pattern,
    isExploding: false,
    currentFrame: 0,
    explosionFrame: 0,
    angle: radians
  };
  
  player.bullets.push(bullet);
  player.currentAction = attackType;
}

function drawCharacter(player, playerSprites) {
  let currentSprite = playerSprites[player.currentAction];
  
  // 如果找不到當前動作的精靈圖，回退到待機狀態
  if (!currentSprite || !currentSprite.img) {
    console.error("Missing sprite for action:", player.currentAction);
    currentSprite = playerSprites.idle;  // 回退到待機動作
    player.currentAction = 'idle';
  }

  // 計定縮放因子
  const scale_factor = 3.0; // 從 2.0 改為 3.0

  // 計算精靈圖的來源位置
  let frameWidth = currentSprite.width;
  let frameHeight = currentSprite.height;
  let sx = player.currentFrame * frameWidth;
  let sy = 0;

  try {
    push();
    imageMode(CENTER);
    
    if (player.direction === -1) {
      // 如果角色面向左邊，翻轉圖片
      translate(player.x + (frameWidth * scale_factor)/2, player.y + (frameHeight * scale_factor)/2);
      scale(-scale_factor, scale_factor);
    } else {
      translate(player.x + (frameWidth * scale_factor)/2, player.y + (frameHeight * scale_factor)/2);
      scale(scale_factor, scale_factor);
    }

    // 繪製精靈圖的指定幀
    image(
      currentSprite.img,   // 圖片來源
      0,                   // 目標 x
      0,                   // 目標 y
      frameWidth,          // 目標寬度
      frameHeight,         // 目標高度
      sx,                  // 來源 x
      sy,                  // 來源 y
      frameWidth,          // 來源寬度
      frameHeight          // 來源高度
    );
    pop();

  } catch (e) {
    console.error('Error drawing character:', e);
    // 如果繪製失敗，顯示錯誤方塊
    fill(255, 0, 0);
    rect(player.x, player.y, 50 * scale_factor, 100 * scale_factor);
  }
}

function updatePhysics(player) {
  // 用重力
  if (player.y < player.groundY) {
    player.speedY += player.gravity;
    player.isJumping = true;
  }
  
  // 更新垂直位置
  player.y += player.speedY;
  
  // 檢查是否著地
  if (player.y >= player.groundY) {
    player.y = player.groundY;
    player.speedY = 0;
    player.isJumping = false;
    if (player.currentAction === 'jump') {
      player.currentAction = 'idle';
    }
  }
  
  // 確保角色不會超出畫面範圍
  if (player.x < 0) {
    player.x = 0;
  }
  if (player.x > width - 50) { // 使用簡單的寬度值
    player.x = width - 50;
  }
  
  
}

function checkCollisions() {
  // 檢查玩家1的子彈
  for (let i = player1.bullets.length - 1; i >= 0; i--) {
    let bullet = player1.bullets[i];
    if (!bullet.isExploding && checkBulletHit(bullet, player2)) {
      bullet.isExploding = true;
      applyDamage(player2, bullet.damage);
    }
  }
  
  // 檢查玩家2的子彈
  for (let i = player2.bullets.length - 1; i >= 0; i--) {
    let bullet = player2.bullets[i];
    if (!bullet.isExploding && checkBulletHit(bullet, player1)) {
      bullet.isExploding = true;
      applyDamage(player1, bullet.damage);
    }
  }
}

// 檢查子彈是否擊中目標
function checkBulletHit(bullet, player) {
  // 單的矩形碰撞檢測
  return bullet.x > player.x && 
         bullet.x < player.x + 50 && // 使用單的寬度值
         bullet.y > player.y && 
         bullet.y < player.y + 100;  // 使用簡單的高度值
}

// 修改 drawBullets 函數
function drawBullets(player) {
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const bullet = player.bullets[i];
    
    if (bullet.isExploding) {
      // 爆炸效果
      drawExplosion(bullet);
      if (bullet.explosionFrame > 10) {
        player.bullets.splice(i, 1);
      }
    } else {
      // 更新子彈位置
      if (bullet.angle) {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
      } else {
        bullet.x += bullet.speed;
      }

      // 繪製子彈和軌跡
      drawBulletTrail(bullet);
      
      // 檢查是否超出畫面
      if (bullet.x < -50 || bullet.x > width + 50 || 
          bullet.y < -50 || bullet.y > height + 50) {
        player.bullets.splice(i, 1);
      }
    }
  }
}

// 繪製子彈軌跡
function drawBulletTrail(bullet) {
  for (let j = 0; j < 3; j++) {
    const alpha = 255 - j * 60;
    const trailSize = bullet.size - j * 2;
    
    push();
    translate(bullet.x, bullet.y);
    if (bullet.angle) {
      rotate(bullet.angle);
    }
    
    // 根據攻擊類型繪製不同的子彈效果
    switch (bullet.pattern) {
      case 'heavy':
        drawHeavyBullet(bullet, alpha, trailSize);
        break;
      case 'rapid':
        drawRapidBullet(bullet, alpha, trailSize);
        break;
      case 'area':
        drawAreaBullet(bullet, alpha, trailSize);
        break;
      default:
        drawBasicBullet(bullet, alpha, trailSize);
    }
    pop();
  }
}

// 各種子彈效果的繪製函數
function drawBasicBullet(bullet, alpha, size) {
  fill(...bullet.color, alpha);
  noStroke();
  ellipse(0, 0, size, size);
}

function drawHeavyBullet(bullet, alpha, size) {
  fill(...bullet.color, alpha);
  noStroke();
  beginShape();
  for (let i = 0; i < 6; i++) {
    const angle = i * TWO_PI / 6;
    const x = cos(angle) * size;
    const y = sin(angle) * size;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawRapidBullet(bullet, alpha, size) {
  fill(...bullet.color, alpha);
  noStroke();
  rect(-size/2, -size/4, size, size/2);
}

function drawAreaBullet(bullet, alpha, size) {
  fill(...bullet.color, alpha);
  noStroke();
  beginShape();
  for (let i = 0; i < 5; i++) {
    const angle = i * TWO_PI / 5;
    const x = cos(angle) * size;
    const y = sin(angle) * size;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawHealth() {
  // 設定生命值的樣式
  strokeWeight(2);
  stroke(0);
  
  // 玩家1生命值 (左側)
  fill(255, 0, 0); // 紅色底色
  rect(10, 10, 100, 20); // 生命條底色
  fill(0, 255, 0); // 綠色生命值
  rect(10, 10, player1.health, 20);
  
  // 玩家1生命值文字
  fill(0);
  noStroke();
  textSize(14);
  textAlign(LEFT, CENTER);
  text(`P1: ${player1.health}`, 120, 20);
  
  // 玩家2生命值 (右側)
  fill(255, 0, 0); // 紅色底色
  stroke(0);
  rect(width - 110, 10, 100, 20); // 生命條底色
  fill(0, 255, 0); // 綠色生命值
  rect(width - 110, 10, player2.health, 20);
  
  // 玩家2生命值文字
  fill(0);
  noStroke();
  textSize(14);
  textAlign(RIGHT, CENTER);
  text(`P2: ${player2.health}`, width - 120, 20);
  
  // 重置繪圖設定
  strokeWeight(1);
  textAlign(LEFT, BASELINE);
}

function applyDamage(player, damage) {
  const currentTime = millis();
  
  // 檢查是否在無敵時間內
  if (player.invincible || currentTime - player.lastHitTime < 1000) { // 1秒無敵時間
    return;
  }

  // 更新最後受傷時間
  player.lastHitTime = currentTime;

  // 如果在防禦狀態，減少傷害
  if (player.isDefending) {
    damage = Math.floor(damage * 0.3); // 防禦時只受到30%傷害
  }

  // 應用傷害（確保最小傷害為1）
  const actualDamage = Math.max(1, Math.floor(damage));
  player.health = Math.max(0, player.health - actualDamage);

  // 設置無敵狀態和視覺效果
  player.invincible = true;
  player.isHit = true;

  // 受傷閃爍效果
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    player.isHit = !player.isHit;
    flashCount++;
    if (flashCount >= 3) { // 減少閃爍次數
      clearInterval(flashInterval);
      player.isHit = false;
    }
  }, 100);

  // 無敵時間結束
  setTimeout(() => {
    player.invincible = false;
  }, 1000); // 1秒無敵時間

  // 創建傷害數字
  createDamageNumber(player.x + 25, player.y, actualDamage);
}

// 創建傷害數字
function createDamageNumber(x, y, damage) {
  damageNumbers.push({
    x: x,
    y: y,
    damage: damage,
    opacity: 255,
    life: 60  // 持續時間（幀數）
  });
}

// 在 draw 函數中添加繪製傷害數字的調用
function drawDamageNumbers() {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    let dmg = damageNumbers[i];
    
    // 設置文字樣式
    fill(255, 0, 0, dmg.opacity);
    textSize(20);
    textAlign(CENTER);
    
    // 繪製傷害數字
    text(dmg.damage, dmg.x, dmg.y);
    
    // 更新位置和透明度
    dmg.y -= 1;
    dmg.opacity -= 4;
    
    // 如果生命週期結束，移除該傷害數字
    if (--dmg.life <= 0) {
      damageNumbers.splice(i, 1);
    }
  }
}

// 繪製爆炸效果
function drawExplosion(bullet) {
  // 增加爆炸幀計數
  bullet.explosionFrame++;
  
  // 計算爆炸大小（隨時間擴大然後縮小）
  let explosionSize = bullet.effectSize * (1 - bullet.explosionFrame / 10);
  
  // 設置爆炸效果的顏色和透明度
  let alpha = 255 * (1 - bullet.explosionFrame / 10);
  
  // 繪製爆炸圓環
  push();
  noFill();
  strokeWeight(3);
  
  // 內圈
  stroke(...bullet.color, alpha);
  ellipse(bullet.x, bullet.y, explosionSize * 0.5);
  
  // 中圈
  stroke(...bullet.color, alpha * 0.7);
  ellipse(bullet.x, bullet.y, explosionSize * 0.75);
  
  // 外圈
  stroke(...bullet.color, alpha * 0.4);
  ellipse(bullet.x, bullet.y, explosionSize);
  
  pop();
  
  // 添加粒子效果
  for (let i = 0; i < 5; i++) {
    let angle = random(TWO_PI);
    let distance = random(explosionSize / 2);
    let particleX = bullet.x + cos(angle) * distance;
    let particleY = bullet.y + sin(angle) * distance;
    
    push();
    fill(...bullet.color, alpha);
    noStroke();
    ellipse(particleX, particleY, 4);
    pop();
  }
}

// 添加遊戲結束畫面
function displayGameOver() {
  // 設置半透明黑色背���
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  // 設置文字樣式
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  
  // 顯示歡迎文字
  text("歡迎加入 TKUET", width/2, height/2 - 30);
  
  // 顯示獲勝者
  textSize(32);
  text(winner + " 獲勝！", width/2, height/2 + 30);
  
  // 顯示重新開始提示
  textSize(24);
  text("按下 R 鍵重新開始", width/2, height/2 + 80);
  
  // 檢查是否按下 R 鍵重新開始
  if (keyIsDown(82)) { // 82 是 R 鍵的鍵碼
    resetGame();
  }
}

// 添加重置遊戲的函數
function resetGame() {
  // 重置遊戲狀態
  gameOver = false;
  winner = null;
  
  // 重置玩家1
  player1.health = player1.maxHealth;
  player1.x = width/4;
  player1.y = height/2;
  player1.currentAction = 'idle';
  player1.isAttacking = false;
  player1.isDefending = false;
  player1.isJumping = false;
  player1.bullets = [];
  
  // 重置玩家2
  player2.health = player2.maxHealth;
  player2.x = (width/4) * 3;
  player2.y = height/2;
  player2.currentAction = 'idle';
  player2.isAttacking = false;
  player2.isDefending = false;
  player2.isJumping = false;
  player2.bullets = [];
  
  // 清空傷害數字
  damageNumbers = [];
}

function drawControlsGuide() {
  // 設置半透明黑色背景
  push();
  fill(0, 0, 0, 150);  // 黑色背景，透明度調低
  rect(10, height - 150, 200, 120, 5);  // 縮小尺寸，降低圓角
  
  // 設置文字樣式
  textAlign(LEFT);
  fill(255);  // 白色文字
  textSize(14);  // 縮小文字
  
  // 玩家1控制說明
  text("P1：WAD 移動", 20, height - 130);
  text("     F/G 攻擊", 20, height - 110);
  text("     S 防禦", 20, height - 90);
  
  // 玩家2控制說明
  text("P2：方向鍵移動", 20, height - 60);
  text("     Shift/空白鍵 攻擊", 20, height - 40);
  text("     下 防禦", 20, height - 20);
  
  pop();
}
