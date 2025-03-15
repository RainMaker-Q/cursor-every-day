import requests
import json
import time
from datetime import datetime

def get_events_for_date(month, day):
    """获取指定日期的历史事件"""
    url = f'https://api.oick.cn/lishi/api.php'
    params = {
        'month': f'{month:02d}',
        'day': f'{day:02d}'
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, dict) and 'result' in data:
                events = []
                for event in data['result']:
                    if isinstance(event, dict) and 'date' in event and 'title' in event:
                        # 提取年份并格式化事件
                        try:
                            date = datetime.strptime(event['date'], '%Y年%m月%d日')
                            year = date.year
                            events.append({
                                'year': year,
                                'event': event['title']
                            })
                        except ValueError:
                            # 如果日期格式不正确，跳过这个事件
                            continue
                
                if events:
                    # 按年份排序
                    events.sort(key=lambda x: x['year'])
                    print(f"获取到 {len(events)} 条历史事件")
                    return events
            
            print(f"{month}月{day}日 未找到任何历史事件")
            return []
            
        else:
            print(f"请求失败，状态码：{response.status_code}")
            return []
            
    except Exception as e:
        print(f"获取 {month}月{day}日 的数据时出错: {str(e)}")
        return []

def get_days_in_month(month):
    """获取指定月份的天数"""
    if month in [4, 6, 9, 11]:
        return 30
    elif month == 2:
        return 29  # 包含闰年
    else:
        return 31

def main():
    all_events = {}
    
    # 遍历所有日期
    for month in range(1, 13):
        days = get_days_in_month(month)
        for day in range(1, days + 1):
            date_key = f"{month:02d}-{day:02d}"
            print(f"\n正在获取 {date_key} 的历史事件...")
            
            events = get_events_for_date(month, day)
            all_events[date_key] = events
            
            # 添加延迟以避免请求过快
            time.sleep(1)
    
    # 将结果保存为JSON文件
    with open('historical_events.json', 'w', encoding='utf-8') as f:
        json.dump(all_events, f, ensure_ascii=False, indent=4)
    
    print("\n爬取完成！数据已保存到 historical_events.json")
    
    # 显示统计信息
    total_events = sum(len(events) for events in all_events.values())
    print(f"总共获取到 {total_events} 条历史事件")
    print(f"覆盖 {len(all_events)} 个日期")

if __name__ == "__main__":
    main() 