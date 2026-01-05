// ============ 游戏菜单控制 ============
function showGame(gameName) {
    try {
        console.log('打开游戏:', gameName);
        
        // 先停止所有游戏循环
        if (typeof gameLoop !== 'undefined' && gameLoop) clearInterval(gameLoop);
        if (typeof tetrisGameLoop !== 'undefined' && tetrisGameLoop) {
            clearTimeout(tetrisGameLoop);
        }
        if (typeof breakoutGameLoop !== 'undefined' && breakoutGameLoop) {
            cancelAnimationFrame(breakoutGameLoop);
        }
        
        // 隐藏所有游戏区域
        document.querySelectorAll('.game-area').forEach(area => {
            area.classList.remove('active');
        });
        
        // 隐藏游戏菜单
        const gamesMenu = document.getElementById('gamesMenu');
        if (gamesMenu) {
            gamesMenu.style.display = 'none';
        }
        
        // 显示选中的游戏
        const gameAreaMap = {
            '2048': 'game2048',
            'snake': 'snakeGame',
            'ticTacToe': 'ticTacToe',
            'breakout': 'breakout',
            'memory': 'memoryGame',
            'tetris': 'tetris',
            'minesweeper': 'minesweeper',
            'guessNumber': 'guessNumber',
            'typing': 'typingGame'
        };
        
        const gameAreaId = gameAreaMap[gameName];
        if (!gameAreaId) {
            console.error('未知的游戏名称:', gameName);
            return;
        }
        
        const gameArea = document.getElementById(gameAreaId);
        if (!gameArea) {
            console.error('找不到游戏区域:', gameAreaId);
            return;
        }
        
        gameArea.classList.add('active');
        console.log('游戏区域已显示:', gameAreaId);
        
        // 初始化游戏
        switch(gameName) {
            case 'snake':
                if (typeof initSnake === 'function') initSnake();
                break;
            case '2048':
                if (typeof init2048 === 'function') init2048();
                break;
            case 'ticTacToe':
                if (typeof initTicTacToe === 'function') initTicTacToe();
                break;
            case 'breakout':
                if (typeof initBreakout === 'function') initBreakout();
                break;
            case 'memory':
                if (typeof initMemory === 'function') initMemory();
                break;
            case 'tetris':
                if (typeof initTetris === 'function') initTetris();
                break;
            case 'minesweeper':
                if (typeof initMinesweeper === 'function') initMinesweeper();
                break;
            case 'guessNumber':
                if (typeof initGuessNumber === 'function') initGuessNumber();
                break;
            case 'typing':
                if (typeof initTyping === 'function') initTyping();
                break;
        }
    } catch (error) {
        console.error('打开游戏时出错:', error);
        alert('打开游戏时出错: ' + error.message);
    }
}

function backToMenu() {
    // 停止所有游戏循环
    if (typeof gameLoop !== 'undefined' && gameLoop) clearInterval(gameLoop);
    if (typeof tetrisGameLoop !== 'undefined' && tetrisGameLoop) {
        clearTimeout(tetrisGameLoop);
        if (typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(tetrisGameLoop);
        }
    }
    if (typeof breakoutGameLoop !== 'undefined' && breakoutGameLoop) {
        if (typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(breakoutGameLoop);
        }
    }
    
    // 移除事件监听器
    if (typeof handleTetrisKey !== 'undefined') {
        document.removeEventListener('keydown', handleTetrisKey);
    }
    if (typeof handle2048Key !== 'undefined') {
        document.removeEventListener('keydown', handle2048Key);
    }
    if (typeof handleSnakeKey !== 'undefined') {
        document.removeEventListener('keydown', handleSnakeKey);
    }
    if (typeof handleBreakoutKey !== 'undefined') {
        document.removeEventListener('keydown', handleBreakoutKey);
    }
    
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    document.getElementById('gamesMenu').style.display = 'grid';
}

// ============ 贪吃蛇游戏 ============
let snakeCanvas, snakeCtx, snake, food, dx, dy, score, highScore, gameLoop;
let snakeSpeed = 100;
let snakeSpeedEffect = 0; // 速度效果剩余时间
let doubleScore = false; // 双倍分数效果
let foodType = 'normal'; // 食物类型: normal, speed, slow, double

function initSnake() {
    snakeCanvas = document.getElementById('snakeCanvas');
    snakeCtx = snakeCanvas.getContext('2d');
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 0;
    dy = 0;
    score = 0;
    snakeSpeed = 100;
    snakeSpeedEffect = 0;
    doubleScore = false;
    foodType = 'normal';
    highScore = localStorage.getItem('snakeHighScore') || 0;
    document.getElementById('snakeHighScore').textContent = highScore;
    
    if (gameLoop) clearInterval(gameLoop);
    
    // 移除旧的事件监听器
    document.removeEventListener('keydown', handleSnakeKey);
    document.addEventListener('keydown', handleSnakeKey);
    
    // 让canvas获取焦点，确保键盘事件正常工作
    if (snakeCanvas) {
        snakeCanvas.focus();
    }
    
    generateFood();
    gameLoop = setInterval(updateSnake, snakeSpeed);
}

function handleSnakeKey(e) {
    // 只在贪吃蛇游戏激活时响应
    const snakeArea = document.getElementById('snakeGame');
    if (!snakeArea || !snakeArea.classList.contains('active')) return;
    
    const key = e.key.toLowerCase();
    // 防止方向键选中文本和触发页面滚动
    if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright' ||
        key === 'w' || key === 's' || key === 'a' || key === 'd') {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (key === 'arrowup' || key === 'w') {
        if (dy !== 1) { dx = 0; dy = -1; }
    } else if (key === 'arrowdown' || key === 's') {
        if (dy !== -1) { dx = 0; dy = 1; }
    } else if (key === 'arrowleft' || key === 'a') {
        if (dx !== 1) { dx = -1; dy = 0; }
    } else if (key === 'arrowright' || key === 'd') {
        if (dx !== -1) { dx = 1; dy = 0; }
    }
}

