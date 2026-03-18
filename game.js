class AnimalMatch3 {
    constructor() {
        // 固定游戏板为6*6格子
        this.boardSize = 6;
        this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        this.specialAnimals = {
            horizontal: '🌈', // 横向消除
            vertical: '⚡',    // 纵向消除
            bomb: '💣'         // 爆炸（周围8格）
        };
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.targetScore = 100;
        this.selectedTile = null;
        this.isProcessing = false;
        this.userData = this.loadUserData();
        
        this.init();
    }
    
    init() {
        this.loadLevelData();
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateGameInfo();
        this.addLevelSelectButton();
    }
    
    loadUserData() {
        const currentUser = localStorage.getItem('animalMatch3CurrentUser');
        if (!currentUser) {
            window.location.href = 'auth.html';
            return;
        }
        
        const users = this.getUsers();
        const userData = users[currentUser];
        
        if (!userData) {
            return {
                name: currentUser,
                avatar: '🐱',
                currentLevel: 1,
                maxLevel: 1,
                totalScore: 0,
                lives: 10,
                maxLives: 10,
                lastLifeRecovery: Date.now(),
                completedLevels: [],
                friends: []
            };
        }
        
        // 确保数据结构完整
        if (!userData.lives) userData.lives = 10;
        if (!userData.maxLives) userData.maxLives = 10;
        if (!userData.lastLifeRecovery) userData.lastLifeRecovery = Date.now();
        if (!userData.completedLevels) userData.completedLevels = [];
        if (!userData.friends) userData.friends = [];
        if (!userData.totalScore) userData.totalScore = 0;
        
        return userData;
    }
    
    saveUserData() {
        const currentUser = localStorage.getItem('animalMatch3CurrentUser');
        if (currentUser) {
            const users = this.getUsers();
            users[currentUser] = this.userData;
            localStorage.setItem('animalMatch3Users', JSON.stringify(users));
        }
    }
    
    getUsers() {
        const users = localStorage.getItem('animalMatch3Users');
        return users ? JSON.parse(users) : {};
    }
    
    loadLevelData() {
        this.level = this.userData.currentLevel || 1;
        this.targetScore = this.level * 100;
        this.moves = Math.max(15, 35 - this.level);
        
        // 增加游戏难度维度
        this.levelObjectives = {
            specialTarget: null, // 特殊目标（例如收集特定动物）
            timeLimit: null, // 时间限制（秒）
            obstacles: false, // 是否有障碍物
            minMatchLength: 3 // 最小匹配长度
        };
        
        // 根据关卡设置不同的难度
        if (this.level >= 5) {
            // 第5关开始增加动物种类
            this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'];
        }
        if (this.level >= 10) {
            // 第10关开始增加更多动物种类
            this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸'];
        }
        if (this.level >= 8) {
            // 第8关开始设置特殊目标
            const specialAnimals = ['🐼', '🦁', '🦊'];
            this.levelObjectives.specialTarget = {
                animal: specialAnimals[Math.floor(Math.random() * specialAnimals.length)],
                count: Math.min(10, this.level * 2)
            };
        }
        if (this.level >= 12) {
            // 第12关开始设置时间限制
            this.levelObjectives.timeLimit = Math.max(60, 120 - this.level * 5);
            this.startTime = Date.now();
        }
        if (this.level >= 15) {
            // 第15关开始有障碍物
            this.levelObjectives.obstacles = true;
        }
        if (this.level >= 18) {
            // 第18关开始要求最小匹配长度为4
            this.levelObjectives.minMatchLength = 4;
        }
    }
    
    createBoard() {
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            this.board = [];
            
            for (let i = 0; i < this.boardSize; i++) {
                this.board[i] = [];
                for (let j = 0; j < this.boardSize; j++) {
                    let animal;
                    let tileAttempts = 0;
                    const maxTileAttempts = 20;
                    
                    do {
                        animal = this.animals[Math.floor(Math.random() * this.animals.length)];
                        tileAttempts++;
                    } while (this.hasMatch(i, j, animal) && tileAttempts < maxTileAttempts);
                    
                    this.board[i][j] = animal;
                }
            }
            
            attempts++;
        } while (this.checkBoardForMatches() && attempts < maxAttempts);
    }
    
    hasMatch(row, col, animal) {
        // 检查水平方向
        if (col >= 2 && this.board[row][col-1] === animal && this.board[row][col-2] === animal) {
            return true;
        }
        
        // 检查垂直方向
        if (row >= 2 && this.board[row-1][col] === animal && this.board[row-2][col] === animal) {
            return true;
        }
        
        // 检查斜向（左上到右下）
        if (row >= 2 && col >= 2 && this.board[row-1][col-1] === animal && this.board[row-2][col-2] === animal) {
            return true;
        }
        
        // 检查斜向（右上到左下）
        if (row >= 2 && col < this.boardSize - 2 && this.board[row-1][col+1] === animal && this.board[row-2][col+2] === animal) {
            return true;
        }
        
        return false;
    }
    
    checkBoardForMatches() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize - 2; j++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i][j+1] && 
                    this.board[i][j] === this.board[i][j+2]) {
                    return true;
                }
            }
        }
        
        for (let j = 0; j < this.boardSize; j++) {
            for (let i = 0; i < this.boardSize - 2; i++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i+1][j] && 
                    this.board[i][j] === this.board[i+2][j]) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 使用文档片段减少DOM操作
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.row = i;
                tile.dataset.col = j;
                tile.textContent = this.board[i][j];
                
                // 为特殊动物添加样式
                const animal = this.board[i][j];
                if (animal === this.specialAnimals.horizontal || 
                    animal === this.specialAnimals.vertical || 
                    animal === this.specialAnimals.bomb) {
                    tile.classList.add('special');
                    switch (animal) {
                        case this.specialAnimals.horizontal:
                            tile.classList.add('special-horizontal');
                            break;
                        case this.specialAnimals.vertical:
                            tile.classList.add('special-vertical');
                            break;
                        case this.specialAnimals.bomb:
                            tile.classList.add('special-bomb');
                            break;
                    }
                }
                
                fragment.appendChild(tile);
            }
        }
        
        boardElement.appendChild(fragment);
    }
    
    bindEvents() {
        // 点击事件
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.isProcessing) return;
            
            const tile = e.target;
            if (tile.classList.contains('tile')) {
                this.handleTileClick(tile);
            }
        });
        
        // 触摸事件支持
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let touchedTile = null;
        
        document.getElementById('game-board').addEventListener('touchstart', (e) => {
            if (this.isProcessing) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            
            const tile = document.elementFromPoint(touchStartX, touchStartY);
            if (tile && tile.classList.contains('tile')) {
                touchedTile = tile;
            }
        });
        
        document.getElementById('game-board').addEventListener('touchend', (e) => {
            if (this.isProcessing || !touchedTile) return;
            
            const touch = e.changedTouches[0];
            touchEndX = touch.clientX;
            touchEndY = touch.clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // 确定滑动方向
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 水平滑动
                if (Math.abs(diffX) > 30) { // 最小滑动距离
                    const col = parseInt(touchedTile.dataset.col);
                    const row = parseInt(touchedTile.dataset.row);
                    const targetCol = diffX > 0 ? col + 1 : col - 1;
                    
                    if (targetCol >= 0 && targetCol < this.boardSize) {
                        const targetTile = document.querySelector(`[data-row="${row}"][data-col="${targetCol}"]`);
                        if (targetTile) {
                            this.handleTileClick(touchedTile);
                            this.handleTileClick(targetTile);
                        }
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(diffY) > 30) { // 最小滑动距离
                    const col = parseInt(touchedTile.dataset.col);
                    const row = parseInt(touchedTile.dataset.row);
                    const targetRow = diffY > 0 ? row + 1 : row - 1;
                    
                    if (targetRow >= 0 && targetRow < this.boardSize) {
                        const targetTile = document.querySelector(`[data-row="${targetRow}"][data-col="${col}"]`);
                        if (targetTile) {
                            this.handleTileClick(touchedTile);
                            this.handleTileClick(targetTile);
                        }
                    }
                }
            }
            
            touchedTile = null;
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    handleTileClick(tile) {
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        const animal = this.board[row][col];
        
        // 处理特殊动物的点击
        if (animal === this.specialAnimals.horizontal || 
            animal === this.specialAnimals.vertical || 
            animal === this.specialAnimals.bomb) {
            this.activateSpecialAnimal(row, col, animal);
            return;
        }
        
        if (!this.selectedTile) {
            this.selectedTile = { row, col, element: tile };
            tile.classList.add('selected');
        } else {
            if (this.isAdjacent(this.selectedTile, { row, col })) {
                this.swapTiles(this.selectedTile, { row, col });
            } else {
                this.selectedTile.element.classList.remove('selected');
                this.selectedTile = { row, col, element: tile };
                tile.classList.add('selected');
            }
        }
    }
    
    async activateSpecialAnimal(row, col, type) {
        this.isProcessing = true;
        
        let affectedTiles = [];
        
        switch (type) {
            case this.specialAnimals.horizontal:
                // 消除整行
                for (let j = 0; j < this.boardSize; j++) {
                    affectedTiles.push({ row, col: j });
                }
                break;
            case this.specialAnimals.vertical:
                // 消除整列
                for (let i = 0; i < this.boardSize; i++) {
                    affectedTiles.push({ row: i, col });
                }
                break;
            case this.specialAnimals.bomb:
                // 消除周围8格
                for (let i = row - 1; i <= row + 1; i++) {
                    for (let j = col - 1; j <= col + 1; j++) {
                        if (i >= 0 && i < this.boardSize && j >= 0 && j < this.boardSize) {
                            affectedTiles.push({ row: i, col: j });
                        }
                    }
                }
                break;
        }
        
        // 显示特效
        for (const tile of affectedTiles) {
            const tileElement = document.querySelector(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
            if (tileElement) {
                tileElement.classList.add('matched');
                this.createConfetti(tileElement);
            }
            this.board[tile.row][tile.col] = null;
        }
        
        this.score += affectedTiles.length * 20; // 特殊动物消除得分更高
        this.updateGameInfo();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.fillEmptySpaces();
        
        if (await this.checkMatches()) {
            await this.processMatches();
        }
        
        this.isProcessing = false;
        this.moves--;
        this.updateGameInfo();
        this.checkGameEnd();
    }
    
    isAdjacent(tile1, tile2) {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async swapTiles(tile1, tile2) {
        this.isProcessing = true;
        
        const temp = this.board[tile1.row][tile1.col];
        this.board[tile1.row][tile1.col] = this.board[tile2.row][tile2.col];
        this.board[tile2.row][tile2.col] = temp;
        
        this.renderBoard();
        
        const hasMatch = await this.checkMatches();
        
        if (!hasMatch) {
            const temp = this.board[tile1.row][tile1.col];
            this.board[tile1.row][tile1.col] = this.board[tile2.row][tile2.col];
            this.board[tile2.row][tile2.col] = temp;
            this.renderBoard();
        } else {
            this.moves--;
            this.updateGameInfo();
            await this.processMatches();
            this.checkGameEnd();
        }
        
        this.selectedTile = null;
        this.isProcessing = false;
    }
    
    checkMatches() {
        let hasMatch = false;
        
        // 检查水平方向匹配
        for (let i = 0; i < this.boardSize; i++) {
            let j = 0;
            while (j < this.boardSize - 2) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i][j+1] && 
                    this.board[i][j] === this.board[i][j+2]) {
                    hasMatch = true;
                    j += 3; // 跳过已匹配的方块
                } else {
                    j++;
                }
            }
        }
        
        // 检查垂直方向匹配
        for (let j = 0; j < this.boardSize; j++) {
            let i = 0;
            while (i < this.boardSize - 2) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i+1][j] && 
                    this.board[i][j] === this.board[i+2][j]) {
                    hasMatch = true;
                    i += 3; // 跳过已匹配的方块
                } else {
                    i++;
                }
            }
        }
        
        return hasMatch;
    }
    
    async processMatches() {
        let matchedTiles = [];
        let specialAnimalsToCreate = [];
        
        // 检测水平方向的匹配
        for (let i = 0; i < this.boardSize; i++) {
            let j = 0;
            while (j < this.boardSize) {
                if (!this.board[i][j]) {
                    j++;
                    continue;
                }
                
                let count = 1;
                let currentAnimal = this.board[i][j];
                
                for (let k = j + 1; k < this.boardSize; k++) {
                    if (this.board[i][k] === currentAnimal) {
                        count++;
                    } else {
                        break;
                    }
                }
                
                if (count >= 3) {
                    for (let k = j; k < j + count; k++) {
                        matchedTiles.push({ row: i, col: k });
                    }
                    
                    // 四连或五连生成特殊动物
                    if (count >= 4) {
                        let specialType = count >= 5 ? this.specialAnimals.bomb : this.specialAnimals.horizontal;
                        specialAnimalsToCreate.push({ row: i, col: j + Math.floor(count / 2), type: specialType });
                    }
                    
                    j += count;
                } else {
                    j++;
                }
            }
        }
        
        // 检测垂直方向的匹配
        for (let j = 0; j < this.boardSize; j++) {
            let i = 0;
            while (i < this.boardSize) {
                if (!this.board[i][j]) {
                    i++;
                    continue;
                }
                
                let count = 1;
                let currentAnimal = this.board[i][j];
                
                for (let k = i + 1; k < this.boardSize; k++) {
                    if (this.board[k][j] === currentAnimal) {
                        count++;
                    } else {
                        break;
                    }
                }
                
                if (count >= 3) {
                    for (let k = i; k < i + count; k++) {
                        matchedTiles.push({ row: k, col: j });
                    }
                    
                    // 四连或五连生成特殊动物
                    if (count >= 4) {
                        let specialType = count >= 5 ? this.specialAnimals.bomb : this.specialAnimals.vertical;
                        specialAnimalsToCreate.push({ row: i + Math.floor(count / 2), col: j, type: specialType });
                    }
                    
                    i += count;
                } else {
                    i++;
                }
            }
        }
        
        if (matchedTiles.length > 0) {
            this.score += matchedTiles.length * 10;
            this.updateGameInfo();
            
            for (const tile of matchedTiles) {
                const tileElement = document.querySelector(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
                if (tileElement) {
                    tileElement.classList.add('matched');
                    this.createConfetti(tileElement);
                }
                this.board[tile.row][tile.col] = null;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.fillEmptySpaces();
            
            // 创建特殊动物
            for (const special of specialAnimalsToCreate) {
                if (this.board[special.row][special.col] === null) {
                    this.board[special.row][special.col] = special.type;
                }
            }
            
            this.renderBoard();
            
            // 为特殊动物添加特效
            await new Promise(resolve => setTimeout(resolve, 300));
            this.addSpecialAnimalEffects();
            
            if (await this.checkMatches()) {
                await this.processMatches();
            }
        }
    }
    
    addSpecialAnimalEffects() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const animal = this.board[i][j];
                if (animal === this.specialAnimals.horizontal || 
                    animal === this.specialAnimals.vertical || 
                    animal === this.specialAnimals.bomb) {
                    const tileElement = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (tileElement) {
                        tileElement.classList.add('special');
                        this.addSpecialEffect(tileElement, animal);
                    }
                }
            }
        }
    }
    
    addSpecialEffect(element, animal) {
        let animationClass = '';
        switch (animal) {
            case this.specialAnimals.horizontal:
                animationClass = 'special-horizontal';
                break;
            case this.specialAnimals.vertical:
                animationClass = 'special-vertical';
                break;
            case this.specialAnimals.bomb:
                animationClass = 'special-bomb';
                break;
        }
        element.classList.add(animationClass);
    }
    
    async fillEmptySpaces() {
        for (let j = 0; j < this.boardSize; j++) {
            let emptyCount = 0;
            for (let i = this.boardSize - 1; i >= 0; i--) {
                if (this.board[i][j] === null) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    this.board[i + emptyCount][j] = this.board[i][j];
                    this.board[i][j] = null;
                }
            }
            
            for (let i = 0; i < emptyCount; i++) {
                this.board[i][j] = this.animals[Math.floor(Math.random() * this.animals.length)];
            }
        }
        
        this.renderBoard();
        
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.classList.add('falling');
            setTimeout(() => tile.classList.remove('falling'), 300);
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 减少纸屑数量，优化性能
        const confettiCount = 6;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            // 使用requestAnimationFrame优化
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
    }
    
    getRandomColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    

    
    checkGameEnd() {
        // 检查时间限制
        if (this.levelObjectives.timeLimit) {
            const timeLeft = Math.max(0, this.levelObjectives.timeLimit - Math.floor((Date.now() - this.startTime) / 1000));
            if (timeLeft <= 0) {
                this.levelFailed();
                return;
            }
        }
        
        // 检查步数限制
        if (this.moves <= 0) {
            if (this.score >= this.targetScore) {
                this.levelComplete();
            } else {
                this.levelFailed();
            }
            return;
        }
        
        // 检查特殊目标
        if (this.levelObjectives.specialTarget) {
            // 这里需要实现特殊目标的检查逻辑
            // 暂时简化为只检查分数
            if (this.score >= this.targetScore) {
                this.levelComplete();
            }
        } else {
            // 普通关卡只检查分数
            if (this.score >= this.targetScore) {
                this.levelComplete();
            }
        }
    }
    
    levelFailed() {
        // 扣除一条生命值
        this.userData.lives = Math.max(0, this.userData.lives - 1);
        this.saveUserData();
        
        this.showMessage('游戏结束！生命值-1', 'lose');
        
        setTimeout(() => {
            window.location.href = 'level-select.html';
        }, 2000);
    }
    
    levelComplete() {
        this.userData.currentLevel = this.level + 1;
        if (this.level + 1 > this.userData.maxLevel) {
            this.userData.maxLevel = this.level + 1;
        }
        
        if (!this.userData.completedLevels.includes(this.level)) {
            this.userData.completedLevels.push(this.level);
        }
        
        this.userData.totalScore += this.score;
        this.saveUserData();
        
        this.showMessage(`恭喜通过 ${this.level} 关！即将跳转到关卡选择...`, 'win');
        
        setTimeout(() => {
            window.location.href = 'level-select.html';
        }, 2000);
    }
    
    updateGameInfo() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('target').textContent = this.targetScore;
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
        
        // 显示特殊目标信息
        if (this.levelObjectives.specialTarget) {
            const specialTargetInfo = document.createElement('div');
            specialTargetInfo.id = 'special-target';
            specialTargetInfo.textContent = `目标: 收集 ${this.levelObjectives.specialTarget.count} 个 ${this.levelObjectives.specialTarget.animal}`;
            specialTargetInfo.style.marginTop = '10px';
            specialTargetInfo.style.fontSize = '1em';
            specialTargetInfo.style.fontWeight = 'bold';
            specialTargetInfo.style.color = '#4CAF50';
            
            const gameInfo = document.querySelector('.game-info');
            const existingTarget = document.getElementById('special-target');
            if (existingTarget) {
                existingTarget.remove();
            }
            gameInfo.appendChild(specialTargetInfo);
        }
        
        // 显示时间限制信息
        if (this.levelObjectives.timeLimit) {
            const timeLeft = Math.max(0, this.levelObjectives.timeLimit - Math.floor((Date.now() - this.startTime) / 1000));
            const timeInfo = document.createElement('div');
            timeInfo.id = 'time-limit';
            timeInfo.textContent = `时间: ${timeLeft}s`;
            timeInfo.style.marginTop = '10px';
            timeInfo.style.fontSize = '1em';
            timeInfo.style.fontWeight = 'bold';
            timeInfo.style.color = timeLeft < 10 ? '#f44336' : '#2196F3';
            
            const gameInfo = document.querySelector('.game-info');
            const existingTime = document.getElementById('time-limit');
            if (existingTime) {
                existingTime.remove();
            }
            gameInfo.appendChild(timeInfo);
        }
    }
    
    showMessage(text, type) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type}`;
        
        setTimeout(() => {
            messageElement.className = 'game-message';
        }, 2000);
    }
    
    resetGame() {
        this.score = 0;
        this.loadLevelData();
        this.selectedTile = null;
        this.createBoard();
        this.renderBoard();
        this.updateGameInfo();
        this.showMessage('游戏重新开始！', 'win');
    }
    
    addLevelSelectButton() {
        const gameControls = document.querySelector('.game-controls');
        if (gameControls) {
            const levelSelectBtn = document.createElement('button');
            levelSelectBtn.textContent = '选择关卡';
            levelSelectBtn.id = 'level-select-btn';
            levelSelectBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            levelSelectBtn.style.color = 'white';
            levelSelectBtn.addEventListener('click', () => {
                window.location.href = 'level-select.html';
            });
            gameControls.appendChild(levelSelectBtn);
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new AnimalMatch3();
});