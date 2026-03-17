class LevelSelect {
    constructor() {
        this.userData = this.loadUserData();
        this.selectedLevel = this.userData.currentLevel;
        this.avatarOptions = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁', '🐯', '🐻', '🐸', '🐵', '🦄'];
        this.selectedAvatar = this.userData.avatar;
        
        this.init();
    }
    
    init() {
        this.renderLevels();
        this.updateUserInfo();
        this.bindEvents();
        this.renderAvatarOptions();
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
    
    renderLevels() {
        const levelsGrid = document.getElementById('levels-grid');
        levelsGrid.innerHTML = '';
        
        const totalLevels = 20;
        
        for (let i = 1; i <= totalLevels; i++) {
            const levelItem = document.createElement('div');
            levelItem.classList.add('level-item');
            levelItem.textContent = i;
            levelItem.dataset.level = i;
            
            if (i < this.userData.currentLevel) {
                levelItem.classList.add('completed');
                levelItem.addEventListener('click', () => this.selectLevel(i));
            } else if (i === this.userData.currentLevel) {
                levelItem.classList.add('current');
                levelItem.addEventListener('click', () => this.selectLevel(i));
            } else if (i <= this.userData.maxLevel) {
                levelItem.classList.add('unlocked');
                levelItem.addEventListener('click', () => this.selectLevel(i));
            } else {
                levelItem.classList.add('locked');
            }
            
            levelsGrid.appendChild(levelItem);
        }
    }
    
    selectLevel(level) {
        if (level > this.userData.maxLevel) return;
        
        this.selectedLevel = level;
        
        document.querySelectorAll('.level-item').forEach(item => {
            item.style.transform = '';
        });
        
        const selectedElement = document.querySelector(`[data-level="${level}"]`);
        if (selectedElement) {
            selectedElement.style.transform = 'scale(1.15)';
        }
    }
    
    updateUserInfo() {
        document.getElementById('avatar').textContent = this.userData.avatar;
        document.getElementById('user-name').textContent = this.userData.name;
        document.getElementById('max-level').textContent = this.userData.maxLevel;
        document.getElementById('total-score').textContent = this.userData.totalScore;
    }
    
    bindEvents() {
        document.getElementById('edit-avatar-btn').addEventListener('click', () => {
            this.openAvatarModal();
        });
        
        document.getElementById('edit-name-btn').addEventListener('click', () => {
            this.openNameModal();
        });
        
        document.getElementById('close-avatar-modal').addEventListener('click', () => {
            this.closeAvatarModal();
        });
        
        document.getElementById('cancel-name').addEventListener('click', () => {
            this.closeNameModal();
        });
        
        document.getElementById('confirm-name').addEventListener('click', () => {
            this.saveName();
        });
        
        document.getElementById('back-to-game').addEventListener('click', () => {
            this.goToGame();
        });
        
        document.getElementById('play-selected').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveName();
            }
        });
    }
    
    renderAvatarOptions() {
        const avatarOptions = document.getElementById('avatar-options');
        avatarOptions.innerHTML = '';
        
        this.avatarOptions.forEach(avatar => {
            const option = document.createElement('div');
            option.classList.add('avatar-option');
            option.textContent = avatar;
            
            if (avatar === this.selectedAvatar) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                this.selectedAvatar = avatar;
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
            
            avatarOptions.appendChild(option);
        });
    }
    
    openAvatarModal() {
        document.getElementById('avatar-modal').classList.add('active');
    }
    
    closeAvatarModal() {
        if (this.selectedAvatar !== this.userData.avatar) {
            this.userData.avatar = this.selectedAvatar;
            this.saveUserData();
            this.updateUserInfo();
        }
        document.getElementById('avatar-modal').classList.remove('active');
    }
    
    openNameModal() {
        document.getElementById('name-input').value = this.userData.name;
        document.getElementById('name-modal').classList.add('active');
        document.getElementById('name-input').focus();
    }
    
    closeNameModal() {
        document.getElementById('name-modal').classList.remove('active');
    }
    
    saveName() {
        const nameInput = document.getElementById('name-input');
        const newName = nameInput.value.trim();
        
        if (newName && newName.length > 0) {
            this.userData.name = newName;
            this.saveUserData();
            this.updateUserInfo();
        }
        
        this.closeNameModal();
    }
    
    goToGame() {
        window.location.href = 'index.html';
    }
    
    startGame() {
        if (this.selectedLevel > this.userData.maxLevel) {
            alert('请先解锁前面的关卡！');
            return;
        }
        
        this.userData.currentLevel = this.selectedLevel;
        this.saveUserData();
        window.location.href = 'index.html';
    }
    
    updateLevelProgress(level, score) {
        if (level > this.userData.maxLevel) {
            this.userData.maxLevel = level;
        }
        
        if (!this.userData.completedLevels.includes(level)) {
            this.userData.completedLevels.push(level);
        }
        
        this.userData.totalScore += score;
        this.saveUserData();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.levelSelect = new LevelSelect();
});