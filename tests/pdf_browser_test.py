from pathlib import Path
import sys,json
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'artifacts/python'))
from playwright.sync_api import sync_playwright
BASE='http://localhost:5181'
def overflow(page):assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel='msedge',headless=True)
    context=browser.new_context(viewport={'width':1512,'height':1100},locale='zh-TW')
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/#pdf');page.locator('.pdf-chapter').first.wait_for()
    assert page.locator('.pdf-chapter').count()==66;overflow(page)
    page.screenshot(path=str(ROOT/'artifacts/pdf-library-desktop.png'),full_page=True)
    page.locator('.pdf-domain-tabs a[href="#pdf?domain=services"]').click()
    assert page.locator('.pdf-chapter').count()==11
    page.goto(BASE+'/#pdf?chapter=ch01&page=3');page.locator('.pdf-block').first.wait_for()
    assert page.locator('.pdf-en').count()>0
    assert '網路' in page.locator('.pdf-zh').all_text_contents()[1]
    page.locator('[data-action=pdf-read]').click();page.locator('[data-action=pdf-bookmark]').click();page.reload();page.locator('.pdf-block').first.wait_for()
    assert page.locator('[data-action=pdf-read]').get_attribute('aria-pressed')=='true'
    assert page.locator('[data-action=pdf-bookmark]').get_attribute('aria-pressed')=='true'
    page.screenshot(path=str(ROOT/'artifacts/pdf-reader-desktop.png'),full_page=True)
    page.locator('.pdf-modes a').filter(has_text='繁體中文').click();page.wait_for_function('document.querySelectorAll(".pdf-en").length === 0')
    page.locator('.pdf-modes a').filter(has_text='原頁圖片').click();page.locator('.pdf-original').wait_for()
    page.wait_for_function('document.querySelector(".pdf-original")?.naturalWidth > 0')
    page.locator('[data-pdf-jump] input[name=page]').first.fill('74');page.locator('[data-pdf-jump] button').first.click()
    page.get_by_text('編者補充 · 192.168.1.192/27 的廣播位址').wait_for();assert 'page=74' in page.url
    page.goto(BASE+'/#pdf?q=192.168.1.192');page.locator('.pdf-search-results .search-result').first.wait_for()
    assert page.locator('.pdf-search-results').inner_text().find('第 74 頁')>=0
    page.goto(BASE+'/#topic/vlan');assert page.locator('.lesson-aside a[href^="#pdf?"]').count()>0
    page.goto(BASE+'/#search?q=OSPF');assert page.locator('a[href^="#pdf?"]').count()>0
    page.goto(BASE+'/#pdf?chapter=missing');page.get_by_role('heading',name='找不到這個章節').wait_for()
    page.goto(BASE+'/#pdf?chapter=ch01&page=999');page.locator('.pdf-block').first.wait_for();assert page.locator('[data-pdf-jump] input[name=page]').first.input_value()=='3'
    # Fetch failure exposes a retry button; retry recovers without reloading the app.
    page.route('**/data/pdf/chapters/ch02.json',lambda route:route.abort())
    page.goto(BASE+'/#pdf?chapter=ch02');page.locator('[data-action=pdf-retry]').wait_for()
    page.unroute('**/data/pdf/chapters/ch02.json');page.locator('[data-action=pdf-retry]').click();page.locator('.pdf-block').first.wait_for()
    for width in (390,768):
        page.set_viewport_size({'width':width,'height':844})
        for route in ('pdf','pdf?chapter=ch01&page=3','pdf?chapter=ch16&page=74','pdf?chapter=ch66&page=454&mode=original','pdf?q=OSPF'):
            page.goto(BASE+'/#'+route);page.locator('main h1').wait_for();page.wait_for_timeout(350);overflow(page)
        if width==390:
            page.goto(BASE+'/#pdf?chapter=ch01&page=3');page.locator('.pdf-block').first.wait_for();page.screenshot(path=str(ROOT/'artifacts/pdf-reader-mobile.png'),full_page=True)
    image=context.request.get(BASE+'/data/pdf/pages/0003.jpg');assert image.status==200 and image.headers['content-type']=='image/jpeg'
    pdf=context.request.head(BASE+'/data/pdf/source.pdf');assert pdf.status==200 and pdf.headers['content-type']=='application/pdf'
    assert not errors,errors
    print(json.dumps({'result':'passed','chapters':66,'tested':['filters','bilingual','original images','read/bookmark persistence','page jump','full-text search','topic links','invalid routes','load retry','390/768/1512 layouts','asset MIME']},ensure_ascii=False))
    browser.close()
