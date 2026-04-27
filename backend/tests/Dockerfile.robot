FROM python:3.10-slim

# ติดตั้ง Chromium (Chrome สำหรับ Linux) และตัว Driver
RUN apt-get update && apt-get install -y chromium chromium-driver

# กำหนดตำแหน่งทำงานใน Docker
WORKDIR /tests

# คัดลอกไฟล์ requirements และติดตั้ง
COPY requirements-test.txt .
RUN pip install --no-cache-dir -r requirements-test.txt

# กำหนดคำสั่งเริ่มต้น: สิ่งที่ robot และใช้ผลลัพธ์ให้ไฟล์เดอร์ results
CMD ["robot", "-d", "results", "."]
