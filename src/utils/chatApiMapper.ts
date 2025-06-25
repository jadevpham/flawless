export interface ApiDefinition {
    name: string;
    roles: string[];
    keywords: string[];       // Từ khóa liên quan đến câu hỏi
    api: (role: string) => string; // Trả về endpoint phù hợp theo role
  }
  
  export const apiDefinitions: ApiDefinition[] = [
    // CUSTOMER
    {
      name: "getMyBookings",
      roles: ["customer"],
      keywords: ["lịch hẹn", "booking", "appointment", "đặt lịch"],
      api: () => "/api/bookings/my",
    },
    {
      name: "getMyPaymentHistory",
      roles: ["customer"],
      keywords: ["lịch sử thanh toán", "payment", "giao dịch", "transaction"],
      api: () => "/api/payments/my",
    },
  
    // ARTIST
    {
      name: "getArtistBookings",
      roles: ["artist"],
      keywords: ["lịch hẹn", "appointment", "booking"],
      api: () => "/api/appointments",
    },
    {
      name: "getArtistIncome",
      roles: ["artist"],
      keywords: ["thu nhập", "doanh thu", "income"],
      api: () => "/api/income/my",
    },
    {
      name: "getArtistServices",
      roles: ["artist"],
      keywords: ["dịch vụ", "services", "bảng giá"],
      api: () => "/api/services/my",
    },
  
    // ADMIN
    {
        name: "getAppointment",
        roles: ["admin"],
        keywords: ["appointment", "transaction",],
        api: () => "http://localhost:3001/totalAppointment",
    },
    {
        name: "getArtistList",
        roles: ["admin"],
        keywords: ["artist", "transaction", "lịch booking của artist", "booking của artist", "schedule của artist", "lịch hẹn của artist"],
        api: () => "http://localhost:3001/artistList",
    },
    {
        name: "getTotalArtist",
        roles: ["admin"],
        keywords: ["thống kê artist trong từng tháng", "thống kê", "artist", "artist bị ban", "artist mới", "tổng số artist", "số lượng artist"],
        // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/get-total-artist",
        api: () => "/api/totalArtist.json",
      },
    {
        name: "getBestArtist",
        roles: ["admin"],
        keywords: ["danh sách best 5 artist trong tháng", "best 5", "artist"],
        api: () => "/api/bestArtist.json",
        // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/get-best-service",
    },
    {
        name: "getBestService",
        roles: ["admin"],
        keywords: ["danh sách best 5 service trong tháng", "best 5", "service"],
        api: () => "/api/bestService.json",
        // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/get-best-service",
    },
    {
        name: "getBestBooking",
        roles: ["admin"],
        keywords: ["booking nhiều nhất trong năm là ở tháng nào", "booking nhiều nhất trong năm là bao nhiêu", "tổng số booking trong tháng", "booking cancel", "booking bị hủy", "booking bị hủy nhiều nhất trong năm là bao nhiêu", "booking bị hủy nhiều nhất trong năm là vào tháng nào"],
        api: () => "/api/totalBooking.json",
        // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/total-booking",
    },
    {
      name: "getCustomerList",
      roles: ["admin"],
      keywords: ["danh sách người dùng", "tài khoản", "user list"],
      api: () => "/api/customerList.json",
      // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/UserProgress/get-information-customer",
    },
    {
      name: "getTotalCustomer",
      roles: ["admin"],
      keywords: ["thống kê artist trong từng tháng", "thống kê", "artist", "artist bị ban", "artist mới", "tổng số artist", "số lượng artist"],
      api: () => "/api/totalCustomer.json",
  },
    {
      name: "getBookingStatistics",
      roles: ["admin"],
      keywords: ["thống kê booking", "số lượng đặt lịch", "thống kê đặt hẹn"],
      api: () => "/api/totalBooking.json",
    },
    {
      name: "getRevenue",
      roles: ["admin"],
      keywords: ["thu nhập", "doanh thu nền tảng", "income", "refund", "net profit"],
      api: () => "/api/totalRevenue.json",
      // api: () => "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/tota-revenue",
    },
    {
        name: "getReview",
        roles: ["admin"],
        keywords: ["review", "feedback", "comment", "đánh giá", "bình luận"],
        api: () => "/api/totalReview.json",
    },
  
    // GUEST
    {
      name: "searchMUA",
      roles: ["guest", "customer"],
      keywords: ["tìm MUA", "makeup artist", "tìm chuyên gia", "tìm kiếm"],
      api: () => "http://localhost:3001/artistList/",
    },
  ];
  
  export function findBestApiMatch(
    userInput: string,
    role: string
  ): { name: string; api: string } | null {
    const lowerInput = userInput.toLowerCase();
    let bestMatch: { name: string; api: string; score: number } | null = null;
  
    for (const def of apiDefinitions) {
      if (!def.roles.includes(role)) continue;
  
      // Tính score dựa trên từ khóa trùng và độ dài keyword
      let score = def.keywords.reduce((acc, keyword) => {
        return lowerInput.includes(keyword.toLowerCase())
          ? acc + keyword.length
          : acc;
      }, 0);
  
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          name: def.name,
          api: def.api(role),
          score,
        };
      }
    }
  
    return bestMatch ? { name: bestMatch.name, api: bestMatch.api } : null;
  }
  