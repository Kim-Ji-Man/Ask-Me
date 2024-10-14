const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const indexRouter = require("./router/index");


app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우터 등록
app.use("/", indexRouter);

// 서버 시작
const port = 8300;
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});