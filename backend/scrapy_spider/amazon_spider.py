import scrapy
import json
from urllib.parse import urljoin

class AmazonSpider(scrapy.Spider):
    name = 'amazon'
    
    def __init__(self, url=None, *args, **kwargs):
        super(AmazonSpider, self).__init__(*args, **kwargs)
        self.start_urls = [url] if url else []
        
    def start_requests(self):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        for url in self.start_urls:
            yield scrapy.Request(url=url, headers=headers, callback=self.parse)
    
    def parse(self, response):
        # Extract product name
        name = response.css('#productTitle::text').get()
        if name:
            name = name.strip()
        
        # Extract price
        price_selectors = [
            'span.a-price.a-text-price.a-size-medium.apexPriceToPay span.a-offscreen::text',
            'span.a-price-whole::text',
            '.a-price .a-offscreen::text',
            '.a-price-current .a-offscreen::text',
            '#priceblock_dealprice::text',
            '#priceblock_ourprice::text'
        ]
        
        price = None
        for selector in price_selectors:
            price_text = response.css(selector).get()
            if price_text:
                # Clean price text
                price_text = price_text.replace('₹', '').replace(',', '').replace('$', '').strip()
                try:
                    price = float(price_text)
                    break
                except ValueError:
                    continue
        
        # Extract image
        image_selectors = [
            '#imgTagWrapperId img::attr(src)',
            '#landingImage::attr(src)',
            '.a-dynamic-image::attr(src)'
        ]
        
        image = None
        for selector in image_selectors:
            image = response.css(selector).get()
            if image:
                break
        
        yield {
            'name': name,
            'price': price,
            'image': image,
            'url': response.url
        }