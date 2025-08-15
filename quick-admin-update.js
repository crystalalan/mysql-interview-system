// 快速修改管理员账户 - 直接在代码中设置新信息
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 在这里设置新的管理员信息
const NEW_ADMIN_INFO = {
    username: 'crystalalan',    // 修改这里的用户名
    email: 'crystalalan@163.com',      // 修改这里的邮箱
    password: '123456'          // 修改这里的密码
};

const dbConfig = {
    host: 'sql12.freesqldatabase.com',
    user: 'sql12795080',
    password: 'FJNW2mCfWV',
    database: 'sql12795080',
    port: 3306,
    charset: 'utf8mb4'
};

async function quickUpdateAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute('SET NAMES utf8mb4');
        
        const hashedPassword = bcrypt.hashSync(NEW_ADMIN_INFO.password, 10);
        
        const [result] = await connection.execute(
            "UPDATE users SET username = ?, email = ?, password = ? WHERE role = 'admin'",
            [NEW_ADMIN_INFO.username, NEW_ADMIN_INFO.email, hashedPassword]
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ 管理员账户更新成功！');
            console.log(`新用户名: ${NEW_ADMIN_INFO.username}`);
            console.log(`新邮箱: ${NEW_ADMIN_INFO.email}`);
            console.log(`新密码: ${NEW_ADMIN_INFO.password}`);
        } else {
            console.log('❌ 更新失败');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ 错误:', error);
    }
}

quickUpdateAdmin();