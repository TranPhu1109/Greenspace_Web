// Status text mapping
export const getStatusText = (status) => {
  const statusMap = {
    0: "Chờ xử lý",
    'Pending': "Chờ xử lý",
    1: "Đang tư vấn & phác thảo",
    'ConsultingAndSketching': "Đang tư vấn & phác thảo",
    2: "Đang tư vấn & phác thảo", // Hide DeterminingDesignPrice
    'DeterminingDesignPrice': "Đang tư vấn & phác thảo", 
    22: "Hoàn thành tư vấn & phác thảo",
    'DoneDeterminingDesignPrice': "Hoàn thành tư vấn & phác thảo", // Hide ReDeterminingDesignPrice
    24: "Đang tư vấn & phác thảo",
    'ReDeterminingDesignPrice': "Đang tư vấn & phác thảo",
    19: "Đang tư vấn & phác thảo", // Hide ReConsultingAndSketching
    'ReConsultingAndSketching': "Đang tư vấn & phác thảo", 
    21: "Chờ đặt cọc",
    'WaitDeposit': "Chờ đặt cọc",
    3: "Đặt cọc thành công",
    'DepositSuccessful': "Đặt cọc thành công",
    4: "Đang thiết kế",
    'AssignToDesigner': "Đang thiết kế",
    5: "Đang thiết kế", 
    'DeterminingMaterialPrice': "Đang thiết kế",
    20: "Đang thiết kế", // Hide ReDesign
    'ReDesign': "Đang thiết kế",
    32: "Đang thiết kế",
    'ReDetermineMaterialPrice': "Đang thiết kế",
    33: "Đang thiết kế",
    'MaterialPriceConfirmed': "Đang thiết kế",
    6: "Thanh toán phí thiết kế còn lại",
    'DoneDesign': "Thanh toán phí thiết kế còn lại",
    23: "Chọn bản thiết kế",
    'DoneDeterminingMaterialPrice': "Chọn bản thiết kế",
    7: "Thanh toán thành công & chờ xác nhận hàng",
    'PaymentSuccess': "Thanh toán thành công & chờ xác nhận hàng",
    8: "Đang chuẩn bị hàng",
    'Processing': "Đang chuẩn bị hàng",
    9: "Đang giao hàng",
    'PickedPackageAndDelivery': "Đang giao hàng",
    12: "Đã giao hàng thành công",
    'DeliveredSuccessfully': "Đã giao hàng thành công",
    13: "Hoàn thành đơn hàng",
    'CompleteOrder': "Hoàn thành đơn hàng",
    14: "Đã hủy",
    'OrderCancelled': "Đã hủy",
    18: "Đã hủy",
    'StopService': "Đã hủy",
    10: "Giao hàng thất bại",
    'DeliveryFail': "Giao hàng thất bại",
    11: "Đang giao lại",
    'ReDelivery': "Đang giao lại",
    15: "Đang xử lý", // Consider a generic status for Warning
    'Warning': "Đang xử lý",
    16: "Đang hoàn tiền",
    'Refund': "Đang hoàn tiền",
    17: "Đã hoàn tiền",
    'DoneRefund': "Đã hoàn tiền",
    27: "Đang lắp đặt",
    'Installing': "Đang lắp đặt",
    28: "Đã lắp đặt xong",
    'DoneInstalling': "Đã lắp đặt xong",
    29: "Yêu cầu lắp đặt lại",
    'ReInstall': "Yêu cầu lắp đặt lại",
    31: "Đơn hàng hoàn tất",
    'Successfully': "Đơn hàng hoàn tất",
    
  };
  
  // Return mapped text or the original status if not found
  return statusMap[status] || status?.toString() || 'Không xác định';
};

// Status color mapping
export const getStatusColor = (status) => {
  const colorMap = {
    0: "orange",
    'Pending': "orange",
    1: "blue",
    'ConsultingAndSketching': "blue",
    2: "blue", // Hide DeterminingDesignPrice
    'DeterminingDesignPrice': "blue",
    22: "green",
    'DoneDeterminingDesignPrice': "green",
    24: "blue",
    'ReDeterminingDesignPrice': "blue",
    19: "blue", // Hide ReConsultingAndSketching
    'ReConsultingAndSketching': "blue",
    21: "purple",
    'WaitDeposit': "purple",
    3: "cyan",
    'DepositSuccessful': "cyan",
    4: "cyan",
    'AssignToDesigner': "cyan",
    5: "cyan",
    'DeterminingMaterialPrice': "cyan",
    20: "cyan", // Hide ReDesign
    'ReDesign': "cyan",
    32: "cyan",
    'ReDetermineMaterialPrice': "cyan",
    33: "cyan",
    'MaterialPriceConfirmed': "cyan",
    6: "gold",
    'DoneDesign': "gold",
    23: "purple",
    'DoneDeterminingMaterialPrice': "purple",
    7: "processing", // Antd color name
    'PaymentSuccess': "processing",
    8: "processing",
    'Processing': "processing",
    9: "geekblue",
    'PickedPackageAndDelivery': "geekblue",
    12: "success",
    'DeliveredSuccessfully': "success",
    13: "success",
    'CompleteOrder': "success",
    14: "error",
    'OrderCancelled': "error",
    18: "error",
    'StopService': "error",
    10: "error",
    'DeliveryFail': "error",
    11: "geekblue",
    'ReDelivery': "geekblue",
    15: "warning",
    'Warning': "warning",
    16: "orange",
    'Refund': "orange",
    17: "default",
    'DoneRefund': "default",
    27: "blue",
    'Installing': "blue",
    28: "green",
    'DoneInstalling': "green",
    29: "red",
    'ReInstall': "red",
    31: "green",
    'Successfully': "green",
  };
  
  // Return mapped color or 'default'
  return colorMap[status] || 'default';
};