function updateSnake() {
    if (dx === 0 && dy === 0) return;
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 检查碰撞
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 30 || 
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        snakeGameOver();
        return;
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        let points = 10;
        if (doubleScore) points *= 2;
        
        // 根据食物类型应用效果
        if (foodType === 'speed') {
            snakeSpeedEffect = 30; // 加速30步
            clearInterval(gameLoop);
            snakeSpeed = 50;
            gameLoop = setInterval(updateSnake, snakeSpeed);
        } else if (foodType === 'slow') {
            snakeSpeedEffect = 20; // 减速20步
            clearInterval(gameLoop);
            snakeSpeed = 150;
            gameLoop = setInterval(updateSnake, snakeSpeed);
        } else if (foodType === 'double') {
            doubleScore = true;
            setTimeout(() => { doubleScore = false; }, 10000); // 10秒双倍分数
        }
        
        score += points;
        document.getElementById('snakeScore').textContent = score;
        if (score > highScore) {
            highScore = score;
            document.getElementById('snakeHighScore').textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
    } else {
        snake.pop();
    }
    
    // 更新速度效果
    if (snakeSpeedEffect > 0) {
        snakeSpeedEffect--;
        if (snakeSpeedEffect === 0) {
            clearInterval(gameLoop);
            snakeSpeed = 100;
            gameLoop = setInterval(updateSnake, snakeSpeed);
        }
    }
    
    drawSnake();
}

function generateFood() {
    do {
        food = {x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 30)};
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    // 随机生成特殊食物（30%概率）
    const rand = Math.random();
    if (rand < 0.1) {
        foodType = 'speed'; // 加速食物
    } else if (rand < 0.2) {
        foodType = 'slow'; // 减速食物
    } else if (rand < 0.3) {
        foodType = 'double'; // 双倍分数
    } else {
        foodType = 'normal';
    }
}

function drawSnake() {
    snakeCtx.fillStyle = '#0a0e1a';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // 绘制蛇
    snakeCtx.fillStyle = '#6366f1';
    snake.forEach((segment, index) => {
        if (index === 0) {
            snakeCtx.fillStyle = '#ec4899';
        } else {
            snakeCtx.fillStyle = '#6366f1';
        }
        snakeCtx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });
    
    // 绘制食物（根据类型显示不同颜色）
    if (foodType === 'speed') {
        snakeCtx.fillStyle = '#10b981'; // 绿色 - 加速
    } else if (foodType === 'slow') {
        snakeCtx.fillStyle = '#f59e0b'; // 橙色 - 减速
    } else if (foodType === 'double') {
        snakeCtx.fillStyle = '#ec4899'; // 粉色 - 双倍分数
    } else {
        snakeCtx.fillStyle = '#06b6d4'; // 蓝色 - 普通
    }
    snakeCtx.fillRect(food.x * 20, food.y * 20, 18, 18);
    
    // 显示效果提示
    if (doubleScore) {
        snakeCtx.fillStyle = '#ec4899';
        snakeCtx.font = 'bold 16px Arial';
        snakeCtx.fillText('双倍分数！', 10, 30);
    }
    if (snakeSpeedEffect > 0 && snakeSpeed < 100) {
        snakeCtx.fillStyle = '#10b981';
        snakeCtx.font = 'bold 16px Arial';
        snakeCtx.fillText('加速中！', 10, 50);
    } else if (snakeSpeedEffect > 0 && snakeSpeed > 100) {
        snakeCtx.fillStyle = '#f59e0b';
        snakeCtx.font = 'bold 16px Arial';
        snakeCtx.fillText('减速中！', 10, 50);
    }
}

function snakeGameOver() {
    clearInterval(gameLoop);
    alert(`游戏结束！得分: ${score}`);
    resetSnake();
}

function resetSnake() {
    clearInterval(gameLoop);
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 0;
    dy = 0;
    score = 0;
    document.getElementById('snakeScore').textContent = 0;
    gameLoop = setInterval(updateSnake, 100);
}

// ============ 2048游戏 ============
let grid2048 = [];
let score2048 = 0;
let highScore2048 = 0;
let history2048 = []; // 历史记录用于撤销

function init2048() {
    grid2048 = Array(4).fill().map(() => Array(4).fill(0));
    score2048 = 0;
    history2048 = [];
    highScore2048 = parseInt(localStorage.getItem('2048HighScore')) || 0;
    document.getElementById('highScore2048').textContent = highScore2048;
    addRandomTile();
    addRandomTile();
    saveState2048();
    render2048();
    
    // 移除旧的事件监听器
    document.removeEventListener('keydown', handle2048Key);
    document.addEventListener('keydown', handle2048Key);
}

function saveState2048() {
    history2048.push({
        grid: JSON.parse(JSON.stringify(grid2048)),
        score: score2048
    });
    // 只保留最近10步
    if (history2048.length > 10) {
        history2048.shift();
    }
}

function undo2048() {
    if (history2048.length > 1) {
        history2048.pop(); // 移除当前状态
        const prevState = history2048[history2048.length - 1];
        grid2048 = JSON.parse(JSON.stringify(prevState.grid));
        score2048 = prevState.score;
        document.getElementById('score2048').textContent = score2048;
        render2048();
    }
}

