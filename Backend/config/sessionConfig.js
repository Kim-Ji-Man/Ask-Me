const session = require('express-session');

const sessionConfig = {
    secret: 'your_secret_key', // 세션 비밀키
    resave: false,              // 세션이 변하지 않아도 항상 다시 저장할지 여부
    saveUninitialized: true,    // 초기화되지 않은 세션을 저장할지 여부
    cookie: { secure: false }   // HTTPS 사용 시 true로 설정 (개발 환경에서는 false로)
};

module.exports = sessionConfig;
