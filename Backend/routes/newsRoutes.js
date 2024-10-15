const express = require('express');
const Parser = require('rss-parser');
const puppeteer = require('puppeteer');

const router = express.Router();
const parser = new Parser();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: News related to "묻지마"
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags: [News]
 *     summary: Fetch latest "묻지마" related news
 *     description: Returns the top 5 latest news articles related to "묻지마" along with the main image found in each article.
 *     responses:
 *       200:
 *         description: A list of news articles with titles, links, and images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The title of the news article
 *                   link:
 *                     type: string
 *                     description: The URL of the news article
 *                   image:
 *                     type: string
 *                     description: The main image found in the article, or a placeholder if not available
 *       500:
 *         description: Failed to fetch news
 */

/**
 * 주어진 URL에서 메인 이미지를 가져오는 함수
 * @param {string} url - 뉴스 기사 URL
 * @returns {string} - 메인 이미지 URL 또는 대체 이미지 URL
 */
const fetchMainImage = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 메타 태그에서 og:image를 찾아서 가져옴
    const imageUrl = await page.evaluate(() => {
      const metaImage = document.querySelector('meta[property="og:image"]');
      return metaImage ? metaImage.content : null;
    });

    await browser.close();

    // 이미지가 없을 경우 대체 이미지 URL 반환
    return imageUrl || 'https://via.placeholder.com/150';
  } catch (error) {
    console.error(`Error fetching main image for URL ${url}:`, error);
    return 'https://via.placeholder.com/150'; // 에러 발생 시 대체 이미지
  }
};

router.get('/news', async (req, res) => {
  try {
    // RSS 피드를 가져오고, 최대 5개의 뉴스 항목을 선택
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=%EB%AC%BB%EC%A7%80%EB%A7%88&hl=ko&gl=KR&ceid=KR:ko');
    const items = feed.items.slice(0, 5);

    // 각 뉴스 항목에 대해 메인 이미지 가져오기
    const newsWithImages = await Promise.all(items.map(async (item) => {
      const image = await fetchMainImage(item.link);
      return { ...item, image };
    }));

    res.json(newsWithImages); // JSON 형식으로 응답 반환
  } catch (error) {
    console.error('Failed to fetch news:', error);
    res.status(500).send('Failed to fetch news'); // 에러 발생 시 500 상태 코드 반환
  }
});

module.exports = router;
