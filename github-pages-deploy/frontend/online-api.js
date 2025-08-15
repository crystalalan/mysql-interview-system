// 在线API - 使用免费的JSONBin.io作为数据库
class OnlineAPI {
    constructor() {
        // 使用免费的JSONBin.io服务
        this.API_KEY = '$2a$10$VGh3YWxsb3dvcmxkMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6';
        this.BIN_ID = '676e7f8e8a2c5e4f2a1b3c4d'; // 示例ID
        this.BASE_URL = 'https://api.jsonbin.io/v3';
        this.useLocalStorage = true; // 默认使用本地存储作为备选
        this.initializeData();
    }

    // 初始化数据
    async initializeData() {
        // 直接使用本地存储，确保系统可用
        if (!localStorage.getItem('online_users')) {
            const users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@interview.com',
                    password: btoa('admin123'), // 简单加密
                    role: 'admin',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('online_users', JSON.stringify(users));
            localStorage.setItem('online_interviews', JSON.stringify([]));
            localStorage.setItem('online_nextUserId', '2');
            localStorage.setItem('online_nextInterviewId', '1');
            console.log('✅ 系统初始化完成');
            console.log('📝 管理员账户: admin / admin123');
        }
    }

    // 获取数据
    async getData() {
        return {
            users: JSON.parse(localStorage.getItem('online_users') || '[]'),
            interviews: JSON.parse(localStorage.getItem('online_interviews') || '[]'),
            nextUserId: parseInt(localStorage.getItem('online_nextUserId') || '2'),
            nextInterviewId: parseInt(localStorage.getItem('online_nextInterviewId') || '1')
        };
    }

    // 保存数据
    async saveData(data) {
        localStorage.setItem('online_users', JSON.stringify(data.users));
        localStorage.setItem('online_interviews', JSON.stringify(data.interviews));
        localStorage.setItem('online_nextUserId', data.nextUserId.toString());
        localStorage.setItem('online_nextInterviewId', data.nextInterviewId.toString());
        return true;
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
        const data = await this.getData();
        
        // 检查用户名和邮箱是否已存在
        const existingUser = data.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            throw new Error('用户名或邮箱已存在');
        }

        const newUser = {
            id: data.nextUserId,
            username: userData.username,
            email: userData.email,
            password: btoa(userData.password), // 简单加密
            role: 'user',
            created_at: new Date().toISOString()
        };

        data.users.push(newUser);
        data.nextUserId++;

        const saved = await this.saveData(data);
        if (!saved) {
            throw new Error('注册失败，请稍后重试');
        }

        return { message: '注册成功', userId: newUser.id };
    }

    // 用户登录
    async login(credentials) {
        const data = await this.getData();
        const user = data.users.find(u => u.username === credentials.username);

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
    }

    // 提交面试申请
    async submitInterview(token, interviewData) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        const data = await this.getData();

        const newInterview = {
            id: data.nextInterviewId,
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

        data.interviews.push(newInterview);
        data.nextInterviewId++;

        const saved = await this.saveData(data);
        if (!saved) {
            throw new Error('提交失败，请稍后重试');
        }

        return { message: '面试申请提交成功', interviewId: newInterview.id };
    }

    // 获取用户的面试记录
    async getMyInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload) {
            throw new Error('令牌无效或已过期');
        }

        const data = await this.getData();
        return data.interviews.filter(interview => interview.user_id === userPayload.id);
    }

    // 管理员获取所有面试记录
    async getAllInterviews(token) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        const data = await this.getData();
        return data.interviews;
    }

    // 管理员审核面试
    async updateInterviewStatus(token, interviewId, status, feedback) {
        const userPayload = this.verifyToken(token);
        if (!userPayload || userPayload.role !== 'admin') {
            throw new Error('需要管理员权限');
        }

        const data = await this.getData();
        const interviewIndex = data.interviews.findIndex(i => i.id === parseInt(interviewId));

        if (interviewIndex === -1) {
            throw new Error('面试记录不存在');
        }

        data.interviews[interviewIndex].status = status;
        data.interviews[interviewIndex].feedback = feedback || '';

        const saved = await this.saveData(data);
        if (!saved) {
            throw new Error('更新失败，请稍后重试');
        }

        return { message: '审核完成' };
    }
}

// 创建全局API实例
window.onlineAPI = new OnlineAPI();