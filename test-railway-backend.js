// 测试Railway后端部署
async function testRailwayBackend() {
    const railwayURL = 'https://web-production-19806.up.railway.app';
    
    console.log('🧪 测试Railway后端部署...\n');
    
    try {
        // 1. 健康检查
        console.log('1. 测试健康检查...');
        const healthResponse = await fetch(`${railwayURL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ 健康检查:', healthData);
        
        // 2. 测试管理员登录
        console.log('\n2. 测试管理员登录...');
        const loginResponse = await fetch(`${railwayURL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'crystalalan',
                password: 'admin123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ 管理员登录成功:', loginData.user);
            
            // 3. 测试获取面试记录
            console.log('\n3. 测试获取面试记录...');
            const interviewsResponse = await fetch(`${railwayURL}/api/admin/interviews`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            if (interviewsResponse.ok) {
                const interviews = await interviewsResponse.json();
                console.log('✅ 获取面试记录成功，数量:', interviews.length);
            } else {
                console.log('❌ 获取面试记录失败');
            }
        } else {
            console.log('❌ 管理员登录失败');
        }
        
        console.log('\n🎉 Railway后端测试完成！');
        console.log(`🌐 后端地址: ${railwayURL}`);
        console.log(`🔍 健康检查: ${railwayURL}/api/health`);
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
        console.log('\n可能的原因:');
        console.log('1. Railway还在部署中，请稍等几分钟');
        console.log('2. URL地址不正确');
        console.log('3. 环境变量配置有误');
        console.log('4. 数据库连接问题');
    }
}

// 运行测试
testRailwayBackend();