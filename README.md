# 历史上的今天 API 服务

这是一个提供历史上的今天数据查询的RESTful API服务。

## 安装要求

- Node.js (v14.0.0 或更高版本)
- npm (Node.js包管理器)

## 安装步骤

1. 安装 Node.js 和 npm
   - 访问 [Node.js官网](https://nodejs.org/) 下载并安装Node.js
   - npm会随Node.js一起安装

2. 安装项目依赖
   ```bash
   npm install
   ```

3. 启动服务器
   ```bash
   npm start
   ```
   或者使用开发模式（自动重启）：
   ```bash
   npm run dev
   ```

## API 端点

1. 获取指定日期的历史事件
   ```
   GET /api/events/:month/:day
   ```
   示例：`http://localhost:3000/api/events/01/01`

2. 获取今天的历史事件
   ```
   GET /api/events/today
   ```
   示例：`http://localhost:3000/api/events/today`

3. 随机获取一个历史事件
   ```
   GET /api/events/random
   ```
   示例：`http://localhost:3000/api/events/random`

4. 搜索特定年份的历史事件
   ```
   GET /api/events/search/:year
   ```
   示例：`http://localhost:3000/api/events/search/1949`

## 响应格式

所有API响应都使用JSON格式，包含以下字段：
- `success`: 布尔值，表示请求是否成功
- `date`: 日期（MM-DD格式）
- `events`: 历史事件数组，每个事件包含：
  - `year`: 事件发生的年份
  - `event`: 事件描述

示例响应：
```json
{
    "success": true,
    "date": "01-01",
    "events": [
        {
            "year": 1912,
            "event": "中华民国成立"
        }
    ]
}
```

## 错误处理

当发生错误时，API会返回相应的HTTP状态码和错误信息：
- 404: 未找到请求的资源
- 500: 服务器内部错误

错误响应示例：
```json
{
    "success": false,
    "message": "未找到该日期的历史事件"
}
``` 