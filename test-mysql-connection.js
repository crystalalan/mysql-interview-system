// MySQL连接测试
const mysql = require('mysql2/promise');

// 免费MySQL服务配置
const dbConfigs = [
    {
        name: 'FreeSQLDatabase',
        host: 'sql12.freesqldatabase.com',
        user: 'sql12795080',
        password: 'FJNW2mCfWV',
        database: 'sql12795080',
        port: 3306
    },
    {
        name: 'PlanetScale',
        host: 'aws.connect.psdb.cloud',
        user: 'your_username',
        password: 'your_password',
        database: 'interview_system',
        port: 3306,
        ssl: { rejectUnauthorized: false }
    },
    {
        name: 'Railway MySQL',
        host: 'containers-us-west-1.railway.app',
        user: 'root',
        password: 'your_password',
        database: 'railway',
        port: 3306
    }
];

async function testConnection(config) {
    console.log(`\n🔍 测试连接: ${config.name}`);
    console.log(`主机: ${config.host}`);
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ 连接成功!');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询测试成功:', rows[0]);
        
        await connection.end();
        return true;
    } catch (error) {
        console.log('❌ 连接失败:', error.message);
        return false;
    }
}

async function testAllConnections() {
    console.log('🚀 开始测试MySQL连接...\n');
    
    for (const config of dbConfigs) {
        const success = await testConnection(config);
        if (success) {
            console.log(`\n🎉 推荐使用: ${config.name}`);
            console.log('请将此配置添加到环境变量中');
            break;
        }
    }
    
    console.log('\n📝 如果所有连接都失败，请：');
    console.log('1. 注册免费MySQL服务: https://www.freesqldatabase.com');
    console.log('2. 获取数据库连接信息');
    console.log('3. 更新配置并重新测试');
}

// 运行测试
testAllConnections().catch(console.error);