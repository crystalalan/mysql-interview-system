// 模拟API - 使用localStorage作为数据存储
class MockAPI {
    constructor() {
        this.initializeData();
    }

    // 初始化数据
    initializeData() {
        if (!localStorage.getItem('users')) {
            const users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@interview.com',
                    password: this.hashPassword('admin123'),
                    role: 'admin',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }

        if (!localStorage.getItem('interviews')) {
            localStorage.setItem('interviews', JSON.stringify([]));
        }

        if (!localStorage.getItem('nextUserId')) {
            localStorage.setItem('nextUserId', '2');
        }

        if (!localStorage.getItem('nextInterviewId')) {
            localStorage.setItem('nextInterviewId', '1');
        }
    }

    // 简单的密码哈希
    hashPassword(password) {
        return btoa(password); // 简单的base64编码，实际项目中应使用更安全的方法
    }

    // 验证密码
    verifyPassword(password, hash) {
        return btoa(password) === hash;
    }

    // 生成JWT令牌（模拟）
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
        };
        return btoa(JSON.stringify(payload));
    }

    // 验证令牌
    verifyToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            if (payload.exp < Date.now()) {
                return null; // 令牌已过期
            }
            return payload;
        } catch (error) {
            return null;
        }
    }

    // 用户注册
    async register(userData) {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // 检查用户名和邮箱是否已存在
        const existingUser = users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            throw new Error('用户名或邮箱已存在');
        }

        const nextId = parseInt(localStorage.getItem('nextUserId'));
        const newUser = {
            id: nextId,
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password),
            role: 'user',
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('nextUserId', (nextId + 1).toString());

        return { message: '注册成功', userId: nextId };
    }

    // 用户登录
    async login(credentials) {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === credentials.username);

        if (!user || !this.verifyPassword(credentials.password, user.password)) {
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
    }

    // 提交面试申请
    async submitInterview(token, interviewData) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        const interviews = JSON.parse(localStorage.getItem('interviews'));
        const nextId = parseInt(localStorage.getItem('nextInterviewId'));

        const newInterview = {
            id: nextId,
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

        interviews.push(newInterview);
        localStorage.setItem('interviews', JSON.stringify(interviews));
        localStorage.setItem('nextInterviewId', (nextId + 1).toString());

        return { message: '面试申请提交成功', interviewId: nextId };
    }

    // 获取用户的面试记录
    async getMyInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        const interviews = JSON.parse(localStorage.getItem('interviews'));
        return interviews.filter(interview => interview.user_id === userPayload.id);
    }

    // 管理员获取所有面试记录
    async getAllInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        const interviews = JSON.parse(localStorage.getItem('interviews'));
        return interviews;
    }

    // 管理员审核面试
    async updateInterviewStatus(token, interviewId, status, feedback) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        const interviews = JSON.parse(localStorage.getItem('interviews'));
        const interviewIndex = interviews.findIndex(i => i.id === parseInt(interviewId));

        if (interviewIndex === -1) {
            throw new Error('面试记录不存在');
        }

        interviews[interviewIndex].status = status;
        interviews[interviewIndex].feedback = feedback || '';
        localStorage.setItem('interviews', JSON.stringify(interviews));

        return { message: '审核完成' };
    }
}

// 创建全局API实例
window.mockAPI = new MockAPI();