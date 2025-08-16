// 混合API类 - 优先使用云端数据库，回退到本地存储
class HybridAPI {
    constructor() {
        this.API_BASE = this.detectAPIBase();
        this.connected = false;
        this.initializeLocalStorage();
        this.initializeConnection();
    }
    
    // 检测API基础URL
    detectAPIBase() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        } else {
            // 生产环境连接Railway后端
            return 'https://web-production-19806.up.railway.app/api';
        }
    }
    
    // 初始化云端连接
    async initializeConnection() {
        console.log('🔄 正在连接云端数据库...', this.API_BASE);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时
            
            const response = await fetch(`${this.API_BASE}/health`, {
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 云端数据库连接成功:', data);
                this.connected = true;
                
                // 显示连接状态
                this.showConnectionStatus('云端数据库已连接，数据可跨设备同步', 'success');
                return;
            } else {
                throw new Error(`健康检查失败: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log('⚠️ 云端连接失败，使用本地存储模式');
            console.log('错误详情:', error.message);
            this.connected = false;
            this.showConnectionStatus('使用本地存储模式，数据仅在当前浏览器可用', 'warning');
        }
    }
    
    // 显示连接状态
    showConnectionStatus(message, type) {
        // 移除现有状态提示
        const existingStatus = document.querySelector('.connection-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // 创建状态提示
        const statusDiv = document.createElement('div');
        statusDiv.className = `connection-status alert ${type}`;
        statusDiv.innerHTML = `
            <strong>${type === 'success' ? '🌐' : '💾'} 连接状态:</strong> ${message}
            ${type === 'warning' ? '<br><small>如需跨设备同步，请检查网络连接后刷新页面</small>' : ''}
        `;
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            max-width: 300px;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;'}
        `;
        
        document.body.appendChild(statusDiv);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 5000);
    }
    
    // 发送HTTP请求到云端
    async makeCloudRequest(endpoint, options = {}) {
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors',
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
    }
    
    initializeLocalStorage() {
        if (!localStorage.getItem('interview_users')) {
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
            localStorage.setItem('interview_users', JSON.stringify(users));
            localStorage.setItem('interview_submissions', JSON.stringify([]));
            localStorage.setItem('interview_nextUserId', '2');
            localStorage.setItem('interview_nextSubmissionId', '1');
        }
    }
    
    async login(credentials) {
        // 优先尝试云端登录
        if (this.connected) {
            try {
                console.log('🌐 使用云端登录');
                return await this.makeCloudRequest('/login', {
                    method: 'POST',
                    body: JSON.stringify(credentials)
                });
            } catch (error) {
                console.log('云端登录失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储登录
        console.log('💾 使用本地存储登录');
        const users = JSON.parse(localStorage.getItem('interview_users') || '[]');
        const { username, password } = credentials;
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
    
    async register(userData) {
        // 优先尝试云端注册
        if (this.connected) {
            try {
                console.log('🌐 使用云端注册');
                return await this.makeCloudRequest('/register', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
            } catch (error) {
                console.log('云端注册失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储注册
        console.log('💾 使用本地存储注册');
        const users = JSON.parse(localStorage.getItem('interview_users') || '[]');
        const { username, email, password } = userData;
        
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            throw new Error('用户名或邮箱已存在');
        }
        
        const nextUserId = parseInt(localStorage.getItem('interview_nextUserId') || '2');
        const newUser = {
            id: nextUserId,
            username,
            email,
            password: btoa(password),
            role: 'user',
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('interview_users', JSON.stringify(users));
        localStorage.setItem('interview_nextUserId', (nextUserId + 1).toString());
        
        return { message: '注册成功', userId: nextUserId };
    }
    
    async submitInterview(token, interviewData) {
        // 优先尝试云端提交
        if (this.connected) {
            try {
                console.log('🌐 使用云端提交面试申请');
                return await this.makeCloudRequest('/interview', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(interviewData)
                });
            } catch (error) {
                console.log('云端提交失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储提交
        console.log('💾 使用本地存储提交');
        const tokenData = JSON.parse(atob(token));
        const submissions = JSON.parse(localStorage.getItem('interview_submissions') || '[]');
        const nextId = parseInt(localStorage.getItem('interview_nextSubmissionId') || '1');
        
        const submission = {
            id: nextId,
            user_id: tokenData.id,
            username: tokenData.username,
            ...interviewData,
            status: 'pending',
            created_at: new Date().toISOString(),
            feedback: null
        };
        
        submissions.push(submission);
        localStorage.setItem('interview_submissions', JSON.stringify(submissions));
        localStorage.setItem('interview_nextSubmissionId', (nextId + 1).toString());
        
        return { message: '面试申请提交成功', submissionId: nextId };
    }
    
    async getMyInterviews(token) {
        // 优先尝试云端获取
        if (this.connected) {
            try {
                console.log('🌐 从云端获取我的面试记录');
                return await this.makeCloudRequest('/my-interviews', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.log('云端获取失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储获取
        console.log('💾 从本地存储获取面试记录');
        const tokenData = JSON.parse(atob(token));
        const submissions = JSON.parse(localStorage.getItem('interview_submissions') || '[]');
        return submissions.filter(s => s.user_id === tokenData.id);
    }
    
    async getAllInterviews(token) {
        // 优先尝试云端获取
        if (this.connected) {
            try {
                console.log('🌐 从云端获取所有面试记录');
                return await this.makeCloudRequest('/admin/interviews', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.log('云端获取失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储获取
        console.log('💾 从本地存储获取所有面试记录');
        const tokenData = JSON.parse(atob(token));
        if (tokenData.role !== 'admin') {
            throw new Error('权限不足');
        }
        return JSON.parse(localStorage.getItem('interview_submissions') || '[]');
    }
    
    async updateInterviewStatus(token, interviewId, status, feedback) {
        // 优先尝试云端更新
        if (this.connected) {
            try {
                console.log('🌐 在云端更新面试状态');
                return await this.makeCloudRequest(`/admin/interview/${interviewId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status, feedback })
                });
            } catch (error) {
                console.log('云端更新失败，回退到本地存储:', error.message);
                this.connected = false;
                this.showConnectionStatus('云端连接中断，切换到本地模式', 'warning');
            }
        }
        
        // 本地存储更新
        console.log('💾 在本地存储更新面试状态');
        const tokenData = JSON.parse(atob(token));
        if (tokenData.role !== 'admin') {
            throw new Error('权限不足');
        }
        
        const submissions = JSON.parse(localStorage.getItem('interview_submissions') || '[]');
        const submission = submissions.find(s => s.id === parseInt(interviewId));
        
        if (!submission) {
            throw new Error('面试记录不存在');
        }
        
        submission.status = status;
        submission.feedback = feedback;
        submission.updated_at = new Date().toISOString();
        
        localStorage.setItem('interview_submissions', JSON.stringify(submissions));
        
        return { message: '审核完成' };
    }
    
    // 获取连接状态
    getConnectionStatus() {
        return {
            connected: this.connected,
            apiBase: this.API_BASE,
            mode: this.connected ? '云端数据库' : '本地存储',
            timestamp: new Date().toISOString()
        };
    }
}

// 创建全局API实例
window.mysqlAPI = new HybridAPI();

// 全局变量
let currentUser = null;
let authToken = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查本地存储的登录状态
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateNavigation();
        if (currentUser.role === 'admin') {
            showAdminPage();
        } else {
            showInterviewPage();
        }
    }
    
    // 绑定表单事件
    bindFormEvents();
});

// 绑定表单事件
function bindFormEvents() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 注册表单
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 面试表单
    document.getElementById('interviewForm').addEventListener('submit', handleInterviewSubmit);
}

// 显示页面
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示指定页面
    document.getElementById(pageId).classList.add('active');
}

// 显示欢迎页面
function showWelcome() {
    showPage('welcome-page');
}

// 显示登录页面
function showLogin() {
    showPage('login-page');
}

// 显示注册页面
function showRegister() {
    showPage('register-page');
}

// 显示面试页面
function showInterviewPage() {
    showPage('interview-page');
}

// 显示我的面试记录
function showMyInterviews() {
    showPage('my-interviews-page');
    loadMyInterviews();
}

// 显示管理员页面
function showAdminPage() {
    showPage('admin-page');
    loadAdminInterviews();
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const data = await window.mysqlAPI.login({ username, password });
        
        authToken = data.token;
        currentUser = data.user;
        
        // 保存到本地存储
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateNavigation();
        showAlert('登录成功！', 'success');
        
        // 根据用户角色跳转
        if (currentUser.role === 'admin') {
            showAdminPage();
        } else {
            showInterviewPage();
        }
    } catch (error) {
        showAlert(error.message || '登录失败', 'error');
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const data = await window.mysqlAPI.register({ username, email, password });
        
        showAlert('注册成功！请登录', 'success');
        showLogin();
        // 清空表单
        document.getElementById('registerForm').reset();
    } catch (error) {
        showAlert(error.message || '注册失败', 'error');
    }
}

// 处理面试申请提交
async function handleInterviewSubmit(e) {
    e.preventDefault();
    
    // 获取表单元素并检查是否存在
    const nameEl = document.getElementById('name');
    const phoneEl = document.getElementById('phone');
    const emailEl = document.getElementById('email');
    const positionEl = document.getElementById('position');
    const experienceEl = document.getElementById('experience');
    const skillsEl = document.getElementById('skills');
    const selfIntroEl = document.getElementById('selfIntroduction');
    
    // 检查元素是否存在
    if (!nameEl || !phoneEl || !emailEl || !positionEl || !experienceEl || !skillsEl || !selfIntroEl) {
        alert('表单元素未找到，请刷新页面重试');
        return;
    }
    
    const formData = {
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        email: emailEl.value.trim(),
        position: positionEl.value.trim(),
        experience: experienceEl.value.trim(),
        skills: skillsEl.value.trim(),
        self_introduction: selfIntroEl.value.trim()
    };
    
    // 调试信息 - 检查每个字段的值
    console.log('表单数据:', formData);
    console.log('字段长度检查:', {
        name: formData.name.length,
        phone: formData.phone.length,
        email: formData.email.length,
        position: formData.position.length,
        experience: formData.experience.length,
        skills: formData.skills.length,
        self_introduction: formData.self_introduction.length
    });
    
    // 前端验证 - 检查每个字段
    const emptyFields = [];
    
    // 更严格的验证，检查是否为空或只包含空白字符
    if (!formData.name || formData.name.length === 0) emptyFields.push('姓名');
    if (!formData.phone || formData.phone.length === 0) emptyFields.push('联系电话');
    if (!formData.email || formData.email.length === 0) emptyFields.push('邮箱地址');
    if (!formData.position || formData.position.length === 0 || formData.position === '请选择职位') emptyFields.push('应聘职位');
    if (!formData.experience || formData.experience.length === 0) emptyFields.push('工作经验');
    if (!formData.skills || formData.skills.length === 0) emptyFields.push('技能特长');
    if (!formData.self_introduction || formData.self_introduction.length === 0) emptyFields.push('自我介绍');
    
    if (emptyFields.length > 0) {
        showAlert(`请填写以下必填字段: ${emptyFields.join('、')}`, 'error');
        
        // 高亮显示未填写的字段
        emptyFields.forEach(fieldName => {
            const fieldMap = {
                '姓名': 'name',
                '联系电话': 'phone', 
                '邮箱地址': 'email',
                '应聘职位': 'position',
                '工作经验': 'experience',
                '技能特长': 'skills',
                '自我介绍': 'selfIntroduction'
            };
            const fieldId = fieldMap[fieldName];
            const element = document.getElementById(fieldId);
            if (element) {
                element.style.borderColor = '#ff4444';
                element.focus();
            }
        });
        
        return;
    }
    
    // 清除之前的错误样式
    ['name', 'phone', 'email', 'position', 'experience', 'skills', 'selfIntroduction'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.borderColor = '';
        }
    });
    
    try {
        const data = await window.mysqlAPI.submitInterview(authToken, formData);
        
        showAlert('面试申请提交成功！', 'success');
        document.getElementById('interviewForm').reset();
        showMyInterviews();
    } catch (error) {
        showAlert(error.message || '提交失败', 'error');
    }
}

// 加载我的面试记录
async function loadMyInterviews() {
    try {
        const interviews = await window.mysqlAPI.getMyInterviews(authToken);
        displayMyInterviews(interviews);
    } catch (error) {
        showAlert(error.message || '加载面试记录失败', 'error');
    }
}

// 显示我的面试记录
function displayMyInterviews(interviews) {
    const container = document.getElementById('myInterviewsList');
    
    if (interviews.length === 0) {
        container.innerHTML = '<p>暂无面试记录</p>';
        return;
    }
    
    container.innerHTML = interviews.map(interview => `
        <div class="interview-card">
            <div class="interview-header">
                <h3>${interview.position}</h3>
                <span class="status ${interview.status}">${getStatusText(interview.status)}</span>
            </div>
            <div class="interview-info">
                <div class="info-item">
                    <span class="info-label">姓名</span>
                    <span class="info-value">${interview.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">联系电话</span>
                    <span class="info-value">${interview.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">邮箱</span>
                    <span class="info-value">${interview.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">申请时间</span>
                    <span class="info-value">${formatDate(interview.created_at)}</span>
                </div>
            </div>
            ${interview.feedback ? `
                <div class="feedback-section">
                    <div class="info-label">反馈意见</div>
                    <div class="info-value">${interview.feedback}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 加载管理员面试记录
async function loadAdminInterviews() {
    try {
        const interviews = await window.mysqlAPI.getAllInterviews(authToken);
        displayAdminInterviews(interviews);
    } catch (error) {
        showAlert(error.message || '加载面试记录失败', 'error');
    }
}

// 显示管理员面试记录
function displayAdminInterviews(interviews) {
    const container = document.getElementById('adminInterviewsList');
    
    if (interviews.length === 0) {
        container.innerHTML = '<p>暂无面试记录</p>';
        return;
    }
    
    container.innerHTML = interviews.map(interview => `
        <div class="interview-card">
            <div class="interview-header">
                <h3>${interview.position} - ${interview.name}</h3>
                <span class="status ${interview.status}">${getStatusText(interview.status)}</span>
            </div>
            <div class="interview-info">
                <div class="info-item">
                    <span class="info-label">申请用户</span>
                    <span class="info-value">${interview.username}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">联系电话</span>
                    <span class="info-value">${interview.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">邮箱</span>
                    <span class="info-value">${interview.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">申请时间</span>
                    <span class="info-value">${formatDate(interview.created_at)}</span>
                </div>
            </div>
            <div class="interview-info">
                <div class="info-item">
                    <span class="info-label">工作经验</span>
                    <span class="info-value">${interview.experience}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">技能特长</span>
                    <span class="info-value">${interview.skills}</span>
                </div>
            </div>
            <div class="interview-info">
                <div class="info-item">
                    <span class="info-label">自我介绍</span>
                    <span class="info-value">${interview.self_introduction}</span>
                </div>
            </div>
            ${interview.status === 'pending' ? `
                <div class="feedback-section">
                    <textarea class="feedback-input" id="feedback-${interview.id}" placeholder="请输入反馈意见..."></textarea>
                    <div class="admin-actions">
                        <button class="btn success" onclick="approveInterview(${interview.id})">通过</button>
                        <button class="btn danger" onclick="rejectInterview(${interview.id})">不通过</button>
                    </div>
                </div>
            ` : interview.feedback ? `
                <div class="feedback-section">
                    <div class="info-label">反馈意见</div>
                    <div class="info-value">${interview.feedback}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 通过面试
async function approveInterview(interviewId) {
    const feedback = document.getElementById(`feedback-${interviewId}`).value.trim();
    console.log('审核通过:', { interviewId, status: 'approved', feedback });
    await updateInterviewStatus(interviewId, 'approved', feedback);
}

// 拒绝面试
async function rejectInterview(interviewId) {
    const feedback = document.getElementById(`feedback-${interviewId}`).value.trim();
    console.log('审核拒绝:', { interviewId, status: 'rejected', feedback });
    await updateInterviewStatus(interviewId, 'rejected', feedback);
}

// 更新面试状态
async function updateInterviewStatus(interviewId, status, feedback) {
    try {
        console.log('发送审核请求:', { 
            interviewId: interviewId, 
            status: status, 
            feedback: feedback,
            token: authToken ? 'exists' : 'missing'
        });
        
        // 验证参数
        if (!interviewId) {
            throw new Error('面试ID缺失');
        }
        if (!status || !['approved', 'rejected'].includes(status)) {
            throw new Error(`状态值无效: ${status}`);
        }
        if (!authToken) {
            throw new Error('认证令牌缺失');
        }
        
        const data = await window.mysqlAPI.updateInterviewStatus(authToken, interviewId, status, feedback || '');
        
        showAlert('审核完成！', 'success');
        loadAdminInterviews(); // 重新加载列表
    } catch (error) {
        console.error('审核失败:', error);
        showAlert(error.message || '操作失败', 'error');
    }
}

// 更新导航栏
function updateNavigation() {
    const nav = document.getElementById('nav');
    
    if (currentUser) {
        nav.innerHTML = `
            <span>欢迎，${currentUser.username}</span>
            ${currentUser.role === 'admin' ? 
                '<button class="nav-btn" onclick="showAdminPage()">面试管理</button>' : 
                `<button class="nav-btn" onclick="showInterviewPage()">填写面试</button>
                 <button class="nav-btn" onclick="showMyInterviews()">我的面试</button>`
            }
            <button class="nav-btn" onclick="logout()">退出登录</button>
        `;
    } else {
        nav.innerHTML = `
            <button id="loginBtn" class="nav-btn" onclick="showLogin()">登录</button>
            <button id="registerBtn" class="nav-btn" onclick="showRegister()">注册</button>
        `;
    }
}

// 退出登录
function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateNavigation();
    showWelcome();
    showAlert('已退出登录', 'success');
}

// 显示提示信息
function showAlert(message, type) {
    // 移除现有的提示
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 创建新的提示
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    // 插入到页面顶部
    const mainContent = document.getElementById('main-content');
    mainContent.insertBefore(alert, mainContent.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '未通过'
    };
    return statusMap[status] || status;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}