function handle2048Key(e) {
    // 只在2048游戏激活时响应
    const game2048Area = document.getElementById('game2048');
    if (!game2048Area || !game2048Area.classList.contains('active')) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const moved = move2048(e.key);
        if (moved) {
            addRandomTile();
            saveState2048();
            render2048();
            if (isGameOver()) {
                setTimeout(() => alert('游戏结束！'), 100);
            }
        }
    } else if (e.key === 'u' || e.key === 'U') {
        // U键撤销
        e.preventDefault();
        undo2048();
    }
}

function move2048(direction) {
    const oldGrid = JSON.parse(JSON.stringify(grid2048));
    let moved = false;
    
    if (direction === 'ArrowLeft') {
        for (let i = 0; i < 4; i++) {
            const row = grid2048[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score2048 += row[j];
                    row[j + 1] = 0;
                }
            }
            grid2048[i] = row.filter(val => val !== 0).concat(Array(4 - row.filter(val => val !== 0).length).fill(0));
        }
    } else if (direction === 'ArrowRight') {
        for (let i = 0; i < 4; i++) {
            const row = grid2048[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    score2048 += row[j];
                    row[j - 1] = 0;
                }
            }
            const newRow = row.filter(val => val !== 0);
            grid2048[i] = Array(4 - newRow.length).fill(0).concat(newRow);
        }
    } else if (direction === 'ArrowUp') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) col.push(grid2048[i][j]);
            const filtered = col.filter(val => val !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    score2048 += filtered[i];
                    filtered[i + 1] = 0;
                }
            }
            const newCol = filtered.filter(val => val !== 0);
            for (let i = 0; i < 4; i++) {
                grid2048[i][j] = i < newCol.length ? newCol[i] : 0;
            }
        }
    } else if (direction === 'ArrowDown') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) col.push(grid2048[i][j]);
            const filtered = col.filter(val => val !== 0);
            for (let i = filtered.length - 1; i > 0; i--) {
                if (filtered[i] === filtered[i - 1]) {
                    filtered[i] *= 2;
                    score2048 += filtered[i];
                    filtered[i - 1] = 0;
                }
            }
            const newCol = filtered.filter(val => val !== 0);
            for (let i = 0; i < 4; i++) {
                grid2048[i][j] = i >= 4 - newCol.length ? newCol[i - (4 - newCol.length)] : 0;
            }
        }
    }
    
    moved = JSON.stringify(oldGrid) !== JSON.stringify(grid2048);
    if (moved) {
        document.getElementById('score2048').textContent = score2048;
        if (score2048 > highScore2048) {
            highScore2048 = score2048;
            document.getElementById('highScore2048').textContent = highScore2048;
            localStorage.setItem('2048HighScore', highScore2048);
        }
    }
    
    return moved;
}

