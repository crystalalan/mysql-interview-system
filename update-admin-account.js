// 修改管理员账户用户名和密码
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const dbConfig = {
    host: 'sql12.freesqldatabase.com',
    user: 'sql12795080',
    password: 'FJNW2mCfWV',
    database: 'sql12795080',
    port: 3306,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
};

// 创建输入接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 获取用户输入的函数
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function updateAdminAccount() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // 设置字符编码
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.execute('SET CHARACTER SET utf8mb4');
        await connection.execute('SET character_set_connection=utf8mb4');
        
        console.log('🔍 当前管理员账户信息:');
        
        // 查看当前管理员信息
        const [admins] = await connection.execute("SELECT id, username, email FROM users WHERE role = 'admin'");
        if (admins.length === 0) {
            console.log('❌ 未找到管理员账户！');
            await connection.end();
            rl.close();
            return;
        }
        
        const currentAdmin = admins[0];
        console.log(`当前用户名: ${currentAdmin.username}`);
        console.log(`当前邮箱: ${currentAdmin.email}`);
        console.log('');
        
        // 获取新的用户名
        const newUsername = await askQuestion('请输入新的用户名 (直接回车保持不变): ');
        
        // 获取新的邮箱
        const newEmail = await askQuestion('请输入新的邮箱 (直接回车保持不变): ');
        
        // 获取新的密码
        const newPassword = await askQuestion('请输入新的密码 (直接回车保持不变): ');
        
        console.log('\n🔄 正在更新管理员账户...');
        
        // 准备更新数据
        let updateFields = [];
        let updateValues = [];
        
        if (newUsername.trim()) {
            updateFields.push('username = ?');
            updateValues.push(newUsername.trim());
        }
        
        if (newEmail.trim()) {
            updateFields.push('email = ?');
            updateValues.push(newEmail.trim());
        }
        
        if (newPassword.trim()) {
            const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        if (updateFields.length === 0) {
            console.log('⚠️ 没有任何更改，操作取消。');
            await connection.end();
            rl.close();
            return;
        }
        
        // 执行更新
        updateValues.push(currentAdmin.id);
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        const [result] = await connection.execute(updateQuery, updateValues);
        
        if (result.affectedRows > 0) {
            console.log('✅ 管理员账户更新成功！');
            
            // 显示更新后的信息
            const [updatedAdmin] = await connection.execute("SELECT username, email FROM users WHERE id = ?", [currentAdmin.id]);
            console.log('\n📋 更新后的管理员信息:');
            console.log(`用户名: ${updatedAdmin[0].username}`);
            console.log(`邮箱: ${updatedAdmin[0].email}`);
            if (newPassword.trim()) {
                console.log(`密码: ${newPassword.trim()} (已加密存储)`);
            }
            
            console.log('\n🎉 请使用新的账户信息登录系统！');
            console.log(`登录地址: https://remarkable-conkies-39365e.netlify.app`);
            
        } else {
            console.log('❌ 更新失败，请重试。');
        }
        
        await connection.end();
        rl.close();
        
    } catch (error) {
        console.error('❌ 更新失败:', error);
        rl.close();
    }
}

console.log('🔧 管理员账户修改工具');
console.log('====================');
console.log('');

updateAdminAccount();