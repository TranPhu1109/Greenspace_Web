# Test Mode - Hệ thống điều chỉnh thời gian cho Demo Production

## Tổng quan

Test Mode cho phép điều chỉnh thời gian trong môi trường production để test các nút installation mà không cần thay đổi thời gian thiết bị. Đặc biệt hữu ích khi demo trên Vercel.

**Tính năng mới:**
- ✅ Cho phép bắt đầu installation sớm hơn 15 phút so với thời gian hẹn
- ✅ Giao diện Test Mode trực quan và dễ sử dụng
- ✅ Hiển thị trạng thái Test Mode trên tất cả trang liên quan
- ✅ Điều chỉnh nhanh với 2 chế độ: đúng giờ hoặc sớm 15 phút

## Cách sử dụng

### 1. Bật Test Mode

- Test Mode hiện đã được tích hợp vào **header của AdminLayout**
- Ở **giữa header**, bạn sẽ thấy nút **"Test Mode"** (khi chưa bật) hoặc tag hiển thị thời gian Test (khi đã bật)
- Click vào nút này để mở modal Test Mode
- **Lưu ý:** Test Mode sẽ hiển thị trên tất cả trang trong AdminLayout, không chỉ riêng trang Contractor

### 2. Cấu hình Test Mode

#### Bật Test Mode
- Sử dụng switch **"Test Mode: ON/OFF"** để bật/tắt
- Khi bật, giao diện sẽ hiển thị thêm các tùy chọn điều chỉnh

#### Chọn thời gian hẹn
- **Chọn ngày hẹn**: Chọn ngày appointment của task
- **Chọn giờ hẹn**: Chọn giờ appointment của task

#### Chế độ điều chỉnh
- **Đúng thời gian hẹn**: Điều chỉnh thời gian hiện tại thành đúng thời gian hẹn
- **Sớm hơn 15 phút**: Điều chỉnh thời gian hiện tại thành 15 phút trước thời gian hẹn

#### Áp dụng
- Click **"Áp dụng Test Mode"** để kích hoạt
- Thời gian Test sẽ được hiển thị ngay lập tức

### 3. Trạng thái Test Mode

Khi Test Mode được bật, bạn sẽ thấy:
- **Tag "Test Mode"** ở giữa header hiển thị thời gian Test hiện tại
- **Thanh cảnh báo màu cam** ở ngay dưới header hiển thị:
  - Thời gian thực hiện tại
  - Thời gian Test đã điều chỉnh
  - Thông tin về mức độ điều chỉnh
- **Hiển thị toàn cục:** Cả tag và thanh cảnh báo sẽ xuất hiện trên tất cả trang trong AdminLayout

## Ví dụ sử dụng

### Scenario 1: Test nút "Bắt đầu lắp đặt" đúng giờ

1. Có một task với `dateAppointment` là ngày mai lúc 14:00
2. Muốn test ngay bây giờ:
   - Bật Test Mode
   - Chọn ngày mai trong "Chọn ngày hẹn"
   - Chọn 14:00 trong "Chọn giờ hẹn"
   - Chọn "Đúng thời gian hẹn"
   - Click "Áp dụng Test Mode"
3. Bây giờ nút "Bắt đầu lắp đặt" sẽ được kích hoạt

### Scenario 2: Test nút "Bắt đầu lắp đặt" sớm 15 phút

1. Có một task với `dateAppointment` là hôm nay lúc 16:30
2. Muốn test việc bắt đầu sớm:
   - Bật Test Mode
   - Chọn hôm nay trong "Chọn ngày hẹn"
   - Chọn 16:30 trong "Chọn giờ hẹn"
   - Chọn "Sớm hơn 15 phút"
   - Click "Áp dụng Test Mode"
3. Thời gian Test sẽ là 16:15, cho phép bắt đầu lắp đặt sớm

### Scenario 3: Test với task có thời gian trong quá khứ

1. Có một task với `dateAppointment` là hôm qua lúc 10:00
2. Muốn test:
   - Bật Test Mode
   - Chọn hôm qua trong "Chọn ngày hẹn"
   - Chọn 10:00 trong "Chọn giờ hẹn"
   - Chọn "Đúng thời gian hẹn"
   - Click "Áp dụng Test Mode"
3. Nút "Bắt đầu lắp đặt" sẽ được kích hoạt vì đã qua thời gian hẹn

## Lưu ý quan trọng

1. **Chỉ dành cho demo**: Test Mode chỉ nên sử dụng trong môi trường demo/test
2. **Tự động lưu**: Cài đặt sẽ được lưu trong localStorage
3. **Tắt Test Mode**: Sử dụng nút "Tắt Test Mode" để về thời gian thực
4. **Ảnh hưởng toàn cục**: Test Mode sẽ áp dụng cho tất cả các trang liên quan
5. **Cho phép sớm 15 phút**: Hệ thống cho phép bắt đầu installation sớm hơn 15 phút so với thời gian hẹn

## Tính năng mới trong phiên bản này

### 1. Cho phép bắt đầu sớm 15 phút
- Các nút installation có thể được kích hoạt từ 15 phút trước thời gian hẹn
- Thông báo lỗi sẽ hiển thị thời gian cho phép (15 phút trước)

### 2. Giao diện Test Mode
- Giao diện mới với theme màu cam để dễ nhận biết
- Hiển thị rõ ràng trạng thái Test Mode
- Điều khiển đơn giản với 2 chế độ: đúng giờ và sớm 15 phút

### 3. Hiển thị trạng thái toàn cục
- Thanh cảnh báo Test Mode xuất hiện trên tất cả trang liên quan
- Hiển thị cả thời gian thực và thời gian Test
- Tag Test Mode ở header với thời gian hiện tại

