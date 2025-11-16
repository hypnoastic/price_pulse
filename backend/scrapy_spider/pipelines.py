class AmazonPipeline:
    def process_item(self, item, spider):
        # Clean and validate item data
        if item.get('name'):
            item['name'] = item['name'].strip()
        
        if item.get('price'):
            try:
                item['price'] = float(item['price'])
            except (ValueError, TypeError):
                item['price'] = None
        
        return item