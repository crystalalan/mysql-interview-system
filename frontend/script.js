// 全局变量
let currentUser = null;
let authToken = null;

// API基础URL - 自动检测环境
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

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
    loadMyInterviews();
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
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
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
        } else {
            showAlert(data.error || '登录失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('注册成功！请登录', 'success');
            showLogin();
            // 清空表单
            document.getElementById('registerForm').reset();
        } else {
            showAlert(data.error || '注册失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
    }
}

// 处理面试申请提交
async function handleInterviewSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        experience: document.getElementById('experience').value,
        skills: document.getElementById('skills').value,
        self_introduction: document.getElementById('selfIntroduction').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/interview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('面试申请提交成功！', 'success');
            document.getElementById('interviewForm').reset();
            showMyInterviews();
        } else {
            showAlert(data.error || '提交失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
    }
}

// 加载我的面试记录
async function loadMyInterviews() {
    try {
        const response = await fetch(`${API_BASE}/my-interviews`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const interviews = await response.json();
        
        if (response.ok) {
            displayMyInterviews(interviews);
        } else {
            showAlert('加载面试记录失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
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
        const response = await fetch(`${API_BASE}/admin/interviews`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const interviews = await response.json();
        
        if (response.ok) {
            displayAdminInterviews(interviews);
        } else {
            showAlert('加载面试记录失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
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
    const feedback = document.getElementById(`feedback-${interviewId}`).value;
    await updateInterviewStatus(interviewId, 'approved', feedback);
}

// 拒绝面试
async function rejectInterview(interviewId) {
    const feedback = document.getElementById(`feedback-${interviewId}`).value;
    await updateInterviewStatus(interviewId, 'rejected', feedback);
}

// 更新面试状态
async function updateInterviewStatus(interviewId, status, feedback) {
    try {
        const response = await fetch(`${API_BASE}/admin/interview/${interviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status, feedback })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('审核完成！', 'success');
            loadAdminInterviews(); // 重新加载列表
        } else {
            showAlert(data.error || '操作失败', 'error');
        }
    } catch (error) {
        showAlert('网络错误，请稍后重试', 'error');
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