# TKB HUST - Tool Xếp Thời Khóa Biểu

Một công cụ hỗ trợ sinh viên Đại học Bách Khoa Hà Nội (HUST) xây dựng thời khóa biểu cá nhân một cách tối ưu, nhanh chóng và trực quan. Dự án giúp giải quyết bài toán trùng lịch học và tối ưu hóa thời gian biểu dựa trên nguyện vọng cá nhân.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Target-Node.js-green)
![React](https://img.shields.io/badge/Frontend-React_Vite-blue)

## 📋 Tính năng nổi bật

### 🔍 Tìm kiếm và quản lý môn học
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm môn học theo tên hoặc mã học phần nhanh chóng.
- **Chi tiết lớp học**: Hiển thị đầy đủ thông tin về mã lớp, loại lớp (Lý thuyết - LT, Bài tập - BT), giảng viên và thời gian học.
- **Import dữ liệu**: Dễ dàng nhập danh sách các lớp học phần từ file Excel (theo định dạng của nhà trường).

### 📅 Xếp lịch tự động & Tối ưu hóa
- **Thuật toán thông minh**: Tự động tạo ra các phương án thời khóa biểu hợp lệ, đảm bảo không bị trùng giờ.
- **Xử lý ràng buộc**:
    - Tự động ghép cặp các lớp Lịch thuyết (LT) và Bài tập (BT) tương ứng.
    - Hỗ trợ ràng buộc thời gian: Tránh học Sáng hoặc Chiều theo từng ngày trong tuần.
- **Đa dạng phương án**: Cung cấp nhiều lựa chọn thời khóa biểu khác nhau để sinh viên cân nhắc.

### 📊 Giao diện và Trải nghiệm
- **Hiển thị trực quan**: Xem thời khóa biểu dưới dạng lưới tuần chi tiết, dễ nhìn.
- **Dễ sử dụng**: Thao tác chọn môn, xem chi tiết và lưu kết quả đơn giản.
---

## 🛠 Công nghệ sử dụng

### Frontend
- **Core**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **File Processing**: 
    - [Multer](https://github.com/expressjs/multer) - Xử lý upload file.
    - [XLSX](https://docs.sheetjs.com/) - Đọc và xử lý file Excel dữ liệu thời khóa biểu.
    - **ORM/CDM**: [Mongoose](https://mongoosejs.com/) - Tương tác với MongoDB.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

Để chạy được dự án trên máy cá nhân, hãy đảm bảo bạn đã cài đặt:
- **Node.js** (v14 trở lên)
- **MongoDB** (Đang chạy service local hoặc có chuỗi kết nối Atlas)

### 1. Cài đặt và chạy Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Cài đặt các thư viện phụ thuộc:

```bash
npm install
```

Tạo file cấu hình môi trường `.env` trong thư mục `backend`:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/tkb-database
# Thay đổi MONGO_URL nếu bạn dùng MongoDB Atlas hoặc cổng khác
```

Khởi chạy server (chế độ development):

```bash
npm run dev
```
*Server sẽ khởi động tại `http://localhost:3000`*

### 2. Cài đặt và chạy Frontend

Mở một terminal mới và di chuyển vào thư mục frontend:

```bash
cd frontend
```

Cài đặt các thư viện:

```bash
npm install
```

Khởi chạy ứng dụng:

```bash
npm run dev
```
*Ứng dụng sẽ chạy tại `http://localhost:5173` (mặc định)*

---

## 📖 Hướng dẫn sử dụng

1.  **Import dữ liệu (Lần đầu)**:
    - Tại giao diện chính, nhấn vào nút **Import Dữ Liệu** ở góc trên bên phải.
    - Chọn file Excel chứa danh sách các lớp học phần kỳ này.
    - Chờ hệ thống xử lý và cập nhật cơ sở dữ liệu.

2.  **Chọn môn học**:
    - Sử dụng thanh tìm kiếm để tìm môn học (VD: "Giải tích 1", "IT1000").
    - Nhấn chọn vào các lớp bạn muốn học hoặc quan tâm. Hệ thống sẽ tự động thêm vào danh sách đã chọn.

3.  **Tạo thời khóa biểu**:
    - Nhấn nút **Xếp Lịch** để hệ thống tính toán.
    - Sử dụng các tùy chọn **Nâng cao** để lọc bỏ các buổi không muốn học.

4.  **Xem kết quả**:
    - Duyệt qua các phương án thời khóa biểu được tạo ra.
    - Xem chi tiết từng lớp trên lưới thời khóa biểu.

---

## 📂 Cấu trúc thư mục dự án

```
TKB/
├── backend/                # Mã nguồn API Server
│   ├── config/             # Cấu hình DB, file mẫu
│   ├── controllers/        # Logic xử lý API
│   ├── models/             # Schema MongoDB
│   ├── routes/             # Định nghĩa API endpoints
│   ├── services/           # Logic nghiệp vụ phức tạp (Xếp lịch, Parse Excel)
│   ├── uploads/            # Thư mục tạm lưu file upload
│   ├── index.js            # Điểm khởi chạy server
│   └── package.json
│
├── frontend/               # Mã nguồn Client React
│   ├── public/             # Assets tĩnh
│   ├── src/
│   │   ├── components/     # Các component UI tái sử dụng
│   │   │   ├── common/     # Modal, Button, Input...
│   │   │   ├── features/   # Component đặc thù (Lưới thời khóa biểu, Bộ môn...)
│   │   │   └── layout/     # Header, Footer
│   │   ├── pages/          # Các trang chính
│   │   ├── services/       # Hàm gọi API
│   │   ├── store/          # Zustand store
│   │   ├── App.jsx         # Component gốc
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🤝 Đóng góp

Mọi sự đóng góp đều rất đáng quý! Nếu bạn tìm thấy lỗi hoặc muốn đề xuất tính năng mới, hãy tạo một Issue hoặc Pull Request trên repository này.

