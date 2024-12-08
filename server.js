const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();

// Glitch에서 정적 파일 제공
app.use(express.static("public"));
app.use(bodyParser.json());

// Horoscope API 엔드포인트
app.post("/api/horoscope", async (req, res) => {
    const { gender, birthdate } = req.body;

    try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", 
                 "--disable-setuid-sandbox", 
                 "--disable-gpu",
                 "--disable-dev-shm-usage",
                 "--single-process",
                 "--no-zygote",
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser", // Koyeb 환경에서 Chromium 경로 설정
          userDataDir: "/tmp" // Koyeb의 제한된 환경에서 임시 데이터 저장
          });

        const page = await browser.newPage();
        await page.setCacheEnabled(false); // 캐시 비활성화


        // 네이버 운세 페이지 이동
        await page.goto("https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=오늘의운세");

        // 성별 선택 : 1. 성별 버튼 클릭
        await page.waitForSelector(".btn_select"); // 버튼이 로드될 때까지 대기
        await page.click(".btn_select"); // 성별 선택 버튼 클릭
    
        // 성별 선택 : 2. 남성, 여성 중 사용자가 입력한 성별에 따라 네이버 오늘의 운세에서 성별 선택(XPath 이용)
        const genderXPath = gender === "남성" 
            ? '//*[@id="fortune_birthCondition"]/div[1]/div[1]/div[1]/div/div/ul/li[1]/a' // 남성 선택 XPath
            : '//*[@id="fortune_birthCondition"]/div[1]/div[1]/div[1]/div/div/ul/li[2]/a'; // 여성 선택 XPath
    
    
        await page.waitForXPath(genderXPath); // 옵션이 로드될 때까지 대기
        const [genderOption] = await page.$x(genderXPath);
        if (genderOption) {
            await genderOption.click(); // '남성' 또는 '여성' 클릭
        } else {
            throw new Error("성별 옵션을 찾을 수 없습니다.");
        }

        // 생년월일 선택 : 1. 생년월일 버튼 클릭
        
        await page.waitForSelector("[.select_pop. _trigger]"); // 버튼이 로드될 때까지 대기
        await page.click(".select_pop _trigger"); // 성별 선택 버튼 클릭
        // 생년 선택
        const [year, month, day] = birthdate.split("-"); // yyyy-mm--dd의 문자열로 저장되어있음
        const yearXPath =  "//a[contains(text(), year)]"
        
    
        await page.waitForXPath(yearXPath); // 옵션이 로드될 때까지 대기
        const [yearOption] = await page.$x(yearXPath);
        if (yearOption) {
            await yearOption.click(); // 사용자의 생년 값이 있는 버튼 클릭
        } else {
            throw new Error("생년 옵션을 찾을 수 없습니다.");
        }

        // 생월 선택
        const monthXPath =  `//*[@id="fortune_birthCondition"]/div[1]/div[2]/div/div[1]/div/div[2]/div/div/div/ul/li[${month}]` // 억음부포(백틱) ` 을 이용한 문자열+변수
        
        await page.waitForXPath(monthXPath); // 옵션이 로드될 때까지 대기
        const [monthOption] = await page.$x(monthXPath);
        if (monthOption) {
            await monthOption.click(); // 사용자의 생월 값이 있는 버튼 클릭
        } else {
            throw new Error("생월 옵션을 찾을 수 없습니다.");
        }
        
        // 생일 선택
        const dayXPath =  `//*[@id="fortune_birthCondition"]/div[1]/div[2]/div/div[1]/div/div[3]/div/div/div/ul/li[${day}]` // 억음부포(백틱) ` 을 이용한 문자열+변수(출처 : https://mhui123.tistory.com/39)
        
        await page.waitForXPath(dayXPath); // 옵션이 로드될 때까지 대기
        const [dayOption] = await page.$x(dayXPath);
        if (dayOption) {
            await dayOption.click(); // 사용자의 생일 값이 있는 버튼 클릭
        } else {
            throw new Error("생월 옵션을 찾을 수 없습니다.");
        }
        
        // 운세 보기 버튼 클릭
        const [see_fortune_btn] = await page.$x('//*[@id="fortune_birthCondition"]/div[1]/button');
        if (see_fortune_btn) {
            await see_fortune_btn.click(); // '운세 보기' 버튼 클릭
        } else {
            throw new Error("'운세 보기' 버튼을 클릭할 수 없습니다.");
        }

        // 결과 로딩 대기
        await page.waitForSelector("._resultPanel");

        // 운세 내용 가져오기
        // 운세 명 가져오기
        const nameFortune = await page.$eval("dl.infor._innerPanel dd strong b", (b) => b.innerText.trim());
        // 운세 내용 가져오기
        const detailFortune = await page.$eval("dl.infor._innerPanel dd strong p", (p) => p.innerText.trim());

        
        await browser.close();

        res.json({ nameFortune, detailFortune });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to fetch horoscope." });

    }
});

// 서버 시작
const PORT = process.env.PORT || 3000; // Koyeb에서 포트가 다를 수 있으므로 기본값 3000
app.listen(PORT, () => {
    console.log(`PORT from env: ${process.env.PORT}`); 
    console.log(`Server is running on port ${PORT}`);
});