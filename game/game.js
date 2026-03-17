class AnimalMatch3 {
    constructor() {
        this.boardSize = 8;
        this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
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
        const savedData = localStorage.getItem('animalMatch3UserData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        
        return {
            name: '森林探险家',
            avatar: '🐱',
            currentLevel: 1,
            maxLevel: 1,
            totalScore: 0,
            completedLevels: []
        };
    }
    
    saveUserData() {
        localStorage.setItem('animalMatch3UserData', JSON.stringify(this.userData));
    }
    
    loadLevelData() {
        this.level = this.userData.currentLevel || 1;
        this.targetScore = this.level * 100;
        this.moves = Math.max(20, 35 - this.level);
        
        if (this.level > 5) {
            this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'];
        }
        if (this.level > 10) {
            this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸'];
        }
    }
    
    createBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                let animal;
                do {
                    animal = this.animals[Math.floor(Math.random() * this.animals.length)];
                } while (this.hasMatch(i, j, animal));
                this.board[i][j] = animal;
            }
        }
    }
    
    hasMatch(row, col, animal) {
        if (col >= 2 && this.board[row][col-1] === animal && this.board[row][col-2] === animal) {
            return true;
        }
        if (row >= 2 && this.board[row-1][col] === animal && this.board[row-2][col] === animal) {
            return true;
        }
        return false;
    }
    
    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.row = i;
                tile.dataset.col = j;
                tile.textContent = this.board[i][j];
                boardElement.appendChild(tile);
            }
        }
    }
    
    bindEvents() {
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.isProcessing) return;
            
            const tile = e.target;
            if (tile.classList.contains('tile')) {
                this.handleTileClick(tile);
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
    }
    
    handleTileClick(tile) {
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        
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
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize - 2; j++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i][j+1] && 
                    this.board[i][j] === this.board[i][j+2]) {
                    hasMatch = true;
                }
            }
        }
        
        for (let j = 0; j < this.boardSize; j++) {
            for (let i = 0; i < this.boardSize - 2; i++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i+1][j] && 
                    this.board[i][j] === this.board[i+2][j]) {
                    hasMatch = true;
                }
            }
        }
        
        return hasMatch;
    }
    
    async processMatches() {
        let matchedTiles = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize - 2; j++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i][j+1] && 
                    this.board[i][j] === this.board[i][j+2]) {
                    matchedTiles.push({ row: i, col: j });
                    matchedTiles.push({ row: i, col: j+1 });
                    matchedTiles.push({ row: i, col: j+2 });
                }
            }
        }
        
        for (let j = 0; j < this.boardSize; j++) {
            for (let i = 0; i < this.boardSize - 2; i++) {
                if (this.board[i][j] && 
                    this.board[i][j] === this.board[i+1][j] && 
                    this.board[i][j] === this.board[i+2][j]) {
                    matchedTiles.push({ row: i, col: j });
                    matchedTiles.push({ row: i+1, col: j });
                    matchedTiles.push({ row: i+2, col: j });
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
            
            if (await this.checkMatches()) {
                await this.processMatches();
            }
        }
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
        
        for (let i = 0; i < 10; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    getRandomColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    showHint() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.canSwapToMatch(i, j)) {
                    const tile = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (tile) {
                        tile.style.boxShadow = '0 0 10px 5px #FFD700';
                        setTimeout(() => tile.style.boxShadow = '', 2000);
                        return;
                    }
                }
            }
        }
    }
    
    canSwapToMatch(row, col) {
        const directions = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
        
        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
                const temp = this.board[row][col];
                this.board[row][col] = this.board[newRow][newCol];
                this.board[newRow][newCol] = temp;
                
                const hasMatch = this.checkMatches();
                
                this.board[newRow][newCol] = this.board[row][col];
                this.board[row][col] = temp;
                
                if (hasMatch) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    checkGameEnd() {
        if (this.moves <= 0) {
            if (this.score >= this.targetScore) {
                this.levelComplete();
            } else {
                this.showMessage('游戏结束！', 'lose');
            }
            return;
        }
        
        if (this.score >= this.targetScore) {
            this.levelComplete();
        }
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