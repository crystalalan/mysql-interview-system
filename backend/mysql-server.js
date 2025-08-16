const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 中间件配置 - 简化的CORS设置
app.use(cors({
    origin: '*', // 临时允许所有域名
    credentials: false, // 暂时禁用credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// 手动处理预检请求
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// MySQL数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
    user: process.env.DB_USER || 'sql12795080',
    password: process.env.DB_PASSWORD || 'FJNW2mCfWV',
    database: process.env.DB_NAME || 'sql12795080',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 获取带字符编码设置的连接
async function getConnection() {
    const connection = await pool.getConnection();
    await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET character_set_connection=utf8mb4');
    return connection;
}

// 初始化数据库表
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // 设置连接字符编码
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.execute('SET CHARACTER SET utf8mb4');
        await connection.execute('SET character_set_connection=utf8mb4');

        // 创建用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建面试表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS interviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                experience TEXT NOT NULL,
                skills TEXT NOT NULL,
                self_introduction TEXT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建默认管理员账户
        const adminPassword = bcrypt.hashSync('admin123', 10);
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password, role) 
            VALUES ('admin', 'admin@interview.com', ?, 'admin')
        `, [adminPassword]);

        connection.release();
        console.log('✅ 数据库初始化完成');
        console.log('📝 默认管理员账户: admin / admin123');
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
    }
}

// 初始化数据库
initializeDatabase();

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 管理员权限验证
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};

// 用户注册
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: '所有字段都是必填的' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        connection.release();

        res.json({ message: '注册成功', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '用户名或邮箱已存在' });
        }
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        connection.release();

        if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].password)) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 提交面试问卷
app.post('/api/interview', authenticateToken, async (req, res) => {
    const { name, phone, email, position, experience, skills, self_introduction } = req.body;

    if (!name || !phone || !email || !position || !experience || !skills || !self_introduction) {
        return res.status(400).json({ error: '所有字段都是必填的' });
    }

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(`
            INSERT INTO interviews 
            (user_id, name, phone, email, position, experience, skills, self_introduction) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [req.user.id, name, phone, email, position, experience, skills, self_introduction]);
        connection.release();

        res.json({ message: '面试问卷提交成功', interviewId: result.insertId });
    } catch (error) {
        console.error('提交面试错误:', error);
        res.status(500).json({ error: '提交失败' });
    }
});

// 获取用户的面试记录
app.get('/api/my-interviews', authenticateToken, async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM interviews WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        connection.release();

        res.json(rows);
    } catch (error) {
        console.error('获取面试记录错误:', error);
        res.status(500).json({ error: '获取面试记录失败' });
    }
});

// 管理员获取所有面试记录
app.get('/api/admin/interviews', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT i.*, u.username 
            FROM interviews i 
            JOIN users u ON i.user_id = u.id 
            ORDER BY i.created_at DESC
        `);
        connection.release();

        res.json(rows);
    } catch (error) {
        console.error('获取所有面试记录错误:', error);
        res.status(500).json({ error: '获取面试记录失败' });
    }
});

// 管理员审核面试
app.put('/api/admin/interview/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { status, feedback } = req.body;
    const interviewId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: '状态值无效' });
    }

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(
            'UPDATE interviews SET status = ?, feedback = ? WHERE id = ?',
            [status, feedback || '', interviewId]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '面试记录不存在' });
        }

        res.json({ message: '审核完成' });
    } catch (error) {
        console.error('审核面试错误:', error);
        res.status(500).json({ error: '更新失败' });
    }
});

// 根路径重定向到前端
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// 健康检查接口
app.get('/api/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`🌐 局域网访问: http://192.168.0.105:${PORT}`);
    console.log(`📝 管理员账户: admin / admin123`);
    console.log(`💡 本地访问: http://localhost:${PORT}`);
    console.log(`📱 手机访问: http://192.168.0.105:${PORT}`);
    console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`);
});