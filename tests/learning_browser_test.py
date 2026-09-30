from pathlib import Path
import sys,json
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'artifacts/python'))
from playwright.sync_api import sync_playwright
BASE='http://localhost:5181'
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel='msedge',headless=True)
    context=browser.new_context(viewport={'width':1512,'height':1000},locale='zh-TW')
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE)
    ids=page.evaluate("async ()=>(await import('/data/catalog.js')).topics.map(t=>t.id)")
    for topic in ([] if '--mobile-only' in sys.argv else ids):
        page.goto(BASE+'/#topic/'+topic)
        page.locator(f'[data-lesson="{topic}"]').wait_for()
        assert page.locator('.lesson-flow li').count()==4,topic
        assert page.locator('.lesson-worked').count()==1,topic
        assert page.locator('.lesson-sources').count()==1,topic
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),topic
        page.goto(BASE+'/#tutor?topic='+topic)
        page.locator(f'[data-lesson="{topic}"]').wait_for()
        page.locator('[data-step="1"]').click()
        page.locator('.lesson-flow li').first.wait_for()
        assert page.locator('.lesson-flow li').count()==4,topic
    page.goto(BASE+'/#tutor?topic=dhcp')
    page.locator('[data-step="1"]').click();page.locator('.lesson-flow li').first.wait_for()
    assert page.locator('.lesson-flow strong').all_text_contents()==['Discover','Offer','Request','ACK']
    page.locator('[data-action="packet"]').click()
    page.wait_for_function('document.querySelector(".lesson-flow li:nth-child(2)").classList.contains("active")')
    page.locator('[data-step="2"]').click();page.locator('.lesson-worked').wait_for()
    page.locator('[data-step="3"]').click();page.locator('.lesson-cli').wait_for()
    assert 'ip dhcp pool STAFF' in page.locator('.lesson-cli').inner_text()
    page.locator('[data-step="5"]').click();page.locator('.lesson-recall details summary').click()
    assert page.locator('.lesson-recall details').get_attribute('open') is not None
    page.locator('[data-step="6"]').click();page.locator('input[name="answer"]').first.wait_for()
    page.locator('input[name="answer"]').first.check();page.locator('[data-action="answer"]').click()
    page.locator('.feedback').wait_for();page.locator('[data-action="next-question"]').click()
    page.wait_for_function('!document.querySelector(".feedback")')
    assert page.locator('input[name="answer"]:checked').count()==0
    page.goto(BASE+'/#topic/ipv6');page.locator('.lesson-correction').first.wait_for()
    assert '16 bytes' in page.locator('.lesson-depth').inner_text()
    page.locator('.lesson-sources summary').click()
    assert page.locator('.lesson-sources a[href^="#pdf?"]').count()>0
    page.screenshot(path=str(ROOT/'artifacts/lesson-ipv6-desktop.png'),full_page=True)
    page.goto(BASE+'/#topic/terraform');page.locator('.lesson-sources summary').click()
    assert page.locator('.lesson-sources a[href^="#pdf?"]').count()==0
    assert '官方範圍補充' in page.locator('.lesson-sources').inner_text()
    for width in (390,768):
        page.set_viewport_size({'width':width,'height':844})
        for topic in ('ipv4','ipv6','inter-vlan','ospf-neighbor','dhcp','acl','json','terraform'):
            page.goto(BASE+'/#topic/'+topic);page.locator(f'[data-lesson="{topic}"]').wait_for()
            overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth+1')
            if overflow:
                print(json.dumps(page.evaluate('Array.from(document.querySelectorAll("main *")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,text:e.textContent.slice(0,65)})).slice(0,20)'),ensure_ascii=True),flush=True)
            assert not overflow,(width,topic)
            page.goto(BASE+'/#tutor?topic='+topic)
            for step in range(7):
                page.locator(f'[data-step="{step}"]').click()
                page.wait_for_function('(n)=>document.querySelector(".tutor-steps .active").dataset.step === String(n)',arg=step)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(width,topic,step)
        if width==390:
            page.goto(BASE+'/#tutor?topic=dhcp');page.locator('[data-step="1"]').click()
            page.locator('.lesson-flow').wait_for();page.screenshot(path=str(ROOT/'artifacts/tutor-dhcp-mobile.png'),full_page=True)
    assert not errors,errors
    print(json.dumps({'passed':True,'topics':len(ids),'checks':['shared lessons','distinct diagrams','source links','errata','tutor stages','next quiz question','desktop/tablet/mobile']},ensure_ascii=False))
    browser.close()
