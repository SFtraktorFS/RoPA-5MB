*** Settings ***
Library    RequestsLibrary
Library    Collections

Suite Setup    Login To API

*** Variables ***
# ใช้เพื่อระบุตำแหน่ง service 'api-server' (หรือใช้ port ภายใน docker-compose) และใช้ port ภายนอก docker-compose คือ 3340
${BASE_URL}    http://api-server:8000
${ACCESS_TOKEN}    ${EMPTY}

*** Keywords ***
Login To API
    [Documentation]    ทดสอบการเข้าสู่ระบบและบันทึก access token
    Create Session    api_session    ${BASE_URL}
    ${data}=    Create Dictionary    username=admin    password=123456
    ${response}=    POST On Session    api_session    /login    data=${data}
    Status Should Be    200    ${response}
    ${token}=    Get From Dictionary    ${response.json()}    access_token
    Set Suite Variable    ${ACCESS_TOKEN}    ${token}
    Log To Console    \nLogin Success! Access Token: ${ACCESS_TOKEN}

*** Test Cases ***
Verify Get All ROPA Records Successfully
    [Documentation]    ทดสอบการดึงข้อมูลบันทึกการประมวลผลข้อมูล (ROPA) ทั้งหมด
    Create Session    api_session    ${BASE_URL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${ACCESS_TOKEN}
    ${response}=    GET On Session    api_session    /ropa    headers=${headers}
    Status Should Be    200    ${response}
    Log To Console    \nResponse Data: ${response.json()}

Verify Create New ROPA Record
    [Documentation]    ทดสอบการสร้างบันทึกการประมวลผลข้อมูลใหม่ (ROPA)
    ${payload}=    Create Dictionary
    ...    purpose=Data Processing for Analysis
    ...    data_subject=Customer
    ...    data_category=Personal Information
    ...    legal_basis=consent
    ...    retention_period=3
    ...    status=pending
    ...    reason=Test Reason
    ${headers}=    Create Dictionary    Authorization=Bearer ${ACCESS_TOKEN}    Content-Type=application/json
    Create Session    api_session    ${BASE_URL}
    ${response}=    POST On Session    api_session    /ropa    json=${payload}    headers=${headers}
    Status Should Be    200    ${response}
    Log To Console    \nResponse Data: ${response.json()}
