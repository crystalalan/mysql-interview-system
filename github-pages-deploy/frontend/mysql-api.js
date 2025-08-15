// MySQL后端API客户端 - 连接真正的云端数据库
class MySQLAPI {
    constructor() {
        // 自动检测环境
        this.API_BASE = this.detectAPIBase();
        this.initializeConnection();
    }

    // 检测API基础URL
    detectAPIBase() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 本地开发环境
            return 'http://localhost:3000/api';
        } else if (hostname.includes('netlify.app')) {
            // Netlify部署环境 - 连接Railway后端
            // 这里将在部署时更新为实际的Railway URL
            return 'https://your-app-name.up.railway.app/api';
        } else {
            // 其他环境
            return 'http://localhost:3000/api';
        }
    }

    // 初始化连接
    async initializeConnection() {
        try {
            const response = await fetch(`${this.API_BASE}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ MySQL数据库连接成功:', data);
                this.connected = true;
            } else {
                throw new Error('健康检查失败');
            }
        } catch (error) {
            console.log('⚠️ MySQL连接失败，使用本地存储备选方案');
            this.connected = false;
            this.initializeLocalStorage();
        }
    }

    // 本地存储备选方案
    initializeLocalStorage() {
        if (!localStorage.getItem('mysql_backup_users')) {
            const users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@interview.com',
                    password: btoa('admin123'),
                    role: 'admin',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('mysql_backup_users', JSON.stringify(users));
            localStorage.setItem('mysql_backup_interviews', JSON.stringify([]));
            localStorage.setItem('mysql_backup_nextUserId', '2');
            localStorage.setItem('mysql_backup_nextInterviewId', '1');
        }
    }

    // 发送HTTP请求
    async makeRequest(endpoint, options = {}) {
        if (!this.connected) {
            return this.handleLocalRequest(endpoint, options);
        }

        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            // 如果网络请求失败，回退到本地存储
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                console.log('网络错误，使用本地存储');
                this.connected = false;
                return this.handleLocalRequest(endpoint, options);
            }
            throw error;
        }
    }

    // 本地存储请求处理
    handleLocalRequest(endpoint, options) {
        // 这里实现本地存储的CRUD操作
        const users = JSON.parse(localStorage.getItem('mysql_backup_users') || '[]');
        const interviews = JSON.parse(localStorage.getItem('mysql_backup_interviews') || '[]');
        
        if (endpoint === '/register' && options.method === 'POST') {
            const { username, email, password } = JSON.parse(options.body);
            const existingUser = users.find(u => u.username === username || u.email === email);
            if (existingUser) {
                throw new Error('用户名或邮箱已存在');
            }
            
            const nextUserId = parseInt(localStorage.getItem('mysql_backup_nextUserId') || '2');
            const newUser = {
                id: nextUserId,
                username,
                email,
                password: btoa(password),
                role: 'user',
                created_at: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('mysql_backup_users', JSON.stringify(users));
            localStorage.setItem('mysql_backup_nextUserId', (nextUserId + 1).toString());
            
            return { message: '注册成功', userId: nextUserId };
        }
        
        if (endpoint === '/login' && options.method === 'POST') {
            const { username, password } = JSON.parse(options.body);
            const user = users.find(u => u.username === username);
            
            if (!user || atob(user.password) !== password) {
                throw new Error('用户名或密码错误');
            }
            
            const token = btoa(JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.role,
                exp: Date.now() + 24 * 60 * 60 * 1000
            }));
            
            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            };
        }
        
        // 其他本地操作...
        throw new Error('本地存储操作未实现');
    }

    // 用户注册
    async register(userData) {
        return await this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // 用户登录
    async login(credentials) {
        return await this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    // 提交面试申请
    async submitInterview(token, interviewData) {
        return await this.makeRequest('/interview', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(interviewData)
        });
    }

    // 获取用户的面试记录
    async getMyInterviews(token) {
        return await this.makeRequest('/my-interviews', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // 管理员获取所有面试记录
    async getAllInterviews(token) {
        return await this.makeRequest('/admin/interviews', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // 管理员审核面试
    async updateInterviewStatus(token, interviewId, status, feedback) {
        return await this.makeRequest(`/admin/interview/${interviewId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, feedback })
        });
    }

    // 健康检查
    async checkHealth() {
        try {
            const response = await fetch(`${this.API_BASE}/health`);
            return await response.json();
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            connected: this.connected,
            apiBase: this.API_BASE,
            timestamp: new Date().toISOString()
        };
    }
}

// 创建全局API实例
window.mysqlAPI = new MySQLAPI();