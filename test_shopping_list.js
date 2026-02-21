// Created: 2025-01-13 14:35:00
// 쇼핑 리스트 앱 자동 테스트 스크립트

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
    console.log('========================================');
    console.log('쇼핑 리스트 앱 자동 테스트 시작');
    console.log('========================================\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // localStorage 초기화를 위해 새 컨텍스트 사용
    const filePath = path.join(__dirname, 'shopping_list.html');
    const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;

    await page.goto(fileUrl);

    // localStorage 초기화
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    console.log('✓ 브라우저 열기 및 페이지 로드 완료\n');

    let testsPassed = 0;
    let testsFailed = 0;

    // ========================================
    // 테스트 1: 아이템 추가 기능
    // ========================================
    console.log('[ 테스트 1: 아이템 추가 기능 ]');

    try {
        // 첫 번째 아이템 추가
        await page.fill('#itemInput', '우유');
        await page.click('#addBtn');
        await page.waitForTimeout(300);

        // 두 번째 아이템 추가 (Enter 키 사용)
        await page.fill('#itemInput', '계란');
        await page.press('#itemInput', 'Enter');
        await page.waitForTimeout(300);

        // 세 번째 아이템 추가
        await page.fill('#itemInput', '빵');
        await page.click('#addBtn');
        await page.waitForTimeout(300);

        // 아이템이 추가되었는지 확인
        const items = await page.locator('.shopping-item').count();

        if (items === 3) {
            console.log('  ✓ 3개 아이템 추가 성공');
            testsPassed++;
        } else {
            console.log(`  ✗ 아이템 추가 실패 (예상: 3, 실제: ${items})`);
            testsFailed++;
        }

        // 아이템 텍스트 확인
        const itemTexts = await page.locator('.item-text').allTextContents();
        if (itemTexts.includes('우유') && itemTexts.includes('계란') && itemTexts.includes('빵')) {
            console.log('  ✓ 아이템 텍스트 정확히 표시됨');
            testsPassed++;
        } else {
            console.log('  ✗ 아이템 텍스트 불일치');
            testsFailed++;
        }

        // 입력 필드가 비워졌는지 확인
        const inputValue = await page.inputValue('#itemInput');
        if (inputValue === '') {
            console.log('  ✓ 추가 후 입력 필드 초기화됨');
            testsPassed++;
        } else {
            console.log('  ✗ 입력 필드가 초기화되지 않음');
            testsFailed++;
        }

    } catch (error) {
        console.log(`  ✗ 오류 발생: ${error.message}`);
        testsFailed++;
    }

    console.log('');

    // ========================================
    // 테스트 2: 아이템 체크 기능
    // ========================================
    console.log('[ 테스트 2: 아이템 체크 기능 ]');

    try {
        // 첫 번째 아이템 체크
        await page.locator('.shopping-item').first().locator('.checkbox').click();
        await page.waitForTimeout(300);

        // 체크된 아이템 확인
        const checkedItems = await page.locator('.shopping-item.checked').count();
        if (checkedItems === 1) {
            console.log('  ✓ 아이템 체크 성공');
            testsPassed++;
        } else {
            console.log(`  ✗ 체크 실패 (예상: 1, 실제: ${checkedItems})`);
            testsFailed++;
        }

        // 체크된 아이템에 취소선 스타일 확인
        const hasLineThrough = await page.locator('.shopping-item.checked .item-text').first().evaluate(
            el => window.getComputedStyle(el).textDecoration.includes('line-through')
        );
        if (hasLineThrough) {
            console.log('  ✓ 체크된 아이템에 취소선 표시됨');
            testsPassed++;
        } else {
            console.log('  ✗ 취소선이 표시되지 않음');
            testsFailed++;
        }

        // 카운터 확인
        const countText = await page.locator('#itemCount').textContent();
        if (countText.includes('1/3')) {
            console.log('  ✓ 완료 카운터 정확히 표시됨 (1/3개 완료)');
            testsPassed++;
        } else {
            console.log(`  ✗ 카운터 불일치: ${countText}`);
            testsFailed++;
        }

        // 체크 해제 테스트
        await page.locator('.shopping-item.checked').first().locator('.checkbox').click();
        await page.waitForTimeout(300);

        const uncheckedCount = await page.locator('.shopping-item.checked').count();
        if (uncheckedCount === 0) {
            console.log('  ✓ 아이템 체크 해제 성공');
            testsPassed++;
        } else {
            console.log('  ✗ 체크 해제 실패');
            testsFailed++;
        }

        // 다시 체크 (삭제 테스트를 위해)
        await page.locator('.shopping-item').first().locator('.checkbox').click();
        await page.waitForTimeout(300);

    } catch (error) {
        console.log(`  ✗ 오류 발생: ${error.message}`);
        testsFailed++;
    }

    console.log('');

    // ========================================
    // 테스트 3: 아이템 삭제 기능
    // ========================================
    console.log('[ 테스트 3: 아이템 삭제 기능 ]');

    try {
        // 두 번째 아이템 삭제 (계란)
        await page.locator('.shopping-item').nth(1).hover();
        await page.waitForTimeout(200);
        await page.locator('.shopping-item').nth(1).locator('.delete-btn').click();
        await page.waitForTimeout(300);

        const remainingItems = await page.locator('.shopping-item').count();
        if (remainingItems === 2) {
            console.log('  ✓ 아이템 삭제 성공 (3 → 2개)');
            testsPassed++;
        } else {
            console.log(`  ✗ 삭제 실패 (예상: 2, 실제: ${remainingItems})`);
            testsFailed++;
        }

        // 삭제된 아이템이 목록에서 제거되었는지 확인
        const currentTexts = await page.locator('.item-text').allTextContents();
        if (!currentTexts.includes('계란')) {
            console.log('  ✓ 삭제된 아이템이 목록에서 제거됨');
            testsPassed++;
        } else {
            console.log('  ✗ 삭제된 아이템이 여전히 존재함');
            testsFailed++;
        }

    } catch (error) {
        console.log(`  ✗ 오류 발생: ${error.message}`);
        testsFailed++;
    }

    console.log('');

    // ========================================
    // 테스트 4: 완료 항목 일괄 삭제
    // ========================================
    console.log('[ 테스트 4: 완료 항목 일괄 삭제 ]');

    try {
        // 현재 체크된 항목 수 확인
        const checkedBefore = await page.locator('.shopping-item.checked').count();
        console.log(`  - 현재 체크된 항목: ${checkedBefore}개`);

        // "완료 항목 삭제" 버튼 클릭
        await page.click('#clearCompleted');
        await page.waitForTimeout(300);

        const afterClear = await page.locator('.shopping-item').count();
        const checkedAfter = await page.locator('.shopping-item.checked').count();

        if (checkedAfter === 0 && afterClear === 1) {
            console.log('  ✓ 완료 항목 일괄 삭제 성공');
            testsPassed++;
        } else {
            console.log(`  ✗ 일괄 삭제 실패 (남은 항목: ${afterClear}, 체크된 항목: ${checkedAfter})`);
            testsFailed++;
        }

    } catch (error) {
        console.log(`  ✗ 오류 발생: ${error.message}`);
        testsFailed++;
    }

    console.log('');

    // ========================================
    // 테스트 5: localStorage 저장 확인
    // ========================================
    console.log('[ 테스트 5: localStorage 데이터 저장 ]');

    try {
        // 새 아이템 추가
        await page.fill('#itemInput', '사과');
        await page.click('#addBtn');
        await page.waitForTimeout(300);

        // localStorage 데이터 확인
        const storageData = await page.evaluate(() => localStorage.getItem('shoppingList'));
        const parsedData = JSON.parse(storageData);

        if (parsedData && parsedData.length === 2) {
            console.log('  ✓ localStorage에 데이터 저장됨');
            testsPassed++;
        } else {
            console.log('  ✗ localStorage 저장 실패');
            testsFailed++;
        }

        // 페이지 새로고침 후 데이터 유지 확인
        await page.reload();
        await page.waitForTimeout(500);

        const itemsAfterReload = await page.locator('.shopping-item').count();
        if (itemsAfterReload === 2) {
            console.log('  ✓ 새로고침 후 데이터 유지됨');
            testsPassed++;
        } else {
            console.log(`  ✗ 데이터 유지 실패 (예상: 2, 실제: ${itemsAfterReload})`);
            testsFailed++;
        }

    } catch (error) {
        console.log(`  ✗ 오류 발생: ${error.message}`);
        testsFailed++;
    }

    console.log('');

    // ========================================
    // 테스트 결과 요약
    // ========================================
    console.log('========================================');
    console.log('테스트 결과 요약');
    console.log('========================================');
    console.log(`통과: ${testsPassed}개`);
    console.log(`실패: ${testsFailed}개`);
    console.log(`총계: ${testsPassed + testsFailed}개`);
    console.log('');

    if (testsFailed === 0) {
        console.log('✅ 모든 테스트 통과!');
    } else {
        console.log('❌ 일부 테스트 실패');
    }
    console.log('========================================');

    // 3초 후 브라우저 닫기
    console.log('\n3초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(3000);
    await browser.close();

    process.exit(testsFailed === 0 ? 0 : 1);
}

runTests().catch(error => {
    console.error('테스트 실행 중 오류:', error);
    process.exit(1);
});
