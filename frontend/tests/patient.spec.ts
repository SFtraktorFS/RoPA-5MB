import { test, expect } from '@playwright/test';

test('ทดสอบการระบบบันทึกการประมวลผลข้อมูล (ด้วย API Mocking)', async ({ page }) => {
  // 1. Mock Login API
  await page.route('http://localhost:3340/login', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'test_token_12345',
          token_type: 'bearer',
          id: 1,
          username: 'admin',
          role: 'Admin'
        }
      });
    }
  });

  // 2. Mock ROPA GET API
  await page.route('http://localhost:3340/ropa', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          status: 'success',
          data: [
            { 
              id: 1, 
              purpose: 'Data Processing', 
              data_subject: 'Robot Tester', 
              data_category: 'Personal Data',
              legal_basis: 'consent',
              retention_period: 3,
              status: 'active',
              created_at: '2026-03-31T00:00:00'
            },
            { 
              id: 2, 
              purpose: 'Compliance Check', 
              data_subject: 'John Doe', 
              data_category: 'Health Data',
              legal_basis: 'legal_obligation',
              retention_period: 5,
              status: 'pending',
              created_at: '2026-04-01T00:00:00'
            }
          ]
        }
      });
    }
  });

  // 3. ไปที่หน้า ROPA Management
  await page.goto('http://localhost:3000/ropa');

  // 4. รอให้ข้อมูล load แล้วตรวจสอบ
  // ตรวจสอบว่ามี text ที่เป็นข้อมูลจาก Mock API
  await expect(page.getByText('Robot Tester')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('John Doe')).toBeVisible();
  
  // 5. ค้นหาข้อมูลจากตารางโดยชื่อ "John"
  // ลองหา input field ด้วย placeholder
  const searchInputs = await page.locator('input').all();
  let found = false;
  
  for (const input of searchInputs) {
    const placeholder = await input.getAttribute('placeholder');
    if (placeholder && (placeholder.includes('ค้นหา') || placeholder.includes('Search'))) {
      await input.fill('John');
      found = true;
      break;
    }
  }

  // 6. ตรวจสอบผลลัพธ์ค้นหา
  if (found) {
    await page.waitForTimeout(500); // รอให้ filter ทำงาน
    await expect(page.getByText('John Doe')).toBeVisible();
  }
});
