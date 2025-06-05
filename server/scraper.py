import math
import httpx
import asyncio
from urllib.parse import urlencode
from parsel import Selector
import json
import locale
from random import randint


from typing import Dict, List, Literal
from urllib.parse import urlencode
from parsel import Selector

import re

def clean_price(value):
    if not value:
        return None
    try:
        # Extract digits and decimal (e.g., "C $336.61" -> "336.61")
        cleaned = re.sub(r"[^\d.]", "", value)
        return float(cleaned)
    except ValueError:
        return None  # or handle/log the error


def convert(string, abbr = 'en_US.UTF-8'):

    locale.setlocale(locale.LC_ALL, abbr)
    try:
        number = locale.atof(string)
    except ValueError:
        number = None

    return number

def extract_numeric(value):
    """Helper to extract float from price or shipping string."""
    if not value:
        return 0.0
    # Remove all non-numeric except dot and comma
    cleaned = re.sub(r"[^\d.,]", "", value)
    # Remove commas to parse float safely
    cleaned = cleaned.replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

SORTING_MAP = {
    "best_match": 12,
    "ending_soonest": 1,
    "newly_listed": 10,
}

session = httpx.AsyncClient(
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    },
    http2=True,
    follow_redirects=True
)


def parse_search(response: httpx.Response) -> List[Dict]:
    """parse ebay's search page for listing preview details"""
    previews = []
    # each listing has it's own HTML box where all of the data is contained
    sel = Selector(response.text)
    listing_boxes = sel.css(".srp-results li.s-item")
    for box in listing_boxes:
       
        # quick helpers to extract first element and all elements
        css = lambda css: box.css(css).get("").strip()
        css_all = lambda css: box.css(css).getall()

        price_selector = box.css(".s-item__price")
        price = price_selector.css(".ITALIC::text").get() or price_selector.css("::text").get("").strip()

        shipping_selector = box.css(".s-item__shipping")
        shipping = shipping_selector.css(".ITALIC::text").get() or price_selector.css("::text").get("").strip()

        previews.append(
            {
                "url": css("a.s-item__link::attr(href)").split("?")[0],
                "title": css(".s-item__title>span::text"),
                "price": price,
                "shipping": shipping,
                "list_date": css(".s-item__listingDate span::text"),
                "subtitles": css_all(".s-item__subtitle::text"),
                "condition": css(".s-item__subtitle .SECONDARY_INFO::text"),
                "photo": css(".s-item__image img::attr(src)"),
                "rating": css(".s-item__reviews .clipped::text"),
                "rating_count": css(".s-item__reviews-count span::text"),
            }
        )
    return previews
async def item_generator(session, query, max_pages=5, items_per_page=60, sort="newly_listed"):
    def make_request(page):
        return "https://www.ebay.ca/sch/i.html?" + urlencode({
            "_nkw": query,
            "_ipg": items_per_page,
            "_sop": SORTING_MAP[sort],
            "_pgn": page,
            "LH_ItemCondition": 3,
            "LH_BIN": 1,
        })

    for page in range(1, max_pages + 1):
        try:
            response = await session.get(make_request(page), timeout=20)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to fetch page {page}: {e}")
            continue

        # FIXED LINE:
        items = parse_search(response)  # <-- response is passed directly, not response.text
        for item in items:
            yield item

async def scrape_search(
    query,
    max_pages=1000,
    category=0,
    items_per_page=60,
    sort: Literal["best_match", "ending_soonest", "newly_listed"] = "newly_listed",
) -> List[Dict]:
    """Scrape Ebay's search results page for product preview data for given"""

    max_pages = 1
    def make_request(page):
        return "https://www.ebay.ca/sch/i.html?" + urlencode(
            {
                "_nkw": query,
                "_sacat": category,
                "_ipg": items_per_page,
                "_sop": SORTING_MAP[sort],
                "_pgn": page,
                "LH_ItemCondition":3,
                "LH_BIN":1,

            }
        )


    first_page = await session.get(make_request(page=1))
    results = parse_search(first_page)
    # find total amount of results for concurrent pagination
    if(max_pages != 1):
        html = first_page.text
        selector = Selector(text=html)
        total_results = selector.css(".srp-controls__count-heading>span::text").get()
        total_results = int(total_results.replace(",", ""))
        total_pages = math.ceil(total_results / items_per_page)
        if total_pages > max_pages:
            total_pages = max_pages
        other_pages = [session.get(make_request(page=i)) for i in range(2, total_pages + 1)]
        for response in asyncio.as_completed(other_pages):
            response = await response
            try:
                results.extend(parse_search(response))
            except Exception as e:
                print(f"failed to scrape search page {response.url}")

    for i in results:
        balls = {}
        balls["Total"] = str(convert(i["price"][3:]) + convert(i['shipping'].split(" ")[1][1:]))
        balls["Price"] = convert(i["price"][3:])
        balls["Shipping"] = convert(i['shipping'].split(" ")[1][1:])
        balls["Title"] = i["title"]
        balls["Photo"] = i["photo"]
        balls["Url"] = i['url']

        yield balls
        
async def randomItem(
         query,
    category=0,
    items_per_page=60,
    sort: Literal["best_match", "ending_soonest", "newly_listed"] = "newly_listed",
):
    
    
    
    def make_request(page):
        return "https://www.ebay.ca/sch/i.html?" + urlencode(
            {
                "_nkw": query,
                "_sacat": category,
                "_ipg": items_per_page,
                "_sop": SORTING_MAP[sort],
                "_pgn": page,
                "LH_ItemCondition":3,
                "LH_BIN":1,

            }
    )

    first_page = await session.get(make_request(page=1))

    html = first_page.text
    selector = Selector(text=html)
    total_results = selector.css(".srp-controls__count-heading>span::text").get()
    total_results = int(total_results.replace(",", ""))
    total_pages = math.ceil(total_results / items_per_page)
    page = await session.get(make_request(page=randint(1, total_pages+1)))
    
    
    results = parse_search(page)

    for i in results:
        balls = {}
        balls["Total"] = str(round(convert(i["price"][3:]) + convert(i['shipping'].split(" ")[1][1:]),2))
        balls["Price"] = convert(i["price"][3:])
        balls["Shipping"] = convert(i['shipping'].split(" ")[1][1:])
        balls["Title"] = i["title"]
        balls["Photo"] = i["photo"]
        balls["Url"] = i['url']

        yield balls

