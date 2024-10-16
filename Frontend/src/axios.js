// 8-1 aixos 설정

import axios from "axios"

const instance = axios.create({
    baseURL : 'http://localhost:5000'
})

export default instance;