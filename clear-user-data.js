// 清除管理员以外的所有用户数据
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'sql12.freesqldatabase.com',
    user: 'sql12795080',
    password: 'FJNW2mCfWV',
    database: 'sql12795080',
    port: 3306,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
};

async function clearUserData() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // 设置字符编码
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.execute('SET CHARACTER SET utf8mb4');
        await connection.execute('SET character_set_connection=utf8mb4');
        
        console.log('🔍 检查当前数据状态...');
        
        // 查看当前用户数量
        const [users] = await connection.execute('SELECT id, username, role FROM users');
        console.log(`当前用户总数: ${users.length}`);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
        });
        
        // 查看当前面试申请数量
        const [interviews] = await connection.execute('SELECT COUNT(*) as count FROM interviews');
        console.log(`当前面试申请总数: ${interviews[0].count}`);
        
        console.log('\n🧹 开始清理数据...');
        
        // 1. 删除所有面试记录
        const [deleteInterviews] = await connection.execute('DELETE FROM interviews');
        console.log(`✅ 已删除 ${deleteInterviews.affectedRows} 个面试申请`);
        
        // 2. 删除管理员以外的所有用户
        const [deleteUsers] = await connection.execute("DELETE FROM users WHERE role != 'admin'");
        console.log(`✅ 已删除 ${deleteUsers.affectedRows} 个普通用户`);
        
        // 3. 重置自增ID
        await connection.execute('ALTER TABLE interviews AUTO_INCREMENT = 1');
        await connection.execute('ALTER TABLE users AUTO_INCREMENT = 2'); // 管理员ID是1，所以从2开始
        console.log('✅ 已重置自增ID');
        
        console.log('\n🔍 验证清理结果...');
        
        // 验证清理结果
        const [remainingUsers] = await connection.execute('SELECT id, username, role FROM users');
        console.log(`剩余用户数: ${remainingUsers.length}`);
        remainingUsers.forEach(user => {
            console.log(`- ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
        });
        
        const [remainingInterviews] = await connection.execute('SELECT COUNT(*) as count FROM interviews');
        console.log(`剩余面试申请数: ${remainingInterviews[0].count}`);
        
        await connection.end();
        
        console.log('\n🎉 数据清理完成！');
        console.log('系统已重置为初始状态，只保留管理员账户。');
        
    } catch (error) {
        console.error('❌ 清理失败:', error);
    }
}

clearUserData();