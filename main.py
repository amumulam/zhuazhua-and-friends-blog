"""
MkDocs Macros 插件 - 自动生成文章列表
"""
import os
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple, Optional

def define_env(env):
    """定义宏环境"""
    
    @env.macro
    def article_list(
        directory: str,
        base_path: str = "docs",
        sort_by: str = "date",
        reverse: bool = True,
        exclude: List[str] = None,
        show_date: bool = True,
        date_format: str = "%Y-%m-%d",
        empty_message: str = "暂无文章，敬请期待..."
    ) -> str:
        """
        生成文章列表
        
        参数：
            directory: 相对于 docs 目录的路径，如 "blog/zhuazhua"
            base_path: docs 目录的路径，默认 "docs"
            sort_by: 排序字段，"date" 或 "title"
            reverse: 是否倒序排列
            exclude: 要排除的文件列表，默认排除 index.md
            show_date: 是否显示日期
            date_format: 日期格式
            empty_message: 没有文章时显示的消息
        
        返回：
            Markdown 格式的文章列表
        """
        if exclude is None:
            exclude = ["index.md"]
        
        # 构建完整路径
        docs_path = Path(base_path) / directory
        
        if not docs_path.exists():
            return f"<!-- 目录不存在: {directory} -->"
        
        # 收集文章信息
        articles = []
        
        for md_file in docs_path.glob("*.md"):
            # 排除指定文件
            if md_file.name in exclude:
                continue
            
            article = parse_article(md_file, directory)
            if article:
                articles.append(article)
        
        # 没有文章时返回空消息
        if not articles:
            return empty_message
        
        # 排序 - 有日期的文章按日期排，无日期的按文件名排序
        def sort_key(article):
            date_val = article.get("date")
            if date_val is None:
                # 无日期的文章排在最后
                return (1, "")
            return (0, date_val)
        
        articles.sort(key=sort_key, reverse=reverse)
        
        # 生成 Markdown 列表
        lines = []
        for article in articles:
            if show_date and article.get("date"):
                date_str = article["date"].strftime(date_format)
                lines.append(f"- [{article['title']}]({article['link']}) — {date_str}")
            else:
                lines.append(f"- [{article['title']}]({article['link']})")
        
        return "\n".join(lines)
    
    @env.macro
    def recent_articles(
        directories: List[str] = None,
        base_path: str = "docs",
        limit: int = 10,
        show_author: bool = True,
        empty_message: str = "暂无文章"
    ) -> str:
        """
        生成最近文章列表（跨目录）
        
        参数：
            directories: 目录列表，如 ["blog/zhuazhua", "blog/baba"]
            base_path: docs 目录路径
            limit: 返回文章数量
            show_author: 是否显示作者
            empty_message: 没有文章时显示的消息
        
        返回：
            Markdown 格式的文章列表
        """
        if directories is None:
            directories = []
        
        all_articles = []
        
        for directory in directories:
            docs_path = Path(base_path) / directory
            if not docs_path.exists():
                continue
            
            for md_file in docs_path.glob("*.md"):
                if md_file.name == "index.md":
                    continue
                
                article = parse_article(md_file, directory)
                if article:
                    all_articles.append(article)
        
        # 按日期排序
        def sort_key(article):
            date_val = article.get("date")
            if date_val is None:
                return (1, datetime.min)
            return (0, date_val)
        
        all_articles.sort(key=sort_key, reverse=True)
        
        # 没有文章时返回空消息
        if not all_articles:
            return empty_message
        
        # 限制数量
        all_articles = all_articles[:limit]
        
        # 生成 Markdown 列表
        lines = []
        for article in all_articles:
            author_part = ""
            if show_author and article.get("author"):
                author_part = f" ({article['author']})"
            
            date_str = ""
            if article.get("date"):
                date_str = article["date"].strftime("%Y-%m-%d")
            else:
                date_str = "未知日期"
            
            lines.append(f"- [{article['title']}]({article['link']}){author_part} — {date_str}")
        
        return "\n".join(lines)


