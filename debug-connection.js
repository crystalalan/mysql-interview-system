// 调试连接脚本
console.log('开始调试连接...');

const API_BASE = 'https://web-production-19806.up.railway.app/api';

// 测试健康检查
async function testHealth() {
    console.log('测试健康检查...');
    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('健康检查响应状态:', response.status);
        console.log('健康检查响应头:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('健康检查数据:', data);
        
        return response.ok;
    } catch (error) {
        console.error('健康检查失败:', error);
        return false;
    }
}

// 测试登录
async function testLogin() {
    console.log('测试登录...');
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        console.log('登录响应状态:', response.status);
        console.log('登录响应头:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('登录响应数据:', data);
        
        return response.ok;
    } catch (error) {
        console.error('登录测试失败:', error);
        return false;
    }
}

// 运行测试
async function runTests() {
    console.log('当前域名:', window.location.origin);
    console.log('API地址:', API_BASE);
    
    const healthOk = await testHealth();
    if (healthOk) {
        console.log('✅ 健康检查通过');
        const loginOk = await testLogin();
        if (loginOk) {
            console.log('✅ 登录测试通过');
        } else {
            console.log('❌ 登录测试失败');
        }
    } else {
        console.log('❌ 健康检查失败');
    }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
    window.runConnectionTest = runTests;
    console.log('在控制台中运行 runConnectionTest() 来测试连接');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined') {
    module.exports = { testHealth, testLogin, runTests };
}