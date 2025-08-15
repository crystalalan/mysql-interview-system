// Firebase实时数据库API
class FirebaseAPI {
    constructor() {
        // 使用Firebase Realtime Database REST API
        this.DATABASE_URL = 'https://interview-system-demo-default-rtdb.firebaseio.com';
        this.initializeData();
    }

    // 初始化数据
    async initializeData() {
        try {
            // 检查是否已有数据
            const response = await fetch(`${this.DATABASE_URL}/initialized.json`);
            const initialized = await response.json();
            
            if (!initialized) {
                await this.createInitialData();
            }
        } catch (error) {
            console.log('初始化数据库...');
            await this.createInitialData();
        }
    }

    // 创建初始数据
    async createInitialData() {
        const initialData = {
            users: {
                1: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@interview.com',
                    password: btoa('admin123'),
                    role: 'admin',
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
            await fetch(`${this.DATABASE_URL}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initialData)
            });
            console.log('数据库初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // 生成JWT令牌（模拟）
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
            // 获取所有用户检查重复
            const usersResponse = await fetch(`${this.DATABASE_URL}/users.json`);
            const users = await usersResponse.json() || {};
            
            // 检查用户名和邮箱是否已存在
            const existingUser = Object.values(users).find(u => 
                u.username === userData.username || u.email === userData.email
            );
            
            if (existingUser) {
                throw new Error('用户名或邮箱已存在');
            }

            // 获取下一个用户ID
            const counterResponse = await fetch(`${this.DATABASE_URL}/counters/nextUserId.json`);
            const nextUserId = await counterResponse.json() || 2;

            const newUser = {
                id: nextUserId,
                username: userData.username,
                email: userData.email,
                password: btoa(userData.password),
                role: 'user',
                created_at: new Date().toISOString()
            };

            // 保存新用户
            await fetch(`${this.DATABASE_URL}/users/${nextUserId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            // 更新计数器
            await fetch(`${this.DATABASE_URL}/counters/nextUserId.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nextUserId + 1)
            });

            return { message: '注册成功', userId: nextUserId };
        } catch (error) {
            throw new Error(error.message || '注册失败');
        }
    }

    // 用户登录
    async login(credentials) {
        try {
            const response = await fetch(`${this.DATABASE_URL}/users.json`);
            const users = await response.json() || {};
            
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
            const counterResponse = await fetch(`${this.DATABASE_URL}/counters/nextInterviewId.json`);
            const nextInterviewId = await counterResponse.json() || 1;

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
            await fetch(`${this.DATABASE_URL}/interviews/${nextInterviewId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newInterview)
            });

            // 更新计数器
            await fetch(`${this.DATABASE_URL}/counters/nextInterviewId.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nextInterviewId + 1)
            });

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
            const response = await fetch(`${this.DATABASE_URL}/interviews.json`);
            const interviews = await response.json() || {};
            
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
            const response = await fetch(`${this.DATABASE_URL}/interviews.json`);
            const interviews = await response.json() || {};
            
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
            // 更新面试状态
            await fetch(`${this.DATABASE_URL}/interviews/${interviewId}/status.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(status)
            });

            // 更新反馈
            await fetch(`${this.DATABASE_URL}/interviews/${interviewId}/feedback.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedback || '')
            });

            return { message: '审核完成' };
        } catch (error) {
            throw new Error('更新失败，请稍后重试');
        }
    }
}

// 创建全局API实例
window.firebaseAPI = new FirebaseAPI();