function addRandomTile() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid2048[i][j] === 0) empty.push({i, j});
        }
    }
    if (empty.length > 0) {
        const {i, j} = empty[Math.floor(Math.random() * empty.length)];
        grid2048[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function render2048() {
    const grid = document.getElementById('grid2048');
    grid.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${grid2048[i][j]}`;
            tile.textContent = grid2048[i][j] || '';
            grid.appendChild(tile);
        }
    }
}

function isGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid2048[i][j] === 0) return false;
            if (j < 3 && grid2048[i][j] === grid2048[i][j + 1]) return false;
            if (i < 3 && grid2048[i][j] === grid2048[i + 1][j]) return false;
        }
    }
    return true;
}

function reset2048() {
    grid2048 = Array(4).fill().map(() => Array(4).fill(0));
    score2048 = 0;
    document.getElementById('score2048').textContent = 0;
    addRandomTile();
    addRandomTile();
    render2048();
}

// ============ 井字棋游戏 ============
let ticBoard = [];
let currentPlayer = 'X';
let gameOver2048 = false;

function initTicTacToe() {
    ticBoard = Array(9).fill('');
    currentPlayer = 'X';
    gameOver2048 = false;
    renderTicTacToe();
    document.getElementById('ticStatus').textContent = '轮到你了 (X)';
}

function renderTicTacToe() {
    const board = document.getElementById('ticBoard');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = `tic-cell ${ticBoard[i] ? ticBoard[i].toLowerCase() : ''} ${gameOver2048 ? 'disabled' : ''}`;
        cell.textContent = ticBoard[i];
        cell.onclick = () => makeMove(i);
        board.appendChild(cell);
    }
}

function makeMove(index) {
    if (ticBoard[index] || gameOver2048) return;
    
    ticBoard[index] = currentPlayer;
    renderTicTacToe();
    
    if (checkWinner()) {
        document.getElementById('ticStatus').textContent = `${currentPlayer} 获胜！`;
        gameOver2048 = true;
        return;
    }
    
    if (ticBoard.every(cell => cell)) {
        document.getElementById('ticStatus').textContent = '平局！';
        gameOver2048 = true;
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('ticStatus').textContent = `轮到 ${currentPlayer}`;
    
    // AI移动
    if (currentPlayer === 'O' && !gameOver2048) {
        setTimeout(() => {
            const bestMove = getBestMove();
            ticBoard[bestMove] = 'O';
            renderTicTacToe();
            
            if (checkWinner()) {
                document.getElementById('ticStatus').textContent = 'O 获胜！';
                gameOver2048 = true;
                return;
            }
            
            if (ticBoard.every(cell => cell)) {
                document.getElementById('ticStatus').textContent = '平局！';
                gameOver2048 = true;
                return;
            }
            
            currentPlayer = 'X';
            document.getElementById('ticStatus').textContent = '轮到你了 (X)';
        }, 500);
    }
}

function checkWinner() {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
        const [a, b, c] = line;
        if (ticBoard[a] && ticBoard[a] === ticBoard[b] && ticBoard[a] === ticBoard[c]) {
            return true;
        }
    }
    return false;
}

function getBestMove() {
    // 简单AI：优先阻止玩家获胜，然后尝试自己获胜，最后选择中心或角落
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    // 尝试获胜
    for (let line of lines) {
        const [a, b, c] = line;
        const values = [ticBoard[a], ticBoard[b], ticBoard[c]];
        const oCount = values.filter(v => v === 'O').length;
        const emptyIndex = line.find(i => !ticBoard[i]);
        if (oCount === 2 && emptyIndex !== undefined) return emptyIndex;
    }
    
    // 阻止玩家获胜
    for (let line of lines) {
        const [a, b, c] = line;
        const values = [ticBoard[a], ticBoard[b], ticBoard[c]];
        const xCount = values.filter(v => v === 'X').length;
        const emptyIndex = line.find(i => !ticBoard[i]);
        if (xCount === 2 && emptyIndex !== undefined) return emptyIndex;
    }
    
    // 优先选择中心
    if (!ticBoard[4]) return 4;
    
    // 选择角落
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => !ticBoard[i]);
    if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    
    // 随机选择
    const empty = [];
    for (let i = 0; i < 9; i++) {
        if (!ticBoard[i]) empty.push(i);
    }
    return empty[Math.floor(Math.random() * empty.length)];
}

function resetTicTacToe() {
    initTicTacToe();
}

// ============ 打砖块游戏 ============
let breakoutCanvas, breakoutCtx;
let paddle, ball, bricks = [];
let breakoutScore = 0, breakoutLives = 3;
let breakoutGameLoop;

function initBreakout() {
    breakoutCanvas = document.getElementById('breakoutCanvas');
    breakoutCtx = breakoutCanvas.getContext('2d');
    
    paddle = {x: breakoutCanvas.width / 2 - 75, y: breakoutCanvas.height - 30, width: 150, height: 15};
    ball = {x: breakoutCanvas.width / 2, y: breakoutCanvas.height - 50, radius: 10, dx: 4, dy: -4};
    
    bricks = [];
    const rows = 5, cols = 10;
    const brickWidth = 70, brickHeight = 20, padding = 5;
    const offsetTop = 50, offsetLeft = 35;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            bricks.push({
                x: j * (brickWidth + padding) + offsetLeft,
                y: i * (brickHeight + padding) + offsetTop,
                width: brickWidth,
                height: brickHeight,
                visible: true
            });
        }
    }
    
    breakoutScore = 0;
    breakoutLives = 3;
    document.getElementById('breakoutScore').textContent = breakoutScore;
    document.getElementById('breakoutLives').textContent = breakoutLives;
    
    breakoutCanvas.addEventListener('mousemove', movePaddle);
    breakoutCanvas.addEventListener('keydown', handleBreakoutKey);
    
    if (breakoutGameLoop) cancelAnimationFrame(breakoutGameLoop);
    updateBreakout();
}

function movePaddle(e) {
    const rect = breakoutCanvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > breakoutCanvas.width) paddle.x = breakoutCanvas.width - paddle.width;
}

function handleBreakoutKey(e) {
    if (e.key === 'ArrowLeft' && paddle.x > 0) {
        paddle.x -= 20;
    } else if (e.key === 'ArrowRight' && paddle.x + paddle.width < breakoutCanvas.width) {
        paddle.x += 20;
    }
}

function updateBreakout() {
    breakoutCtx.clearRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);
    
    // 移动球
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 墙壁碰撞
    if (ball.x + ball.radius > breakoutCanvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    // 挡板碰撞
    if (ball.y + ball.radius > paddle.y && 
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -Math.abs(ball.dy);
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
    }
    
    // 球掉落
    if (ball.y > breakoutCanvas.height) {
        breakoutLives--;
        document.getElementById('breakoutLives').textContent = breakoutLives;
        if (breakoutLives <= 0) {
            alert(`游戏结束！得分: ${breakoutScore}`);
            resetBreakout();
            return;
        }
        ball.x = breakoutCanvas.width / 2;
        ball.y = breakoutCanvas.height - 50;
        ball.dx = 4;
        ball.dy = -4;
    }
    
    // 砖块碰撞
    for (let brick of bricks) {
        if (brick.visible) {
            if (ball.x > brick.x && ball.x < brick.x + brick.width &&
                ball.y > brick.y && ball.y < brick.y + brick.height) {
                brick.visible = false;
                ball.dy = -ball.dy;
                breakoutScore += 10;
                document.getElementById('breakoutScore').textContent = breakoutScore;
                
                if (bricks.every(b => !b.visible)) {
                    alert('恭喜！你赢了！');
                    resetBreakout();
                    return;
                }
            }
        }
    }
    
    // 绘制
    drawBreakout();
    
    breakoutGameLoop = requestAnimationFrame(updateBreakout);
}

function drawBreakout() {
    // 绘制挡板
    breakoutCtx.fillStyle = '#6366f1';
    breakoutCtx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // 绘制球
    breakoutCtx.beginPath();
    breakoutCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    breakoutCtx.fillStyle = '#ec4899';
    breakoutCtx.fill();
    breakoutCtx.closePath();
    
    // 绘制砖块
    bricks.forEach(brick => {
        if (brick.visible) {
            breakoutCtx.fillStyle = '#06b6d4';
            breakoutCtx.fillRect(brick.x, brick.y, brick.width, brick.height);
            breakoutCtx.strokeStyle = '#334155';
            breakoutCtx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}

function resetBreakout() {
    initBreakout();
}

// ============ 记忆翻牌游戏 ============
let memoryCards = [];
let flippedCards = [];
let memoryMoves = 0;
let memoryMatches = 0;
let lockBoard = false;

const emojis = ['🎮', '🎯', '🎨', '🎵', '🎪', '🎭', '🎬', '🎤'];

function initMemory() {
    memoryCards = [];
    flippedCards = [];
    memoryMoves = 0;
    memoryMatches = 0;
    lockBoard = false;
    
    const pairs = [...emojis, ...emojis];
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    pairs.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        const front = document.createElement('div');
        front.className = 'card-front';
        front.textContent = '?';
        
        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = emoji;
        
        card.appendChild(front);
        card.appendChild(back);
        card.addEventListener('click', flipCard);
        
        grid.appendChild(card);
        memoryCards.push(card);
    });
    
    document.getElementById('memoryMoves').textContent = memoryMoves;
    document.getElementById('memoryMatches').textContent = memoryMatches;
}

function flipCard(e) {
    if (lockBoard) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        lockBoard = true;
        memoryMoves++;
        document.getElementById('memoryMoves').textContent = memoryMoves;
        
        const [first, second] = flippedCards;
        if (first.dataset.emoji === second.dataset.emoji) {
            first.classList.add('matched');
            second.classList.add('matched');
            memoryMatches++;
            document.getElementById('memoryMatches').textContent = memoryMatches;
            flippedCards = [];
            lockBoard = false;
            
            if (memoryMatches === 8) {
                setTimeout(() => {
                    alert(`恭喜！你完成了！移动次数: ${memoryMoves}`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                first.classList.remove('flipped');
                second.classList.remove('flipped');
                flippedCards = [];
                lockBoard = false;
            }, 1000);
        }
    }
}

function resetMemory() {
    initMemory();
}

// ============ 俄罗斯方块游戏 ============
let tetrisCanvas, tetrisCtx;
let tetrisBoard = [];
let currentPiece = null;
let nextPiece = null; // 下一个方块
let tetrisScore = 0, tetrisLevel = 1, tetrisLines = 0;
let tetrisGameLoop, tetrisPaused = false;
let tetrisLockDelay = 0;
const COLS = 10, ROWS = 20;
const BLOCK_SIZE = 30;
const LOCK_DELAY_FRAMES = 3; // 需要连续3帧无法下降才锁定

const PIECES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

function initTetris() {
    tetrisCanvas = document.getElementById('tetrisCanvas');
    tetrisCtx = tetrisCanvas.getContext('2d');
    tetrisBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    tetrisScore = 0;
    tetrisLevel = 1;
    tetrisLines = 0;
    tetrisPaused = false;
    tetrisLockDelay = 0;
    
    document.getElementById('tetrisScore').textContent = tetrisScore;
    document.getElementById('tetrisLevel').textContent = tetrisLevel;
    document.getElementById('tetrisLines').textContent = tetrisLines;
    
    // 清除之前的定时器和事件监听器
    if (tetrisGameLoop) {
        clearTimeout(tetrisGameLoop);
        cancelAnimationFrame(tetrisGameLoop);
    }
    document.removeEventListener('keydown', handleTetrisKey);
    document.addEventListener('keydown', handleTetrisKey);
    
    // 生成下一个方块
    generateNextPiece();
    spawnPiece();
    drawTetris();
    updateTetris();
}

function generateNextPiece() {
    const type = Math.floor(Math.random() * PIECES.length);
    nextPiece = {
        shape: PIECES[type],
        color: ['#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][type]
    };
}

function spawnPiece() {
    if (nextPiece) {
        currentPiece = {
            shape: JSON.parse(JSON.stringify(nextPiece.shape)),
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            color: nextPiece.color
        };
    } else {
        const type = Math.floor(Math.random() * PIECES.length);
        currentPiece = {
            shape: PIECES[type],
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            color: ['#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][type]
        };
    }
    generateNextPiece();
    drawTetris();
}

function handleTetrisKey(e) {
    // 只在俄罗斯方块游戏激活时响应
    const tetrisArea = document.getElementById('tetris');
    if (!tetrisArea || !tetrisArea.classList.contains('active')) return;
    
    if (tetrisPaused && e.key !== ' ') return;
    
    e.preventDefault(); // 防止页面滚动
    
    if (e.key === 'ArrowLeft') {
        movePiece(-1, 0);
        drawTetris();
    } else if (e.key === 'ArrowRight') {
        movePiece(1, 0);
        drawTetris();
    } else if (e.key === 'ArrowDown') {
        if (currentPiece && isValidPosition(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
            currentPiece.y++;
            tetrisLockDelay = 0; // 重置锁定延迟
            drawTetris();
        }
    } else if (e.key === 'ArrowUp') {
        rotatePiece();
        drawTetris();
    } else if (e.key === ' ') {
        tetrisPaused = !tetrisPaused;
        drawTetris();
    }
}

function movePiece(dx, dy) {
    if (!currentPiece) return;
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    if (isValidPosition(currentPiece.shape, newX, newY)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        tetrisLockDelay = 0; // 移动时重置锁定延迟
    }
}

function rotatePiece() {
    if (!currentPiece) return;
    const rotated = currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidPosition(rotated, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = rotated;
        tetrisLockDelay = 0; // 旋转时重置锁定延迟
    }
}

function isValidPosition(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                if (newY >= 0 && tetrisBoard[newY][newX]) return false;
            }
        }
    }
    return true;
}

function updateTetris() {
    // 检查游戏是否激活
    const tetrisArea = document.getElementById('tetris');
    if (!tetrisArea || !tetrisArea.classList.contains('active')) {
        return; // 游戏未激活，停止更新
    }
    
    if (tetrisPaused) {
        clearTimeout(tetrisGameLoop);
        tetrisGameLoop = setTimeout(() => updateTetris(), 100);
        return;
    }
    
    if (!currentPiece) {
        spawnPiece();
        if (!currentPiece) {
            clearTimeout(tetrisGameLoop);
            tetrisGameLoop = setTimeout(() => updateTetris(), 100);
            return;
        }
        tetrisLockDelay = 0;
    }
    
    // 检查是否可以下降
    if (isValidPosition(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
        // 可以下降
        currentPiece.y++;
        tetrisLockDelay = 0; // 重置锁定延迟
    } else {
        // 无法下降，增加锁定延迟
        tetrisLockDelay++;
        
        // 只有当连续多帧无法下降时才锁定（避免移动时误判）
        if (tetrisLockDelay >= LOCK_DELAY_FRAMES) {
            // 锁定方块
            placePiece();
            clearLines();
            // 生成新方块
            spawnPiece();
            tetrisLockDelay = 0;
            
            // 检查新方块是否可以放置（只在顶部检查）
            if (currentPiece && !isValidPosition(currentPiece.shape, currentPiece.x, currentPiece.y)) {
                // 新方块无法放置，游戏结束
                clearTimeout(tetrisGameLoop);
                alert(`游戏结束！得分: ${tetrisScore}`);
                resetTetris();
                return;
            }
        }
    }
    
    drawTetris();
    // 使用setTimeout，避免过快执行
    clearTimeout(tetrisGameLoop);
    tetrisGameLoop = setTimeout(() => updateTetris(), 1000 - (tetrisLevel - 1) * 50);
}

function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const y = currentPiece.y + row;
                const x = currentPiece.x + col;
                if (y >= 0) tetrisBoard[y][x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (tetrisBoard[row].every(cell => cell !== 0)) {
            tetrisBoard.splice(row, 1);
            tetrisBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    if (linesCleared > 0) {
        tetrisLines += linesCleared;
        tetrisScore += linesCleared * 100 * tetrisLevel;
        tetrisLevel = Math.floor(tetrisLines / 10) + 1;
        document.getElementById('tetrisScore').textContent = tetrisScore;
        document.getElementById('tetrisLevel').textContent = tetrisLevel;
        document.getElementById('tetrisLines').textContent = tetrisLines;
    }
}

function drawTetris() {
    tetrisCtx.fillStyle = '#0a0e1a';
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
    
    // 绘制已放置的方块
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (tetrisBoard[row][col]) {
                tetrisCtx.fillStyle = tetrisBoard[row][col];
                tetrisCtx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        tetrisCtx.fillStyle = currentPiece.color;
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    const x = (currentPiece.x + col) * BLOCK_SIZE;
                    const y = (currentPiece.y + row) * BLOCK_SIZE;
                    if (y >= 0) {
                        tetrisCtx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                    }
                }
            }
        }
    }
}

function resetTetris() {
    initTetris();
}

// ============ 扫雷游戏 ============
let minesweeperGrid = [];
let minesweeperRows = 10, minesweeperCols = 10;
let totalMines = 15;
let flagsPlaced = 0;
let gameStarted = false;
let gameOver = false;
let minesweeperTimer = 0;
let minesweeperTimerInterval = null;

function initMinesweeper() {
    minesweeperGrid = [];
    flagsPlaced = 0;
    gameStarted = false;
    gameOver = false;
    minesweeperTimer = 0;
    
    if (minesweeperTimerInterval) {
        clearInterval(minesweeperTimerInterval);
        minesweeperTimerInterval = null;
    }
    
    // 创建网格
    for (let i = 0; i < minesweeperRows; i++) {
        minesweeperGrid[i] = [];
        for (let j = 0; j < minesweeperCols; j++) {
            minesweeperGrid[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
    
    document.getElementById('minesCount').textContent = totalMines;
    document.getElementById('flagsCount').textContent = flagsPlaced;
    document.getElementById('minesweeperStatus').textContent = '进行中';
    updateMinesweeperTimer();
    
    renderMinesweeper();
}

function updateMinesweeperTimer() {
    const timerEl = document.getElementById('minesweeperTimer');
    if (timerEl) {
        const minutes = Math.floor(minesweeperTimer / 60);
        const seconds = minesweeperTimer % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startMinesweeperTimer() {
    if (!minesweeperTimerInterval && !gameOver) {
        minesweeperTimerInterval = setInterval(() => {
            if (!gameOver && gameStarted) {
                minesweeperTimer++;
                updateMinesweeperTimer();
            }
        }, 1000);
    }
}

function stopMinesweeperTimer() {
    if (minesweeperTimerInterval) {
        clearInterval(minesweeperTimerInterval);
        minesweeperTimerInterval = null;
    }
}

function renderMinesweeper() {
    const grid = document.getElementById('minesweeperGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < minesweeperRows; i++) {
        for (let j = 0; j < minesweeperCols; j++) {
            const cell = document.createElement('button');
            cell.className = 'mine-cell';
            const cellData = minesweeperGrid[i][j];
            
            if (cellData.isRevealed) {
                cell.classList.add('revealed');
                if (cellData.isMine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else {
                    cell.textContent = cellData.neighborMines || '';
                    if (cellData.neighborMines > 0) {
                        const colors = ['', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#000'];
                        cell.style.color = colors[cellData.neighborMines] || '#fff';
                    }
                }
            } else if (cellData.isFlagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }
            
            cell.addEventListener('click', () => revealCell(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(i, j);
            });
            
            grid.appendChild(cell);
        }
    }
}

function placeMines(firstClickRow, firstClickCol) {
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const row = Math.floor(Math.random() * minesweeperRows);
        const col = Math.floor(Math.random() * minesweeperCols);
        if (!minesweeperGrid[row][col].isMine && 
            (row !== firstClickRow || col !== firstClickCol)) {
            minesweeperGrid[row][col].isMine = true;
            minesPlaced++;
            
            // 更新邻居计数
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di, nj = col + dj;
                    if (ni >= 0 && ni < minesweeperRows && nj >= 0 && nj < minesweeperCols) {
                        minesweeperGrid[ni][nj].neighborMines++;
                    }
                }
            }
        }
    }
}

function revealCell(row, col) {
    if (gameOver || minesweeperGrid[row][col].isRevealed || minesweeperGrid[row][col].isFlagged) return;
    
    if (!gameStarted) {
        gameStarted = true;
        placeMines(row, col);
        startMinesweeperTimer();
    }
    
    const cell = minesweeperGrid[row][col];
    cell.isRevealed = true;
    
    if (cell.isMine) {
        gameOver = true;
        stopMinesweeperTimer();
        document.getElementById('minesweeperStatus').textContent = '游戏结束';
        revealAllMines();
        alert('踩到地雷了！游戏结束！');
        return;
    }
    
    // 自动揭示空白区域
    if (cell.neighborMines === 0) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = row + di, nj = col + dj;
                if (ni >= 0 && ni < minesweeperRows && nj >= 0 && nj < minesweeperCols) {
                    if (!minesweeperGrid[ni][nj].isRevealed && !minesweeperGrid[ni][nj].isFlagged) {
                        revealCell(ni, nj);
                    }
                }
            }
        }
    }
    
    checkWin();
    renderMinesweeper();
}

function flagCell(row, col) {
    if (gameOver || minesweeperGrid[row][col].isRevealed) return;
    
    const cell = minesweeperGrid[row][col];
    if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsPlaced--;
    } else {
        cell.isFlagged = true;
        flagsPlaced++;
    }
    
    document.getElementById('flagsCount').textContent = flagsPlaced;
    renderMinesweeper();
}

function revealAllMines() {
    for (let i = 0; i < minesweeperRows; i++) {
        for (let j = 0; j < minesweeperCols; j++) {
            if (minesweeperGrid[i][j].isMine) {
                minesweeperGrid[i][j].isRevealed = true;
            }
        }
    }
}

function checkWin() {
    let revealedCount = 0;
    for (let i = 0; i < minesweeperRows; i++) {
        for (let j = 0; j < minesweeperCols; j++) {
            if (minesweeperGrid[i][j].isRevealed && !minesweeperGrid[i][j].isMine) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === minesweeperRows * minesweeperCols - totalMines) {
        gameOver = true;
        stopMinesweeperTimer();
        document.getElementById('minesweeperStatus').textContent = '胜利！';
        alert('恭喜！你赢了！');
    }
}

function resetMinesweeper() {
    initMinesweeper();
}

// ============ 猜数字游戏 ============
let targetNumber = 0;
let guessHistory = [];

function initGuessNumber() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    guessHistory = [];
    document.getElementById('guessHistory').innerHTML = '';
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

function makeGuess() {
    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        alert('请输入1-100之间的数字！');
        return;
    }
    
    guessHistory.push(guess);
    const historyDiv = document.getElementById('guessHistory');
    const item = document.createElement('div');
    item.className = 'guess-item';
    
    if (guess === targetNumber) {
        item.className += ' correct';
        item.textContent = `🎉 猜对了！答案是 ${targetNumber}！用了 ${guessHistory.length} 次`;
        historyDiv.insertBefore(item, historyDiv.firstChild);
        
        // 更新统计
        guessStats.totalGames++;
        guessStats.totalGuesses += guessHistory.length;
        if (guessHistory.length < guessStats.bestGame) {
            guessStats.bestGame = guessHistory.length;
        }
        updateGuessStats();
        
        setTimeout(() => {
            if (confirm('恭喜猜对了！再来一局？')) {
                resetGuessNumber();
            }
        }, 500);
        return;
    }
    
    // 计算差值
    const difference = Math.abs(guess - targetNumber);
    let hint = '';
    
    if (guess > targetNumber) {
        item.className += ' high';
        if (difference <= 5) {
            hint = '多一点点';
        } else if (difference <= 10) {
            hint = '差一点点';
        } else if (difference <= 15) {
            hint = '差不多了';
        } else {
            hint = '多了一些';
        }
        item.textContent = `第 ${guessHistory.length} 次: ${guess} - ${hint}！`;
    } else {
        item.className += ' low';
        if (difference <= 5) {
            hint = '少一点点';
        } else if (difference <= 10) {
            hint = '差一点点';
        } else if (difference <= 15) {
            hint = '差不多了';
        } else {
            hint = '少了一些';
        }
        item.textContent = `第 ${guessHistory.length} 次: ${guess} - ${hint}！`;
    }
    
    historyDiv.insertBefore(item, historyDiv.firstChild);
    input.value = '';
    input.focus();
}

function resetGuessNumber() {
    initGuessNumber();
}

// ============ 打字游戏 ============
let typingLines = [];
let currentLineIndex = 0;
let typingStartTime = 0;
let typingTimer = null;
let typingCorrect = 0, typingTotal = 0;
let typingInputs = [];

// 一篇完整的英文文章，分成多行
const typingArticle = `Programming is an art, code is the canvas, logic is the brush.
Learning frontend development requires mastering HTML, CSS, and JavaScript.
React is a JavaScript library for building user interfaces.
Algorithms and data structures are the foundation of computer science.
Continuous learning is one of the most important qualities of a programmer.
Code should not only work, but also be clear and readable.
Frontend development is not just about writing code, but creating user experiences.
Every bug is an opportunity to learn and improve your skills.
The best code is code that never needs to be written.
Clean code always looks like it was written by someone who cares.
First, solve the problem. Then, write the code.
Any fool can write code that a computer can understand. Good programmers write code that humans can understand.`;

function initTyping() {
    // 将文章按行分割
    typingLines = typingArticle.split('\n').filter(line => line.trim() !== '');
    currentLineIndex = 0;
    typingStartTime = 0;
    typingCorrect = 0;
    typingTotal = 0;
    typingInputs = [];
    
    const container = document.getElementById('typingContainer');
    container.innerHTML = '';
    
    // 为每一行创建参考文本和输入框
    typingLines.forEach((line, index) => {
        // 参考文本行
        const referenceDiv = document.createElement('div');
        referenceDiv.className = 'typing-reference';
        referenceDiv.textContent = line;
        referenceDiv.id = `ref-${index}`;
        container.appendChild(referenceDiv);
        
        // 输入框行
        const inputDiv = document.createElement('input');
        inputDiv.type = 'text';
        inputDiv.className = 'typing-input-line';
        inputDiv.id = `input-${index}`;
        inputDiv.dataset.lineIndex = index;
        inputDiv.dataset.originalText = line;
        if (index === 0) {
            inputDiv.classList.add('current');
        }
        inputDiv.addEventListener('input', handleTypingInput);
        inputDiv.addEventListener('keydown', handleTypingKeydown);
        container.appendChild(inputDiv);
        
        typingInputs.push(inputDiv);
    });
    
    // 聚焦第一个输入框
    if (typingInputs[0]) {
        typingInputs[0].focus();
    }
    
    document.getElementById('typingSpeed').textContent = '0';
    document.getElementById('typingAccuracy').textContent = '100';
    document.getElementById('typingTime').textContent = '60';
    
    if (typingTimer) clearInterval(typingTimer);
    let timeLeft = 60;
    typingTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('typingTime').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(typingTimer);
            finishTyping();
        }
    }, 1000);
}

function handleTypingKeydown(e) {
    const input = e.target;
    const lineIndex = parseInt(input.dataset.lineIndex);
    const originalText = input.dataset.originalText;
    const currentValue = input.value;
    
    // Enter键：检查当前行是否正确，如果正确则跳到下一行
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentValue === originalText) {
            completeLine(lineIndex);
        } else {
            // 标记为错误
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 300);
        }
    }
}

function handleTypingInput(e) {
    const input = e.target;
    const lineIndex = parseInt(input.dataset.lineIndex);
    const originalText = input.dataset.originalText;
    const currentValue = input.value;
    
    if (typingStartTime === 0) {
        typingStartTime = Date.now();
    }
    
    // 更新当前行的样式
    input.classList.remove('error', 'completed');
    if (currentValue === originalText) {
        input.classList.add('completed');
        // 自动跳到下一行
        setTimeout(() => completeLine(lineIndex), 300);
    } else if (currentValue.length > 0) {
        // 检查是否有错误
        const isCorrect = currentValue === originalText.substring(0, currentValue.length);
        if (!isCorrect) {
            input.classList.add('error');
        }
    }
    
    // 更新统计
    typingTotal = 0;
    typingCorrect = 0;
    
    typingInputs.forEach((inp, idx) => {
        const val = inp.value;
        const orig = inp.dataset.originalText;
        typingTotal += val.length;
        
        // 计算正确字符数
        for (let i = 0; i < Math.min(val.length, orig.length); i++) {
            if (val[i] === orig[i]) {
                typingCorrect++;
            }
        }
    });
    
    const elapsed = (Date.now() - typingStartTime) / 1000 / 60;
    const speed = elapsed > 0 ? Math.floor(typingTotal / elapsed) : 0;
    const accuracy = typingTotal > 0 ? Math.floor((typingCorrect / typingTotal) * 100) : 100;
    
    document.getElementById('typingSpeed').textContent = speed || 0;
    document.getElementById('typingAccuracy').textContent = accuracy;
    
    // 检查是否全部完成
    const allCompleted = typingInputs.every(inp => inp.value === inp.dataset.originalText);
    if (allCompleted) {
        finishTyping();
    }
}

function completeLine(lineIndex) {
    const input = typingInputs[lineIndex];
    if (!input) return;
    
    input.classList.remove('current', 'error');
    input.classList.add('completed');
    input.disabled = true;
    
    // 移动到下一行
    if (lineIndex < typingInputs.length - 1) {
        currentLineIndex = lineIndex + 1;
        const nextInput = typingInputs[currentLineIndex];
        nextInput.classList.add('current');
        nextInput.focus();
    }
}

function finishTyping() {
    clearInterval(typingTimer);
    
    // 禁用所有输入框
    typingInputs.forEach(inp => {
        inp.disabled = true;
        inp.classList.remove('current');
    });
    
    const elapsed = (Date.now() - typingStartTime) / 1000 / 60;
    const speed = elapsed > 0 ? Math.floor(typingTotal / elapsed) : 0;
    const accuracy = typingTotal > 0 ? Math.floor((typingCorrect / typingTotal) * 100) : 100;
    
    setTimeout(() => {
        alert(`完成！\n速度: ${speed} WPM\n准确率: ${accuracy}%`);
        resetTyping();
    }, 500);
}

function resetTyping() {
    typingInputs.forEach(inp => {
        inp.disabled = false;
        inp.removeEventListener('input', handleTypingInput);
        inp.removeEventListener('keydown', handleTypingKeydown);
    });
    initTyping();
}


