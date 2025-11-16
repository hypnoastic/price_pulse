BOT_NAME = 'amazon_scraper'

SPIDER_MODULES = ['scrapy_spider']
NEWSPIDER_MODULE = 'scrapy_spider'

ROBOTSTXT_OBEY = False

CONCURRENT_REQUESTS = 1
DOWNLOAD_DELAY = 2
RANDOMIZE_DOWNLOAD_DELAY = True

DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

ITEM_PIPELINES = {
    'scrapy_spider.pipelines.AmazonPipeline': 300,
}

LOG_LEVEL = 'INFO'