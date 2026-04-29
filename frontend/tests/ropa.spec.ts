import { test, expect } from "@playwright/test";

// =====================================================================
// Mock Data
// =====================================================================
const MOCK_TOKEN = "mock_access_token_admin_12345";

const MOCK_USER_ADMIN = {
  id: 1,
  username: "admin",
  role: "Admin",
};

const MOCK_ROPA_RECORDS = [
  {
    id: 1,
    purpose: "วิเคราะห์พฤติกรรมลูกค้า",
    data_subject: "ลูกค้า",
    data_category: "ข้อมูลส่วนบุคคล",
    legal_basis: "consent",
    retention_period: 3,
    status: "active",
    expiration_date: "2028-01-01T00:00:00",
    created_at: "2025-01-01T00:00:00",
  },
  {
    id: 2,
    purpose: "บันทึกประวัติพนักงาน",
    data_subject: "พนักงาน",
    data_category: "ข้อมูลแรงงาน",
    legal_basis: "legal_obligation",
    retention_period: 5,
    status: "pending",
    expiration_date: "2030-01-01T00:00:00",
    created_at: "2025-01-01T00:00:00",
  },
  {
    id: 3,
    purpose: "บันทึกร้องเรียน",
    data_subject: "ผู้ร้องเรียน",
    data_category: "ข้อมูลทั่วไป",
    legal_basis: "consent",
    retention_period: 2,
    status: "inactive",
    reason: "หมดอายุการใช้งาน",
    expiration_date: "2023-01-01T00:00:00",
    created_at: "2021-01-01T00:00:00",
  },
];

// =====================================================================
// Helper: เซต localStorage เพื่อจำลองการ Login แล้ว
// =====================================================================
async function setAuthInLocalStorage(
  page: any,
  user: object = MOCK_USER_ADMIN,
  token: string = MOCK_TOKEN,
) {
  await page.addInitScript(
    ({
      storedToken,
      storedUser,
    }: {
      storedToken: string;
      storedUser: object;
    }) => {
      localStorage.setItem("token", storedToken);
      localStorage.setItem("user", JSON.stringify(storedUser));
    },
    { storedToken: token, storedUser: user },
  );
}

// =====================================================================
// Helper: Mock GET /ropa
// =====================================================================
async function mockRopaGet(page: any, records: object[] = MOCK_ROPA_RECORDS) {
  await page.route("http://localhost:3340/ropa", async (route: any) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { status: "success", data: records },
      });
    }
  });
}

// =====================================================================
// กลุ่มที่ 1 : หน้า Login (/)
// =====================================================================
test.describe("หน้า Login", () => {
  test("มี input ชื่อผู้ใช้และรหัสผ่านครบถ้วน", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test('มีปุ่ม "เข้าสู่ระบบ"', async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "เข้าสู่ระบบ" }),
    ).toBeVisible();
  });
});

// =====================================================================
// กลุ่มที่ 2 : หน้า ROPA Records (/ropa) — สิทธิ์ Admin
// =====================================================================
test.describe("หน้า ROPA Records (Admin)", () => {
  test.beforeEach(async ({ page }) => {
    await setAuthInLocalStorage(page, MOCK_USER_ADMIN);
    await mockRopaGet(page);
  });

  test('แสดง heading "รายการบันทึกกิจกรรม (RoPA)"', async ({ page }) => {
    await page.goto("/ropa");
    await expect(
      page.getByRole("heading", { name: "รายการบันทึกกิจกรรม (RoPA)" }),
    ).toBeVisible({ timeout: 8000 });
  });

  test('มีปุ่ม "Export CSV", "+ เพิ่มข้อมูลใหม่" และ "🔍 กรองข้อมูล"', async ({
    page,
  }) => {
    await page.goto("/ropa");
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible({
      timeout: 8000,
    });
    await expect(
      page.getByRole("link", { name: "+ เพิ่มข้อมูลใหม่" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /กรองข้อมูล/ }),
    ).toBeVisible();
  });

  test('แสดงข้อความ "ยังไม่มีบันทึก ROPA" เมื่อไม่มีข้อมูล', async ({
    page,
  }) => {
    await page.route("http://localhost:3340/ropa", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { status: "success", data: [] },
        });
      }
    });

    await page.goto("/ropa");
    await expect(page.getByText("ยังไม่มีบันทึก ROPA")).toBeVisible({
      timeout: 8000,
    });
  });
});
