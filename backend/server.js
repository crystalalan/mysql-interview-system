const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 内存数据存储
let users = [];
let interviews = [];
let nextUserId = 1;
let nextInterviewId = 1;

// 初始化数据
function initializeData() {
  // 创建默认管理员账户
  const adminPassword = bcrypt.hashSync('admin123', 10);
  users.push({
    id: nextUserId++,
    username: 'admin',
    email: 'admin@interview.com',
    password: adminPassword,
    role: 'admin',
    created_at: new Date().toISOString()
  });
  
  console.log('数据初始化完成');
  console.log('默认管理员账户: admin / admin123');
}

// 初始化数据
initializeData();

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
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: '所有字段都是必填的' });
  }

  // 检查用户名和邮箱是否已存在
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: '用户名或邮箱已存在' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = {
    id: nextUserId++,
    username,
    email,
    password: hashedPassword,
    role: 'user',
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  res.json({ message: '注册成功', userId: newUser.id });
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
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
});

// 提交面试问卷
app.post('/api/interview', authenticateToken, (req, res) => {
  const { name, phone, email, position, experience, skills, self_introduction } = req.body;
  
  if (!name || !phone || !email || !position || !experience || !skills || !self_introduction) {
    return res.status(400).json({ error: '所有字段都是必填的' });
  }
  
  const newInterview = {
    id: nextInterviewId++,
    user_id: req.user.id,
    username: req.user.username,
    name,
    phone,
    email,
    position,
    experience,
    skills,
    self_introduction,
    status: 'pending',
    feedback: '',
    created_at: new Date().toISOString()
  };
  
  interviews.push(newInterview);
  res.json({ message: '面试问卷提交成功', interviewId: newInterview.id });
});

// 获取用户的面试记录
app.get('/api/my-interviews', authenticateToken, (req, res) => {
  const userInterviews = interviews
    .filter(interview => interview.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json(userInterviews);
});

// 管理员获取所有面试记录
app.get('/api/admin/interviews', authenticateToken, requireAdmin, (req, res) => {
  const allInterviews = interviews
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json(allInterviews);
});

// 管理员审核面试
app.put('/api/admin/interview/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status, feedback } = req.body;
  const interviewId = parseInt(req.params.id);
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: '状态值无效' });
  }
  
  const interviewIndex = interviews.findIndex(i => i.id === interviewId);
  
  if (interviewIndex === -1) {
    return res.status(404).json({ error: '面试记录不存在' });
  }
  
  interviews[interviewIndex].status = status;
  interviews[interviewIndex].feedback = feedback || '';
  
  res.json({ message: '审核完成' });
});

// 根路径重定向到前端
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 管理员账户: admin / admin123`);
  console.log(`💡 访问 http://localhost:${PORT} 开始使用面试系统`);
});