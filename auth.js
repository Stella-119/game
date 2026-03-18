class AuthSystem {
    constructor() {
        this.avatarOptions = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁', '🐯', '🐻', '🐸', '🐵', '🦄'];
        this.selectedAvatar = '🐱';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderAvatarOptions();
        this.checkLoginStatus();
    }
    
    bindEvents() {
        // 标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // 登录表单
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // 注册表单
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    }
    
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tab).style.display = 'block';
    }
    
    renderAvatarOptions() {
        const selector = document.getElementById('avatar-selector');
        selector.innerHTML = '';
        
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
            
            selector.appendChild(option);
        });
    }
    
    showMessage(message, type) {
        const messageElement = document.getElementById('auth-message');
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        
        setTimeout(() => {
            messageElement.className = 'auth-message';
        }, 3000);
    }
    
    register() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        if (username.length < 3) {
            this.showMessage('用户名至少需要3个字符', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('密码至少需要6个字符', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('两次输入的密码不一致', 'error');
            return;
        }
        
        const users = this.getUsers();
        if (users[username]) {
            this.showMessage('用户名已存在', 'error');
            return;
        }
        
        users[username] = {
            password: password,
            avatar: this.selectedAvatar,
            name: username,
            currentLevel: 1,
            maxLevel: 1,
            totalScore: 0,
            completedLevels: [],
            friends: []
        };
        
        localStorage.setItem('animalMatch3Users', JSON.stringify(users));
        localStorage.setItem('animalMatch3CurrentUser', username);
        
        this.showMessage('注册成功！', 'success');
        setTimeout(() => {
            window.location.href = 'level-select.html';
        }, 1000);
    }
    
    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        const users = this.getUsers();
        const user = users[username];
        
        if (!user) {
            this.showMessage('用户名不存在', 'error');
            return;
        }
        
        if (user.password !== password) {
            this.showMessage('密码错误', 'error');
            return;
        }
        
        localStorage.setItem('animalMatch3CurrentUser', username);
        
        this.showMessage('登录成功！', 'success');
        setTimeout(() => {
            window.location.href = 'level-select.html';
        }, 1000);
    }
    
    getUsers() {
        const users = localStorage.getItem('animalMatch3Users');
        return users ? JSON.parse(users) : {};
    }
    
    checkLoginStatus() {
        const currentUser = localStorage.getItem('animalMatch3CurrentUser');
        if (currentUser) {
            window.location.href = 'level-select.html';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});