// Define statuses where ONLY phase 0 sketches are shown initially
export const showOnlyPhase0Statuses = [
  'ConsultingAndSketching',        // 1
  'DeterminingDesignPrice',        // 2
  'DepositSuccessful',              // 3
  'AssignToDesigner',               // 4
  'DeterminingMaterialPrice',       // 5
  'DoneDesign',                     // 6
  'PaymentSuccess',                 // 7
  'Processing',                     // 8
  'PickedPackageAndDelivery',       // 9
  'DeliveryFail',                   // 10
  'ReDelivery',                     // 11
  'DeliveredSuccessfully',          // 12
  'CompleteOrder',                  // 13
  'OrderCancelled',                 // 14
  'Warning',                        // 15
  'Refund',                         // 16
  'DoneRefund',                     // 17
  'StopService',                    // 18
  'ReConsultingAndSketching',       // 19
  'ReDesign',                       // 20
  'WaitDeposit',                    // 21
  'DoneDeterminingDesignPrice',     // 22
  'DoneDeterminingMaterialPrice',   // 23
  'ReDeterminingDesignPrice',       // 24
  'ExchangeProduct',                // 25
  'MaterialPriceConfirmed',         // 33
  'DoneInstalling',                 // 28
  'Installing',                     // 27
  'ReInstall',                      // 29
  'DoneRefund',                     // 17
];

// Define statuses where ALL sketch phases are shown
export const showAllPhasesStatuses = [
  'DoneDeterminingDesignPrice', // 22
  'WaitDeposit',                // 21
  'DepositSuccessful',          // 3
  'AssignToDesigner',           // 4
  'DeterminingMaterialPrice',   // 5
  'DoneDesign',                 // 6
  'DoneDeterminingMaterialPrice', // 23
  'PaymentSuccess',             // 7
  'Processing',                 // 8
  'PickedPackageAndDelivery',   // 9
  'DeliveryFail',               // 10
  'ReDelivery',                 // 11
  'DeliveredSuccessfully',      // 12
  'CompleteOrder',              // 13
  'Warning',                    // 15
  "ReConsultingAndSketching",   // 19
  "ReDesign",                   // 20
  'MaterialPriceConfirmed',     // 33
];

// Define statuses where design records should be shown
export const showDesignRecordsStatuses = [
  'AssignToDesigner',           // 4
  'DeterminingMaterialPrice',   // 5 
  'DoneDesign',                 // 6
  'DoneDeterminingMaterialPrice', // 23
  'PaymentSuccess',             // 7
  'Processing',                 // 8
  'PickedPackageAndDelivery',   // 9
  'DeliveryFail',               // 10
  'ReDelivery',                 // 11
  'DeliveredSuccessfully',      // 12
  'CompleteOrder',              // 13
  'Warning',                    // 15
  'ReDesign',                   // 20
  'MaterialPriceConfirmed',     // 33
];

// Define statuses where contract should be visible
export const contractVisibleStatuses = [
  'WaitDeposit',                // 21
  'DepositSuccessful',          // 3
  'AssignToDesigner',           // 4
  'DeterminingMaterialPrice',   // 5
  'DoneDesign',                 // 6
  'DoneDeterminingMaterialPrice', // 23
  'PaymentSuccess',             // 7
  'Processing',                 // 8
  'PickedPackageAndDelivery',   // 9
  'DeliveryFail',               // 10
  'ReDelivery',                 // 11
  'DeliveredSuccessfully',      // 12
  'CompleteOrder',              // 13
  'Warning',                    // 15
  'MaterialPriceConfirmed',     // 33
];

// Define numeric status codes where contract should be visible
export const contractVisibleStatusCodes = [21, 3, 4, 5, 6, 23, 7, 8, 9, 10, 11, 12, 13, 15];

// Define statuses where material price is considered final and relevant
export const finalMaterialPriceStatuses = [
  'DoneDeterminingMaterialPrice', // 23
  'PaymentSuccess',             // 7
  'Processing',                 // 8
  'PickedPackageAndDelivery',   // 9
  'DeliveryFail',               // 10
  'ReDelivery',                 // 11
  'DeliveredSuccessfully',      // 12
  'CompleteOrder',              // 13
  'OrderCancelled',             // 14
  'Warning',                    // 15
  'Successfully',               // 31
  'DoneInstalling',             // 28
  'Installing',                 // 27
  'ReInstall',                  // 29
  'DoneRefund',                 // 17
];

// Define statuses where design price is considered approved for customer view
export const approvedDesignPriceStatuses = [
  'DoneDeterminingDesignPrice', // 22
  'ReDetermineMaterialPrice',   // 24
  'WaitDeposit',                // 21
  'DepositSuccessful',          // 3
  'AssignToDesigner',           // 4
  'DeterminingMaterialPrice',   // 5
  'DoneDesign',                 // 6
  'DoneDeterminingMaterialPrice', // 23
  'PaymentSuccess',             // 7
  'Processing',                 // 8
  'PickedPackageAndDelivery',   // 9
  'DeliveredSuccessfully',      // 12
  'CompleteOrder',              // 13
  'Warning',                    // 15
  'ReDesign',                   // 20
  'MaterialPriceConfirmed',     // 33
  'Successfully',               // 31
  'DoneInstalling',             // 28
  'Installing',                 // 27
  'ReInstall',                  // 29
  'DoneRefund',                 // 17
]; 