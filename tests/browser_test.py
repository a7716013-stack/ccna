from pathlib import Path
import json
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'artifacts' / 'python'))
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:5181'
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)

def check_overflow(page, label):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'Horizontal overflow: {label}'

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 1512, 'height': 1100}, locale='zh-TW')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    response = page.goto(BASE, wait_until='networkidle')
    assert response.status == 200
    page.get_by_role('heading', name='讓每一次連線，都有跡可循。').wait_for()
    check_overflow(page, 'dashboard desktop')
    page.screenshot(path=str(OUT / 'dashboard-desktop.png'), full_page=True)

    # All routes render with no JavaScript errors, using an isolated fresh browser profile.
    routes = ['map','learn','topic/vlan','tutor?topic=vlan','practice','wrong','subnet','routing','acl','cli','glossary','exam','progress','analysis','search?q=OSPF']
    for route in routes:
        page.goto(BASE + '/#' + route)
        page.locator('main h1').wait_for()
        check_overflow(page, route)
    assert not errors, errors

    # Wrong answer -> persisted book -> correct retry, complete lesson and reload.
    page.goto(BASE + '/#practice?question=scenario-9')
    q = page.evaluate("async () => (await import('/data/questions.js')).questions.find(q => q.id === 'scenario-9')")
    wrong = next(o['id'] for o in q['options'] if o['id'] not in q['correctAnswer'])
    page.locator(f'input[name="answer"][value="{wrong}"]').check()
    page.locator('[data-action="answer"]').click()
    page.locator('.feedback.failure').wait_for()
    state = page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1'))")
    assert len(state['history']) == 1
    assert state['wrong'][q['id']]['count'] == 1
    page.reload()
    page.goto(BASE + '/#wrong')
    page.locator('[data-action="review-one"]').click()
    for answer in q['correctAnswer']:
        page.locator(f'input[name="answer"][value="{answer}"]').check()
    page.locator('[data-action="answer"]').click()
    page.locator('.feedback.success').wait_for()
    state = page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1'))")
    assert state['wrong'][q['id']]['resolved']
    assert state['wrong'][q['id']]['count'] == 1

    page.goto(BASE + '/#tutor?topic=vlan')
    for step in range(1, 7):
        page.locator('[data-action="tutor-next"]').click()
    page.locator('input[name="answer"]').first.check()
    page.locator('[data-action="answer"]').click()
    page.locator('[data-action="complete"]').click()
    page.reload()
    assert 'vlan' in page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1')).completed")

    # Random subnet challenge solved independently with Python ipaddress.
    import ipaddress
    page.goto(BASE + '/#subnet')
    cidr = page.locator('.ip-display').inner_text()
    net = ipaddress.ip_network(cidr, strict=False)
    answers = {'network':str(net.network_address), 'broadcast':str(net.broadcast_address), 'mask':str(net.netmask), 'first':str(net.network_address+1), 'last':str(net.broadcast_address-1), 'hosts':str(net.num_addresses-2), 'wildcard':str(net.hostmask)}
    for key, value in answers.items():
        page.locator(f'#subnet-answer [name="{key}"]').fill(value)
    page.locator('#subnet-answer button').click()
    page.locator('.feedback.success').wait_for()
    page.screenshot(path=str(OUT / 'subnet-result.png'), full_page=True)
    page.locator('#subnet-level').select_option('中級')
    cidr = page.locator('.ip-display').inner_text()
    net = ipaddress.ip_network(cidr, strict=False)
    assert 16 <= net.prefixlen <= 23
    page.locator('#subnet-level').select_option('進階')
    cidr = page.locator('.ip-display').inner_text()
    requirements = page.locator('.requirements strong').all_inner_texts()
    requirements = [int(x.split()[0]) for x in requirements]
    cursor = int(ipaddress.ip_network(cidr).network_address)
    import math
    for index, count in sorted(enumerate(requirements), key=lambda x:-x[1]):
        bits = math.ceil(math.log2(count+2))
        page.locator(f'[name="network{index}"]').fill(str(ipaddress.IPv4Address(cursor)))
        page.locator(f'[name="prefix{index}"]').fill(str(32-bits))
        cursor += 2**bits
    page.locator('#subnet-answer button').click()
    page.locator('.feedback.success').wait_for()

    # Generated routing and ACL questions accept choices and produce full explanations.
    for route in ['routing','acl']:
        page.goto(BASE + '/#' + route)
        page.locator('input[name="answer"]').first.check()
        page.locator('[data-action="answer"]').click()
        page.locator('.feedback').wait_for()
        page.locator('[data-action="new-generated"]').click()
        assert page.locator('.feedback').count() == 0

    # Actual UI search and filters.
    page.locator('#global-search input').fill('show vlan brief')
    page.locator('#global-search input').press('Enter')
    page.get_by_role('heading', name='全站搜尋', exact=True).wait_for()
    assert page.locator('.search-result').count() >= 1
    page.goto(BASE + '/#cli?q=show%20vlan%20brief')
    assert page.locator('.command-card').count() == 1
    context.grant_permissions(['clipboard-read', 'clipboard-write'])
    page.locator('[data-copy="vlan"]').click()
    page.wait_for_function("async () => (await navigator.clipboard.readText()) === 'show vlan brief'")
    page.goto(BASE + '/#glossary?q=Administrative%20Distance')
    assert page.locator('.glossary-grid > .card').count() == 1
    page.goto(BASE + '/#practice')
    page.locator('#practice-filter [name="domain"]').select_option('security')
    page.locator('#practice-filter [name="topic"]').select_option('extended-acl')
    page.locator('#practice-filter button').click()
    assert 'extended-acl' in page.url

    # Exam: answers hidden, autosave across reload, mixed correctness and unanswered.
    page.goto(BASE + '/#exam')
    page.locator('[data-count="25"]').click()
    for index in range(3):
        exam = page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1')).activeExam")
        current = exam['questions'][index]
        selected = current['correctAnswer'] if index < 2 else [next(o['id'] for o in current['options'] if o['id'] not in current['correctAnswer'])]
        for answer in selected:
            page.locator(f'input[name="answer"][value="{answer}"]').check()
        assert page.locator('.feedback').count() == 0
        page.locator('[data-action="exam-next"]').click()
    page.reload()
    assert page.locator('[data-exam-index="3"]').get_attribute('class') == ' current'
    page.locator('[data-action="exam-confirm"]').click()
    page.locator('[data-action="exam-finish"]').click()
    page.locator('.score-card').wait_for()
    state = page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1'))")
    result = state['exams'][-1]
    assert result['total'] == 25 and result['correct'] == 2 and result['score'] == 8
    history_count = len(state['history'])
    page.reload()
    assert len(page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1')).history")) == history_count
    assert page.locator('.exam-review details').count() == 25
    page.locator('.exam-review details summary').first.click()
    page.locator('.exam-review .feedback').first.wait_for()
    page.screenshot(path=str(OUT / 'exam-result.png'), full_page=True)

    # Timer expiration auto-submits an active exam, including after reload.
    page.goto(BASE + '/#exam')
    page.locator('[data-count="100"]').click()
    exam = page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1')).activeExam")
    assert len(exam['questions']) == len(set(q['id'] for q in exam['questions'])) == 100
    page.evaluate("() => {const d=JSON.parse(localStorage.getItem('ccna.lab.v1')); d.activeExam.deadline=Date.now()-1;localStorage.setItem('ccna.lab.v1',JSON.stringify(d));}")
    page.reload()
    page.locator('.score-card').wait_for(timeout=5000)
    assert page.evaluate("JSON.parse(localStorage.getItem('ccna.lab.v1')).activeExam") is None
    # Export action produces a valid backup file.
    page.goto(BASE + '/#progress')
    with page.expect_download() as download_info:
        page.locator('[data-action="export"]').click()
    downloaded = download_info.value.path()
    exported = json.loads(Path(downloaded).read_text(encoding='utf-8'))
    assert exported['version'] == 1 and len(exported['exams']) == 2

    # Mobile routes, no page-wide horizontal scrolling, functional navigation.
    mobile = browser.new_context(viewport={'width':390,'height':844}, is_mobile=True, device_scale_factor=1, locale='zh-TW')
    mp = mobile.new_page()
    mp.on('pageerror', lambda error: errors.append(str(error)))
    for route in ['dashboard','map','learn','topic/vlan','tutor?topic=vlan','practice','subnet','routing','acl','cli','glossary','exam','progress','analysis']:
        mp.goto(BASE + '/#' + route)
        mp.locator('main h1').wait_for()
        check_overflow(mp, 'mobile ' + route)
    mp.goto(BASE + '/#dashboard')
    mp.screenshot(path=str(OUT / 'dashboard-mobile.png'), full_page=True)
    mp.locator('[data-action="menu"]').click()
    mp.locator('.sidebar a[href="#subnet"]').click()
    mp.locator('.ip-display').wait_for()
    assert not mp.locator('body').evaluate("el => el.classList.contains('menu-open')")
    assert not errors, errors
    # Newly imported exercises are playable through the same practice UI.
    page.goto(BASE + '/#practice?question=pdf-syslog-threshold')
    page.locator('input[name="answer"]').first.wait_for()
    added = page.evaluate("async () => (await import('/data/questions.js')).questions.filter(q => q.id.startsWith('pdf-'))")
    assert len(added) == 36
    q = next(q for q in added if q['id'] == 'pdf-syslog-threshold')
    for answer in q['correctAnswer']:
        page.locator(f'input[name="answer"][value="{answer}"]').check()
    page.locator('[data-action="answer"]').click()
    page.locator('.feedback.success').wait_for()
    assert 'PDF' in page.locator('.feedback').inner_text()
    assert not errors, errors
    browser.close()
    print('Browser checks passed: all routes, persistence, tutor, wrong-answer retry, IPv4/VLSM, routing, ACL, search, filters, exams, timer, export, desktop/mobile.')
