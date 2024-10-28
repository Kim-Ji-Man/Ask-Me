// controllers/kakaoAuth.js
const axios = require('axios');
const qs = require('qs');

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me';

async function kakaoLogin(req, res) {
    const { code } = req.query; 

    if (!code) {
        return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    if (!process.env.KAKAO_REST_API_KEY || !process.env.REDIRECT_URI) {
        return res.status(500).json({ success: false, message: 'Environment variables are missing' });
    }

    try {
        const tokenResponse = await axios.post(KAKAO_TOKEN_URL, qs.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_REST_API_KEY,
            redirect_uri: process.env.REDIRECT_URI,
            code: code,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const userInfoResponse = await axios.get(KAKAO_USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${tokenResponse.data.access_token}`,
            },
        });

        res.status(200).json({ success: true, userInfo: userInfoResponse.data });
    } catch (error) {
        console.error('Kakao login error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Kakao login failed', error: error.response ? error.response.data : error.message });
    }
}

module.exports = { kakaoLogin };
