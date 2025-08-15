// 修复中文字符集问题
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

async function fixCharset() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 检查当前数据库和表的字符集...');
        
        // 检查数据库字符集
        const [dbCharset] = await connection.execute(`
            SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
            FROM information_schema.SCHEMATA 
            WHERE SCHEMA_NAME = ?
        `, [dbConfig.database]);
        
        console.log('数据库字符集:', dbCharset[0]);
        
        // 检查表字符集
        const [tableCharset] = await connection.execute(`
            SELECT TABLE_NAME, TABLE_COLLATION 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'interviews')
        `, [dbConfig.database]);
        
        console.log('表字符集:', tableCharset);
        
        // 检查列字符集
        const [columnCharset] = await connection.execute(`
            SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'interviews')
            AND DATA_TYPE IN ('varchar', 'text', 'char')
        `, [dbConfig.database]);
        
        console.log('列字符集:', columnCharset);
        
        console.log('\n🔧 修复字符集...');
        
        // 修改数据库字符集
        await connection.query(`ALTER DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 数据库字符集已修复');
        
        // 修改表字符集
        await connection.query(`ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`ALTER TABLE interviews CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 表字符集已修复');
        
        // 测试插入中文数据
        console.log('\n🧪 测试中文数据插入...');
        
        // 设置连接字符集
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.execute('SET CHARACTER SET utf8mb4');
        await connection.execute('SET character_set_connection=utf8mb4');
        
        // 插入测试数据
        const testData = {
            name: '测试用户',
            phone: '13800138000',
            email: 'test@example.com',
            position: '前端工程师',
            experience: '我有三年的前端开发经验',
            skills: '精通JavaScript、Vue、React',
            self_introduction: '我是一名热爱技术的工程师'
        };
        
        try {
            await connection.execute(`
                INSERT INTO interviews 
                (user_id, name, phone, email, position, experience, skills, self_introduction) 
                VALUES (1, ?, ?, ?, ?, ?, ?, ?)
            `, [testData.name, testData.phone, testData.email, testData.position, 
                testData.experience, testData.skills, testData.self_introduction]);
            
            console.log('✅ 中文数据插入成功');
            
            // 读取测试数据
            const [rows] = await connection.execute('SELECT * FROM interviews WHERE name = ?', [testData.name]);
            console.log('📖 读取的数据:', rows[0]);
            
            if (rows[0] && rows[0].name === testData.name) {
                console.log('🎉 中文字符集修复成功！');
            } else {
                console.log('❌ 中文字符集仍有问题');
            }
            
        } catch (error) {
            console.log('❌ 测试数据插入失败:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
}

fixCharset();