### 4. **Logic validation thông minh**
- **Mặc định:** Validation `dateAppointment` sử dụng **thời gian thực** của hệ thống
- **Khi Test Mode BẬT:** Validation chuyển sang sử dụng **thời gian Test Mode**
- **Tự động chuyển đổi:** Hệ thống tự động chọn hàm validation phù hợp dựa trên trạng thái Test Mode
- **Đảm bảo chính xác:** Không có tình trạng validation sai khi Test Mode tắt/bật

## Cấu trúc kỹ thuật

### Files liên quan:
- `src/utils/timeConfig.js`: **Logic xử lý thời gian với validation thông minh**
  - `getRealCurrentTime()`: Luôn trả về thời gian thực
  - `getCurrentTime()`: Trả về thời gian Test nếu Test Mode bật
  - `isCurrentTimeMatchTaskTime()`: Validation với thời gian thực
  - `isTestModeTimeMatchTaskTime()`: Validation với thời gian Test
  - `getTimeValidationMessage()`: Message validation với thời gian thực
  - `getTestModeTimeValidationMessage()`: Message validation với thời gian Test
- `src/stores/useTimeAdjustmentStore.js`: Store quản lý state với persist và auto-restore
- `src/components/TimeAdjustmentControl/`: Component điều khiển Test Mode
- `src/components/TestModeIndicator/`: Component hiển thị trạng thái Test Mode
- `src/layouts/AdminLayout/index.jsx`: **Tích hợp Test Mode vào header toàn cục (chỉ hiển thị cho Contructor và Designer)**
- `src/layouts/AdminLayout/AdminLayout.scss`: CSS hỗ trợ layout header 3 cột
- `src/components/Contructor/ContractorTasks.jsx`: **Sử dụng validation thông minh**
- `src/components/Contructor/ContractorTaskDetail.jsx`: **Sử dụng validation thông minh**
- `src/components/Designer/Tasks/TaskDetail.jsx`: **Sử dụng validation thông minh cho nút "Lưu ghi chú"**

## Cách sử dụng

### Bước 1: Bật Test Mode
1. Vào trang ContractorTasks hoặc ContractorTaskDetail
2. Nhấn nút "Bật Test Mode" ở header
3. Chọn chế độ thời gian mong muốn

### Bước 2: Test installation buttons
1. Kiểm tra thời gian hiện tại được hiển thị
2. Test các nút installation với dateAppointment khác nhau
3. Quan sát validation messages

### Bước 3: Tắt Test Mode
1. Nhấn nút "Tắt Test Mode"
2. Hệ thống quay về thời gian thực

## Chi tiết Logic Validation

### Hàm validation thông minh

#### Trong ContractorTasks.jsx và ContractorTaskDetail.jsx:
```javascript
const timeMatchFunction = isTestModeEnabled ? isTestModeTimeMatchTaskTime : isCurrentTimeMatchTaskTime;
const validationMessageFunction = isTestModeEnabled ? getTestModeTimeValidationMessage : getTimeValidationMessage;

if (!timeMatchFunction(task)) {
  const validationMessage = validationMessageFunction(task, isReinstall);
  // Hiển thị thông báo lỗi
}
```

#### Trong TaskDetail.jsx (Designer):
```javascript
// Validation trong hàm handleUpdateSketchReport
const now = isTestModeEnabled ? getCurrentTime().toDate() : getRealCurrentTime().toDate();
const appointmentDate = new Date(task.serviceOrder.dateAppointment);

if (now < appointmentDate) {
  // Hiển thị thông báo lỗi
}

// Validation cho nút "Lưu ghi chú" disabled state
disabled={
  (isTestModeEnabled ? getCurrentTime().toDate() : getRealCurrentTime().toDate()) < new Date(task?.dateAppointment)
}
```

### Phân biệt các hàm validation:

#### Validation với thời gian thực (mặc định):
- `isCurrentTimeMatchTaskTime()`: Sử dụng `getRealCurrentTime()`
- `getTimeValidationMessage()`: Message dựa trên thời gian thực

#### Validation với Test Mode:
- `isTestModeTimeMatchTaskTime()`: Sử dụng `getCurrentTime()` (có thể là Test time)
- `getTestModeTimeValidationMessage()`: Message dựa trên thời gian Test

### Lợi ích:
- **Chính xác 100%**: Validation luôn sử dụng đúng thời gian tương ứng với chế độ
- **Tự động**: Không cần can thiệp thủ công khi bật/tắt Test Mode
- **Nhất quán**: Cùng một logic validation cho cả 2 chế độ

### Environment Variables (tùy chọn):
```env
VITE_ENABLE_TIME_ADJUSTMENT=true
VITE_TIME_ADJUSTMENT_HOURS=0
VITE_TIME_ADJUSTMENT_MINUTES=0
VITE_TIME_DEBUG=false
```

## Troubleshooting

### Nút vẫn không kích hoạt được
1. Kiểm tra xem đã bật Test Mode chưa
2. Xem thời gian Test có đúng không (hiển thị trong thanh cảnh báo)
3. Kiểm tra xem thời gian có trong khoảng cho phép không (từ 15 phút trước thời gian hẹn)

### Thời gian không chính xác
1. Sử dụng nút "Tắt Test Mode" để về thời gian thực
2. Thử cài đặt lại với chế độ mong muốn

### Không thấy thanh cảnh báo Test Mode
- Thanh cảnh báo chỉ hiển thị khi Test Mode được bật
- Kiểm tra lại cài đặt trong modal Test Mode

### Cài đặt bị mất
- Cài đặt được lưu trong localStorage, có thể bị xóa khi clear browser data
- Cần cài đặt lại sau khi clear cache
