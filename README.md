# Greenspace_Web

## Run project

```bash
pnpm install
pnpm run dev
```

## Docker Build

1. Đảm bảo bạn có file `.env` trong thư mục gốc của dự án với các biến môi trường cần thiết.

2. Build Docker image:
```bash
docker build -t greenspace-web .
```

3. Chạy container:
```bash
docker run -p 80:80 greenspace-web
```

**Lưu ý**: File `.env` sẽ được tự động copy vào Docker image trong quá trình build để đảm bảo các chức năng hoạt động đúng.

## Push lên Docker Hub

1. Đăng nhập vào Docker Hub:
```bash
docker login
```

2. Tag image với tên repository của bạn:
```bash
docker tag greenspace-web <your-dockerhub-username>/greenspace-web:latest
```

3. Push image lên Docker Hub:
```bash
docker push <your-dockerhub-username>/greenspace-web:latest
```

**Lưu ý**: 
- Thay `<your-dockerhub-username>` bằng tên người dùng Docker Hub của bạn
- Đảm bảo bạn đã tạo repository 'greenspace-web' trên Docker Hub trước khi push
- Sử dụng tag phù hợp thay vì 'latest' nếu cần thiết (ví dụ: v1.0.0)


