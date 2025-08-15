// 真正的云端实时数据库 - 使用Firebase Realtime Database
class FirebaseRealtimeAPI {
    constructor() {
        // Firebase配置 - 使用免费的Firebase项目
        this.firebaseConfig = {
            databaseURL: "https://interview-system-demo-default-rtdb.firebaseio.com"
        };
        
        this.baseURL = this.firebaseConfig.databaseURL;
        this.initialized = false;
        this.initializeDatabase();
    }

    // 初始化数据库
    async initializeDatabase() {
        try {
            // 检查数据库是否已初始化
            const response = await fetch(`${this.baseURL}/initialized.json`);
            const isInitialized = await response.json();
            
            if (!isInitialized) {
                await this.createInitialData();
            }
            
            this.initialized = true;
            console.log('✅ Firebase数据库连接成功');
        } catch (error) {
            console.error('❌ Firebase连接失败:', error);
            // 回退到本地存储
            this.useLocalStorage = true;
            this.initializeLocalStorage();
        }
    }

    // 创建初始数据
    async createInitialData() {
        const initialData = {
            users: {
                "1": {
                    id: 1,
                    username: "admin",
                    email: "admin@interview.com",
                    password: btoa("admin123"),
                    role: "admin",
                    created_at: new Date().toISOString()
                }
            },
            interviews: {},
            counters: {
                nextUserId: 2,
                nextInterviewId: 1
            },
            initialized: true
        };

        try {
            const response = await fetch(`${this.baseURL}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initialData)
            });

            if (response.ok) {
                console.log('✅ 数据库初始化成功');
            }
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error);
            throw error;
        }
    }

    // 本地存储备选方案
    initializeLocalStorage() {
        if (!localStorage.getItem('firebase_users')) {
            const users = [{
                id: 1,
                username: 'admin',
                email: 'admin@interview.com',
                password: btoa('admin123'),
                role: 'admin',
                created_at: new Date().toISOString()
            }];
            localStorage.setItem('firebase_users', JSON.stringify(users));
            localStorage.setItem('firebase_interviews', JSON.stringify([]));
            localStorage.setItem('firebase_nextUserId', '2');
            localStorage.setItem('firebase_nextInterviewId', '1');
        }
    }

    // 从Firebase获取数据
    async getFromFirebase(path) {
        if (this.useLocalStorage) {
            return this.getFromLocalStorage(path);
        }

        try {
            const response = await fetch(`${this.baseURL}/${path}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('获取数据失败:', error);
        }
        return null;
    }

    // 保存数据到Firebase
    async saveToFirebase(path, data) {
        if (this.useLocalStorage) {
            return this.saveToLocalStorage(path, data);
        }

        try {
            const response = await fetch(`${this.baseURL}/${path}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 本地存储方法
    getFromLocalStorage(path) {
        switch(path) {
            case 'users':
                return JSON.parse(localStorage.getItem('firebase_users') || '[]');
            case 'interviews':
                return JSON.parse(localStorage.getItem('firebase_interviews') || '[]');
            case 'counters/nextUserId':
                return parseInt(localStorage.getItem('firebase_nextUserId') || '2');
            case 'counters/nextInterviewId':
                return parseInt(localStorage.getItem('firebase_nextInterviewId') || '1');
            default:
                return null;
        }
    }

    saveToLocalStorage(path, data) {
        switch(path) {
            case 'users':
                localStorage.setItem('firebase_users', JSON.stringify(data));
                break;
            case 'interviews':
                localStorage.setItem('firebase_interviews', JSON.stringify(data));
                break;
            case 'counters/nextUserId':
                localStorage.setItem('firebase_nextUserId', data.toString());
                break;
            case 'counters/nextInterviewId':
                localStorage.setItem('firebase_nextInterviewId', data.toString());
                break;
        }
        return true;
    }

    // 生成JWT令牌
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            exp: Date.now() + 24 * 60 * 60 * 1000
        };
        return btoa(JSON.stringify(payload));
    }

    // 验证令牌
    verifyToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            if (payload.exp < Date.now()) {
                return null;
            }
            return payload;
        } catch (error) {
            return null;
        }
    }

    // 用户注册
    async register(userData) {
        try {
            // 获取所有用户
            const users = await this.getFromFirebase('users') || {};
            
            // 检查用户名和邮箱是否已存在
            const existingUser = Object.values(users).find(u => 
                u.username === userData.username || u.email === userData.email
            );
            
            if (existingUser) {
                throw new Error('用户名或邮箱已存在');
            }

            // 获取下一个用户ID
            const nextUserId = await this.getFromFirebase('counters/nextUserId') || 2;

            const newUser = {
                id: nextUserId,
                username: userData.username,
                email: userData.email,
                password: btoa(userData.password),
                role: 'user',
                created_at: new Date().toISOString()
            };

            // 保存新用户
            users[nextUserId] = newUser;
            await this.saveToFirebase('users', users);
            
            // 更新计数器
            await this.saveToFirebase('counters/nextUserId', nextUserId + 1);

            return { message: '注册成功', userId: nextUserId };
        } catch (error) {
            throw new Error(error.message || '注册失败');
        }
    }

    // 用户登录
    async login(credentials) {
        try {
            const users = await this.getFromFirebase('users') || {};
            const user = Object.values(users).find(u => u.username === credentials.username);

            if (!user || atob(user.password) !== credentials.password) {
                throw new Error('用户名或密码错误');
            }

            const token = this.generateToken(user);
            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            throw new Error(error.message || '登录失败');
        }
    }

    // 提交面试申请
    async submitInterview(token, interviewData) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        try {
            // 获取下一个面试ID
            const nextInterviewId = await this.getFromFirebase('counters/nextInterviewId') || 1;
            
            // 获取现有面试数据
            const interviews = await this.getFromFirebase('interviews') || {};

            const newInterview = {
                id: nextInterviewId,
                user_id: userPayload.id,
                username: userPayload.username,
                name: interviewData.name,
                phone: interviewData.phone,
                email: interviewData.email,
                position: interviewData.position,
                experience: interviewData.experience,
                skills: interviewData.skills,
                self_introduction: interviewData.self_introduction,
                status: 'pending',
                feedback: '',
                created_at: new Date().toISOString()
            };

            // 保存面试记录
            interviews[nextInterviewId] = newInterview;
            await this.saveToFirebase('interviews', interviews);
            
            // 更新计数器
            await this.saveToFirebase('counters/nextInterviewId', nextInterviewId + 1);

            return { message: '面试申请提交成功', interviewId: nextInterviewId };
        } catch (error) {
            throw new Error('提交失败，请稍后重试');
        }
    }

    // 获取用户的面试记录
    async getMyInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        try {
            const interviews = await this.getFromFirebase('interviews') || {};
            return Object.values(interviews).filter(interview => interview.user_id === userPayload.id);
        } catch (error) {
            throw new Error('获取面试记录失败');
        }
    }

    // 管理员获取所有面试记录
    async getAllInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        try {
            const interviews = await this.getFromFirebase('interviews') || {};
            return Object.values(interviews);
        } catch (error) {
            throw new Error('获取面试记录失败');
        }
    }

    // 管理员审核面试
    async updateInterviewStatus(token, interviewId, status, feedback) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        try {
            // 获取现有面试数据
            const interviews = await this.getFromFirebase('interviews') || {};
            
            if (!interviews[interviewId]) {
                throw new Error('面试记录不存在');
            }

            // 更新面试状态
            interviews[interviewId].status = status;
            interviews[interviewId].feedback = feedback || '';
            
            // 保存更新
            await this.saveToFirebase('interviews', interviews);

            return { message: '审核完成' };
        } catch (error) {
            throw new Error(error.message || '更新失败，请稍后重试');
        }
    }
}

// 创建全局API实例
window.firebaseRealtimeAPI = new FirebaseRealtimeAPI();