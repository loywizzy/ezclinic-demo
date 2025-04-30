-- Role Table (พนักงาน / ลูกค้า demo)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name  VARCHAR NOT NULL,
  email      VARCHAR UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role       VARCHAR NOT NULL CHECK (role IN ('admin','employee','customer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ตารางสถิติตัวเลขใน Dashboard (เก็บยอดนับไว้ดูง่าย ๆ)
CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,   -- customers / employees / positions
  value INTEGER DEFAULT 0
);

INSERT INTO stats (name,value) VALUES
('customers',53000),('employees',53000),('positions',53000);

-- demo admin / password = admin123
INSERT INTO users (full_name,email,password_hash,role)
VALUES ('Admin Demo','admin@example.com',
        '$2a$10$Wzx0xWkZE/pzQbFz5EIrRuzJGq4gCpnrXzvRET9jXn4dF8ZdomA/2', -- bcrypt('admin123')
        'admin');


-- ตารางตำแหน่งงาน (ถ้ายังไม่มี)
CREATE TABLE positions (
  id CHAR(7) PRIMARY KEY,
  name VARCHAR NOT NULL
);

-- ตารางพนักงาน
CREATE TABLE employees (
  id                       CHAR(7)       PRIMARY KEY,              -- รหัสพนักงาน
  prefix                   VARCHAR(10),                             -- คำนำหน้า
  first_name               VARCHAR(100)  NOT NULL,                 -- ชื่อ
  last_name                VARCHAR(100)  NOT NULL,                 -- นามสกุล
  nickname                 VARCHAR(100),                            -- ชื่อเล่น
  position_id              CHAR(7)       REFERENCES positions(id) ON DELETE SET NULL,
  color                    VARCHAR(20),                             -- สี
  salary                   NUMERIC(12,2),                           -- เงินเดือน
  pay_date                 DATE,                                    -- วันที่จ่ายเงินเดือน
  has_social_security      BOOLEAN       NOT NULL DEFAULT TRUE,     -- มีประกันสังคม?
  social_security_number   VARCHAR(20),                             -- เลขประกันสังคม
  tax_deduction            NUMERIC(12,2),                           -- หัก ณ ที่จ่าย
  hour_rate                NUMERIC(12,2),                           -- ค่าบุ่ง/ชั่วโมง
  overtime_rate            NUMERIC(12,2),                           -- ค่าโอที
  leave_personal           INTEGER       DEFAULT 0,                 -- ลากิจ (วัน/ปี)
  leave_vacation           INTEGER       DEFAULT 0,                 -- ลาพักร้อน
  leave_sick               INTEGER       DEFAULT 0,                 -- ลาป่วย
  role_id                  INT           NOT NULL DEFAULT 3,       -- FK ไป permission_groups (default viewer)
    REFERENCES permission_groups(id),
  email                    VARCHAR(150)  NOT NULL UNIQUE,           -- อีเมลสำหรับ login
  password_hash            TEXT          NOT NULL,                 -- รหัสผ่าน (bcrypt)
  status                   BOOLEAN       NOT NULL DEFAULT TRUE,     -- สถานะ ใช้งาน/พักใช้งาน
  pay_channel              VARCHAR(50),                             -- ช่องทางการชำระ
  account_type             VARCHAR(20)   CHECK(account_type IN ('ออมทรัพย์','สะสมทรัพย์')),
  bank                     VARCHAR(100),                            -- ธนาคาร
  account_number           VARCHAR(30),                             -- เลขที่บัญชี
  bank_branch              VARCHAR(100),                            -- สาขาธนาคาร
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE permission_groups (
  id          SERIAL      PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,    -- ชื่อกลุ่มสิทธิ์ เช่น Admin / User / Viewer
  description TEXT                              -- คำอธิบายเพิ่มเติม (ถ้ามี)
);

CREATE TABLE positions (
  id           CHAR(7)      PRIMARY KEY,           -- รหัสตำแหน่ง เช่น "0000001"
  name         VARCHAR(100) NOT NULL,              -- ชื่อตำแหน่ง
  salary       NUMERIC(12,2) NOT NULL,             -- เงินเดือน
  status       BOOLEAN     NOT NULL DEFAULT TRUE,  -- สถานะ ใช้งาน/ปิดใช้งาน
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE permission_details (
  group_id   INT                         NOT NULL
    REFERENCES permission_groups(id) ON DELETE CASCADE,
  module     VARCHAR(50)                 NOT NULL,  -- ชื่อโมดูล: "customers","employees","positions" ฯลฯ
  can_view   BOOLEAN    NOT NULL DEFAULT FALSE,
  can_create BOOLEAN    NOT NULL DEFAULT FALSE,
  can_update BOOLEAN    NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN    NOT NULL DEFAULT FALSE,
  PRIMARY KEY (group_id, module)
);

CREATE TABLE customers (
  id           CHAR(7)       PRIMARY KEY,              -- รหัสลูกค้า เช่น '0000001'
  full_name    VARCHAR(200)  NOT NULL,                 -- ชื่อ-นามสกุล
  phone        VARCHAR(20),                            -- เบอร์โทรศัพท์
  email        VARCHAR(150) NOT NULL UNIQUE,           -- อีเมล
  status       BOOLEAN      NOT NULL DEFAULT TRUE,     -- สถานะ ใช้งาน/ปิดใช้งาน
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);



-- 1) กลุ่มสิทธิ์ (ต้องสร้างก่อน permission_details และ employees)
CREATE TABLE permission_groups (
  id          SERIAL      PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- 2) ตำแหน่งงาน (positions)
CREATE TABLE positions (
  id           CHAR(7)       PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  salary       NUMERIC(12,2) NOT NULL,
  status       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 3) รายละเอียดสิทธิ์ต่อโมดูล (permission_details)
CREATE TABLE permission_details (
  group_id    INT            NOT NULL
                 REFERENCES permission_groups(id) ON DELETE CASCADE,
  module      VARCHAR(50)    NOT NULL,
  can_view    BOOLEAN        NOT NULL DEFAULT FALSE,
  can_create  BOOLEAN        NOT NULL DEFAULT FALSE,
  can_update  BOOLEAN        NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN        NOT NULL DEFAULT FALSE,
  PRIMARY KEY (group_id, module)
);

-- 4) พนักงาน (employees)
CREATE TABLE employees (
  id                     CHAR(7)       PRIMARY KEY,
  prefix                 VARCHAR(10),
  first_name             VARCHAR(100)  NOT NULL,
  last_name              VARCHAR(100)  NOT NULL,
  nickname               VARCHAR(100),
  position_id            CHAR(7)
                           REFERENCES positions(id) ON DELETE SET NULL,
  color                  VARCHAR(20),
  salary                 NUMERIC(12,2),
  pay_date               DATE,
  has_social_security    BOOLEAN       NOT NULL DEFAULT TRUE,
  social_security_number VARCHAR(20),
  tax_deduction          NUMERIC(12,2),
  hour_rate              NUMERIC(12,2),
  overtime_rate          NUMERIC(12,2),
  leave_personal         INTEGER       DEFAULT 0,
  leave_vacation         INTEGER       DEFAULT 0,
  leave_sick             INTEGER       DEFAULT 0,
  role_id                INT           NOT NULL DEFAULT 3
                           REFERENCES permission_groups(id),
  email                  VARCHAR(150)  NOT NULL UNIQUE,
  password_hash          TEXT          NOT NULL,
  status                 BOOLEAN       NOT NULL DEFAULT TRUE,
  pay_channel            VARCHAR(50),
  account_type           VARCHAR(20)
                           CHECK(account_type IN ('ออมทรัพย์','สะสมทรัพย์')),
  bank                   VARCHAR(100),
  account_number         VARCHAR(30),
  bank_branch            VARCHAR(100),
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 5) ลูกค้า (customers)
CREATE TABLE customers (
  id           CHAR(7)       PRIMARY KEY,
  full_name    VARCHAR(200)  NOT NULL,
  phone        VARCHAR(20),
  email        VARCHAR(150)  NOT NULL UNIQUE,
  status       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
