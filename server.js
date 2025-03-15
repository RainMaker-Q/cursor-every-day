const express = require('express');
const cors = require('cors');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 加载历史事件数据
let historicalEvents = null;

async function loadHistoricalEvents() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'historical_events.json'), 'utf8');
        historicalEvents = JSON.parse(data);
        console.log('历史事件数据加载成功');
    } catch (error) {
        console.error('加载历史事件数据失败:', error);
        process.exit(1);
    }
}

// API路由

// 1. 获取今天的历史事件
app.get('/api/events/today', (req, res) => {
    const today = moment();
    const dateKey = today.format('MM-DD');

    if (!historicalEvents || !historicalEvents[dateKey]) {
        return res.status(404).json({
            success: false,
            message: '未找到今天的历史事件'
        });
    }

    res.json({
        success: true,
        date: dateKey,
        events: historicalEvents[dateKey]
    });
});

// 2. 随机获取一个历史事件
app.get('/api/events/random', (req, res) => {
    if (!historicalEvents) {
        return res.status(500).json({
            success: false,
            message: '服务器数据未加载'
        });
    }

    const dates = Object.keys(historicalEvents);
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const events = historicalEvents[randomDate];

    if (!events || events.length === 0) {
        return res.status(404).json({
            success: false,
            message: '未找到历史事件'
        });
    }

    const randomEvent = events[Math.floor(Math.random() * events.length)];

    res.json({
        success: true,
        date: randomDate,
        event: randomEvent
    });
});

// 3. 搜索特定年份的历史事件
app.get('/api/events/search/:year', (req, res) => {
    try {
        const { year } = req.params;
        const yearNum = parseInt(year);

        if (isNaN(yearNum)) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的年份'
            });
        }

        if (!historicalEvents) {
            return res.status(500).json({
                success: false,
                message: '服务器数据未加载'
            });
        }

        // 使用Set来存储唯一的事件
        const uniqueEvents = new Set();
        const matchingEvents = [];

        for (const [date, events] of Object.entries(historicalEvents)) {
            const dateEvents = events.filter(event => {
                if (event.year === yearNum) {
                    // 创建事件的唯一标识
                    const eventKey = `${event.year}-${event.event}`;
                    if (!uniqueEvents.has(eventKey)) {
                        uniqueEvents.add(eventKey);
                        return true;
                    }
                }
                return false;
            });

            if (dateEvents.length > 0) {
                matchingEvents.push({
                    date,
                    events: dateEvents
                });
            }
        }

        if (matchingEvents.length === 0) {
            return res.status(404).json({
                success: false,
                message: `未找到${year}年的历史事件`
            });
        }

        // 按日期排序
        matchingEvents.sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            success: true,
            year: yearNum,
            total: matchingEvents.reduce((sum, item) => sum + item.events.length, 0),
            results: matchingEvents
        });
    } catch (error) {
        console.error('搜索年份时出错:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 4. 获取指定日期的历史事件
app.get('/api/events/:month/:day', (req, res) => {
    const { month, day } = req.params;
    const dateKey = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if (!historicalEvents || !historicalEvents[dateKey]) {
        return res.status(404).json({
            success: false,
            message: '未找到该日期的历史事件'
        });
    }

    res.json({
        success: true,
        date: dateKey,
        events: historicalEvents[dateKey]
    });
});

// 启动服务器
async function startServer() {
    await loadHistoricalEvents();

    app.listen(port, () => {
        console.log(`服务器运行在 http://localhost:${port}`);
        console.log('可用的API端点：');
        console.log('1. GET /api/events/:month/:day - 获取指定日期的历史事件');
        console.log('2. GET /api/events/today - 获取今天的历史事件');
        console.log('3. GET /api/events/random - 随机获取一个历史事件');
        console.log('4. GET /api/events/search/:year - 搜索特定年份的历史事件');
    });
}

startServer(); 