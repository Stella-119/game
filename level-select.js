class LevelSelect {
    constructor() {
        this.userData = this.loadUserData();
        this.selectedLevel = this.userData.currentLevel;
        this.avatarOptions = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁', '🐯', '🐻', '🐸', '🐵', '🦄'];
        this.tempAvatar = this.userData.avatar;
        this.tempName = this.userData.name;
        
        this.init();
    }
    
    init() {
        this.renderLevels();
        this.updateUserInfo();
        this.bindEvents();
        this.checkLivesRecovery();
        setInterval(() => this.checkLivesRecovery(), 60000); // 每分钟检查一次
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
            // 如果用户数据不存在，创建默认数据
            const newUserData = {
                username: currentUser,
                name: currentUser,
                avatar: '🐱',
                currentLevel: 1,
                maxLevel: 1,
                totalScore: 0,
                lives: 10,
                maxLives: 10,
                lastLifeRecovery: Date.now(),
                completedLevels: [],
                friends: [],
                createdAt: new Date().toISOString()
            };
            users[currentUser] = newUserData;
            localStorage.setItem('animalMatch3Users', JSON.stringify(users));
            return newUserData;
        }
        
        // 确保数据结构完整
        if (!userData.lives) userData.lives = 10;
        if (!userData.maxLives) userData.maxLives = 10;
        if (!userData.lastLifeRecovery) userData.lastLifeRecovery = Date.now();
        if (!userData.completedLevels) userData.completedLevels = [];
        if (!userData.friends) userData.friends = [];
        
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
    
    renderLevels() {
        const levelPath = document.getElementById('level-path');
        levelPath.innerHTML = '';
        
        const totalLevels = 5; // 初始5个关卡，匹配图片设计
        
        for (let i = 1; i <= totalLevels; i++) {
            // 创建关卡节点
            const levelNode = document.createElement('div');
            levelNode.classList.add('level-node');
            levelNode.textContent = i;
            levelNode.dataset.level = i;
            
            // 设置关卡状态
            if (this.userData.completedLevels.includes(i)) {
                levelNode.classList.add('completed');
                levelNode.addEventListener('click', () => this.selectLevel(i));
            } else if (i === this.userData.currentLevel) {
                levelNode.classList.add('current');
                levelNode.addEventListener('click', () => this.selectLevel(i));
            } else if (i < this.userData.currentLevel) {
                levelNode.classList.add('completed');
                levelNode.addEventListener('click', () => this.selectLevel(i));
            } else {
                levelNode.classList.add('locked');
            }
            
            levelPath.appendChild(levelNode);
            
            // 添加连接线（除了最后一个关卡）
            if (i < totalLevels) {
                const connector = document.createElement('div');
                connector.classList.add('level-connector');
                levelPath.appendChild(connector);
            }
        }
    }
    
    selectLevel(level) {
        if (level > this.userData.maxLevel) return;
        
        this.selectedLevel = level;
        this.startGame();
    }
    
    updateUserInfo() {
        document.getElementById('avatar').textContent = this.userData.avatar;
        document.getElementById('user-name').textContent = this.userData.name;
        document.getElementById('total-score').textContent = this.userData.totalScore;
        document.getElementById('lives').textContent = this.userData.lives;
    }
    
    bindEvents() {
        // 头像点击事件 - 直接编辑资料
        document.getElementById('avatar').addEventListener('click', () => {
            this.openProfileModal();
        });
        
        // 设置按钮点击事件
        document.getElementById('settings-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettingsDropdown();
        });
        
        // 切换账号
        document.getElementById('switch-account').addEventListener('click', () => {
            this.switchAccount();
        });
        
        // 退出登录
        document.getElementById('logout').addEventListener('click', () => {
            this.logout();
        });
        
        // 编辑资料弹窗
        document.getElementById('cancel-profile').addEventListener('click', () => {
            this.closeProfileModal();
        });
        
        document.getElementById('save-profile').addEventListener('click', () => {
            this.saveProfile();
        });
        
        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
        
        // 关卡点击事件已在renderLevels中绑定
    }
    
    // 检查生命值恢复
    checkLivesRecovery() {
        if (this.userData.lives < this.userData.maxLives) {
            const now = Date.now();
            const timeSinceLastRecovery = now - this.userData.lastLifeRecovery;
            const recoveryInterval = 30 * 60 * 1000; // 30分钟
            
            if (timeSinceLastRecovery >= recoveryInterval) {
                const recoveredLives = Math.floor(timeSinceLastRecovery / recoveryInterval);
                this.userData.lives = Math.min(this.userData.lives + recoveredLives, this.userData.maxLives);
                this.userData.lastLifeRecovery = now;
                this.saveUserData();
                this.updateUserInfo();
            }
        }
    }
    
    // 设置下拉菜单
    toggleSettingsDropdown() {
        const dropdown = document.getElementById('settings-dropdown');
        dropdown.classList.toggle('active');
    }
    

    
    // 关闭所有下拉菜单
    closeAllDropdowns() {
        document.getElementById('settings-dropdown').classList.remove('active');
    }
    
    // 切换账号
    switchAccount() {
        if (confirm('确定要切换账号吗？')) {
            localStorage.removeItem('animalMatch3CurrentUser');
            window.location.href = 'auth.html';
        }
    }
    
    // 编辑资料
    openProfileModal() {
        this.tempAvatar = this.userData.avatar;
        this.tempName = this.userData.name;
        
        document.getElementById('current-avatar-display').textContent = this.tempAvatar;
        document.getElementById('edit-name-input').value = this.tempName;
        
        this.renderAvatarOptions();
        document.getElementById('profile-modal').classList.add('active');
    }
    
    closeProfileModal() {
        document.getElementById('profile-modal').classList.remove('active');
    }
    
    renderAvatarOptions() {
        const avatarOptions = document.getElementById('avatar-options');
        avatarOptions.innerHTML = '';
        
        this.avatarOptions.forEach(avatar => {
            const option = document.createElement('div');
            option.classList.add('avatar-option');
            option.textContent = avatar;
            
            if (avatar === this.tempAvatar) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.tempAvatar = avatar;
                document.getElementById('current-avatar-display').textContent = avatar;
            });
            
            avatarOptions.appendChild(option);
        });
    }
    
    saveProfile() {
        const newName = document.getElementById('edit-name-input').value.trim();
        
        if (!newName) {
            alert('请输入昵称');
            return;
        }
        
        this.userData.avatar = this.tempAvatar;
        this.userData.name = newName;
        this.saveUserData();
        this.updateUserInfo();
        this.closeProfileModal();
        alert('资料保存成功！');
    }
    
    // 退出登录
    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('animalMatch3CurrentUser');
            window.location.href = 'auth.html';
        }
    }
    
    // 开始游戏
    startGame() {
        if (this.userData.lives <= 0) {
            alert('生命值不足，请等待恢复或稍后再试！');
            return;
        }
        
        localStorage.setItem('animalMatch3SelectedLevel', this.selectedLevel);
        window.location.href = 'index.html';
    }
}

// 初始化
let levelSelect;
window.addEventListener('DOMContentLoaded', () => {
    levelSelect = new LevelSelect();
});