def parse_article(md_file: Path, directory: str) -> Optional[Dict]:
    """
    解析 Markdown 文件，提取 frontmatter 信息
    
    返回：
        包含 title, date, author, link 的字典，解析失败返回 None
    """
    try:
        content = md_file.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Failed to read {md_file}: {e}")
        return None
    
    # 解析 YAML frontmatter
    frontmatter = parse_frontmatter(content)
    
    # 尝试多种日期字段名
    date = None
    if frontmatter:
        for date_field in ["date", "publishedAt", "publish_date", "created"]:
            if frontmatter.get(date_field):
                date = parse_date(frontmatter.get(date_field))
                if date:
                    break
    
    # 如果没有 frontmatter 或标题，从内容中提取
    title = frontmatter.get("title") if frontmatter else None
    if not title:
        title = extract_title_from_content(content)
    if not title:
        title = md_file.stem.replace("-", " ").title()
    
    # 如果还是没有日期，尝试从内容中提取
    if not date:
        date = extract_date_from_content(content)
    
    # 如果还是没有日期，尝试从文件名提取
    if not date:
        date = extract_date_from_filename(md_file.name)
    
    # 作者
    author = frontmatter.get("author") if frontmatter else None
    if not author:
        author = extract_author_from_path(directory)
    
    # 构建链接（相对于当前页面）
    link = f"{md_file.stem}.md"
    
    return {
        "title": title,
        "date": date,
        "author": author,
        "link": link
    }


def parse_frontmatter(content: str) -> Optional[Dict]:
    """解析 YAML frontmatter"""
    if not content.startswith("---"):
        return None
    
    # 找到 frontmatter 结束位置
    end_match = re.search(r'\n---\s*\n', content[3:])
    if not end_match:
        return None
    
    frontmatter_text = content[3:end_match.start() + 3]
    
    # 简单解析 YAML
    result = {}
    for line in frontmatter_text.split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()
            
            # 移除引号
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]
            
            result[key] = value
    
    return result


def extract_title_from_content(content: str) -> Optional[str]:
    """从内容中提取标题（第一个 # 标题）"""
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if match:
        # 移除可能的副标题或其他标记
        title = match.group(1).strip()
        # 移除末尾的冒号等
        title = re.sub(r'[:：]\s*$', '', title)
        return title
    return None


def extract_date_from_content(content: str) -> Optional[datetime]:
    """从内容中提取日期"""
    # 尝试匹配 **发布时间：** 2026-03-02 这种格式
    match = re.search(r'\*\*发布时间[：:]\*\*\s*(\d{4}-\d{2}-\d{2})', content)
    if match:
        return parse_date(match.group(1))
    
    # 尝试匹配 "发布于 2026-03-02" 格式
    match = re.search(r'发布[于在]\s*(\d{4}-\d{2}-\d{2})', content)
    if match:
        return parse_date(match.group(1))
    
    return None


def parse_date(date_str) -> Optional[datetime]:
    """解析日期字符串"""
    if not date_str:
        return None
    
    if isinstance(date_str, datetime):
        return date_str
    
    # 尝试多种日期格式
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y/%m/%d",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(str(date_str), fmt)
        except ValueError:
            continue
    
    return None


def extract_date_from_filename(filename: str) -> Optional[datetime]:
    """从文件名中提取日期"""
    # 匹配 YYYY-MM-DD 格式
    match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    if match:
        try:
            return datetime.strptime(match.group(1), "%Y-%m-%d")
        except ValueError:
            pass
    return None


def extract_author_from_path(directory: str) -> str:
    """从路径中提取作者名"""
    parts = directory.split("/")
    if len(parts) >= 2:
        author_map = {
            "zhuazhua": "爪爪",
            "baba": "巴巴",
            "dandan": "蛋蛋"
        }
        return author_map.get(parts[-1], parts[-1])
    return ""