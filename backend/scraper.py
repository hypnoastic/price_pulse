import subprocess
import json
import tempfile
import os
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from scrapy_spider.amazon_spider import AmazonSpider
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ScrapyRunner:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def run_spider(self, url):
        """Run spider in a separate process to avoid reactor issues"""
        try:
            # Create temporary file for output
            with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as f:
                output_file = f.name
            
            # Run scrapy as subprocess
            cmd = [
                'scrapy', 'crawl', 'amazon',
                '-a', f'url={url}',
                '-o', output_file,
                '-s', 'LOG_LEVEL=ERROR'
            ]
            
            result = subprocess.run(
                cmd,
                cwd=os.path.dirname(__file__),
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Read results
            if os.path.exists(output_file):
                with open(output_file, 'r') as f:
                    data = json.load(f)
                os.unlink(output_file)
                return data[0] if data else None
            
            return None
            
        except Exception as e:
            print(f"Scraping error: {e}")
            return None
    
    async def scrape_amazon(self, url):
        """Async wrapper for scraping"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.run_spider, url)

scraper = ScrapyRunner()