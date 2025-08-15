// 测试面试申请提交功能
async function testInterviewSubmission() {
    const railwayURL = 'https://web-production-19806.up.railway.app';
    
    console.log('🧪 测试面试申请提交功能...\n');
    
    try {
        // 1. 注册测试用户
        console.log('1. 注册测试用户...');
        const registerData = {
            username: '测试用户提交',
            email: 'testsubmit@example.com',
            password: '123456'
        };
        
        const registerResponse = await fetch(`${railwayURL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        if (registerResponse.ok) {
            const registerResult = await registerResponse.json();
            console.log('✅ 用户注册成功:', registerResult.message);
        } else {
            const error = await registerResponse.json();
            console.log('⚠️ 用户可能已存在:', error.error);
        }
        
        // 2. 登录获取token
        console.log('\n2. 用户登录...');
        const loginResponse = await fetch(`${railwayURL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: registerData.username,
                password: registerData.password
            })
        });
        
        if (!loginResponse.ok) {
            console.log('❌ 登录失败');
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ 登录成功:', loginData.user.username);
        
        // 3. 提交面试申请
        console.log('\n3. 提交面试申请...');
        const interviewData = {
            name: '张小明',
            phone: '13800138000',
            email: 'zhangxiaoming@test.com',
            position: '前端工程师',
            experience: '我有三年的前端开发经验，熟悉React和Vue框架',
            skills: '精通JavaScript、HTML、CSS、React、Vue',
            self_introduction: '我是一名热爱技术的前端工程师，具有良好的团队合作精神'
        };
        
        const interviewResponse = await fetch(`${railwayURL}/api/interview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify(interviewData)
        });
        
        if (interviewResponse.ok) {
            const result = await interviewResponse.json();
            console.log('✅ 面试申请提交成功:', result.message);
            console.log('面试ID:', result.interviewId);
        } else {
            const error = await interviewResponse.json();
            console.log('❌ 面试申请提交失败:', error.error);
            
            // 显示详细的字段信息用于调试
            console.log('\n🔍 提交的数据:');
            Object.keys(interviewData).forEach(key => {
                console.log(`${key}: "${interviewData[key]}" (长度: ${interviewData[key].length})`);
            });
        }
        
        // 4. 验证管理员可以看到申请
        console.log('\n4. 验证管理员可以查看申请...');
        const adminLoginResponse = await fetch(`${railwayURL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'crystalalan',
                password: '123456'
            })
        });
        
        if (adminLoginResponse.ok) {
            const adminData = await adminLoginResponse.json();
            
            const interviewsResponse = await fetch(`${railwayURL}/api/admin/interviews`, {
                headers: {
                    'Authorization': `Bearer ${adminData.token}`
                }
            });
            
            if (interviewsResponse.ok) {
                const interviews = await interviewsResponse.json();
                console.log(`✅ 管理员可以查看 ${interviews.length} 个面试申请`);
                
                // 查找刚提交的申请
                const newInterview = interviews.find(i => i.name === interviewData.name);
                if (newInterview) {
                    console.log('✅ 找到刚提交的申请:', newInterview.name);
                }
            }
        }
        
        console.log('\n🎉 面试申请功能测试完成！');
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
    }
}

testInterviewSubmission();