import axios from "axios";
import { findBestApiMatch } from "@/utils/chatApiMapper";
import { buildSystemPrompt } from "@/prompts";
import type { AppThunk } from "@/redux/store";
import {
  addAssistantMessage,
  addUserMessage,
  setLoading,
} from "@/redux/slices/chatSlice";
import type { ChatMessage } from "@/redux/slices/chatSlice";

export const handleHybridChat =
  (userInput: string, role: string): AppThunk =>
  async (dispatch, getState) => {
    const apiKey = import.meta.env.VITE_CHATGPT_KEY;
    const userRole = getState().auth?.currentUser?.role || "guest";
    const mapped = findBestApiMatch(userInput, userRole);

    try {
      dispatch(setLoading(true));
      dispatch(addUserMessage({ role: "user", content: userInput }));

      // Nếu không có API key, sử dụng fallback responses đơn giản
      if (!apiKey) {
        const fallbackResponses: Record<string, string> = {
          "giới thiệu web": "Flawless là một nền tảng đặt lịch làm đẹp trực tuyến, kết nối khách hàng với các chuyên gia làm đẹp chất lượng cao. Chúng tôi cung cấp dịch vụ đặt lịch, quản lý booking và đánh giá dịch vụ.",
          "giới thiệu flawless": "Flawless là ứng dụng đặt lịch làm đẹp hàng đầu, giúp bạn dễ dàng tìm kiếm và đặt lịch với các artist chuyên nghiệp. Chúng tôi cam kết mang đến trải nghiệm làm đẹp tốt nhất.",
          "hướng dẫn sử dụng": "Để sử dụng Flawless: 1) Đăng ký tài khoản, 2) Chọn dịch vụ bạn muốn, 3) Chọn artist và thời gian, 4) Xác nhận booking và thanh toán. Mọi thứ đều đơn giản và nhanh chóng!",
          "ai tạo ra flawless": "Flawless được phát triển bởi đội ngũ lập trình viên trẻ với mục tiêu tạo ra một nền tảng làm đẹp hiện đại và tiện lợi cho mọi người.",
          "mục tiêu của flawless": "Mục tiêu của Flawless là trở thành nền tảng đặt lịch làm đẹp hàng đầu, kết nối khách hàng với các chuyên gia làm đẹp chất lượng cao và mang đến trải nghiệm dịch vụ tốt nhất.",
          "flawless dùng làm gì": "Flawless dùng để đặt lịch làm đẹp trực tuyến. Bạn có thể tìm kiếm dịch vụ, chọn artist, đặt lịch và thanh toán tất cả trên một nền tảng duy nhất.",
          "nói về web": "Website Flawless là nền tảng đặt lịch làm đẹp trực tuyến với giao diện thân thiện, dễ sử dụng. Chúng tôi cung cấp đầy đủ các tính năng từ đặt lịch đến quản lý booking.",
        };

        let response = "Xin chào! Tôi là chatbot của Flawless. Tôi có thể giúp bạn tìm hiểu về nền tảng đặt lịch làm đẹp của chúng tôi. Bạn có thể hỏi tôi về: giới thiệu Flawless, hướng dẫn sử dụng, hoặc mục tiêu của Flawless.";
        
        // Kiểm tra xem có câu hỏi tương tự trong fallback không
        for (const [question, answer] of Object.entries(fallbackResponses)) {
          if (userInput.toLowerCase().includes(question.toLowerCase())) {
            response = answer;
            break;
          }
        }
        
        dispatch(addAssistantMessage({
          role: "assistant",
          content: response,
        }));
        return;
      }

      let finalMessages: ChatMessage[] = [];
      const systemPrompt: ChatMessage = {
        role: "system",
        content: buildSystemPrompt("vi"),
      };

      // Nếu có mapped API (câu hỏi về dữ liệu cụ thể), sử dụng function call
      if (mapped) {
        const apiResponse = await axios.get(mapped.api);
        const apiData = apiResponse.data;

        // Debug: Log dữ liệu để kiểm tra
        console.log("API Response:", apiData);
        console.log("API Data length:", JSON.stringify(apiData).length);

        // Xử lý dữ liệu để đảm bảo lấy đầy đủ
        let processedData = apiData;
        
        // Nếu là array, giới hạn số lượng item để tránh quá dài
        if (Array.isArray(apiData)) {
          if (apiData.length > 100) { // Tăng lên 100 items
            processedData = {
              total: apiData.length,
              data: apiData.slice(0, 100),
              message: `Hiển thị ${100} kết quả đầu tiên trong tổng số ${apiData.length} kết quả.`
            };
          }
        }

        const finalDataString = JSON.stringify(processedData).slice(0, 15000);
        console.log("Final data string length:", finalDataString.length);

        finalMessages = [
          systemPrompt,
          {
            role: "function",
            name: "customData",
            content: finalDataString, // Tăng giới hạn lên 15000 ký tự
          },
          { 
            role: "user", 
            content: `Dựa trên dữ liệu trên, hãy trả lời câu hỏi: ${userInput}. 

CẤU TRÚC DỮ LIỆU:
- Mỗi artist có: id, nameArtist, services[], schedule[]
- services[]: chứa các dịch vụ với name, price, status
- schedule[]: chứa các booking với service, date, status (0=chờ, 1=đang làm, 2=hoàn thành)

Nếu câu hỏi về thu nhập của artist:
1. Tìm artist theo nameArtist trong danh sách
2. Xem schedule của artist đó
3. Lọc các booking có status = 2 (hoàn thành)
4. Với mỗi booking hoàn thành, tìm service tương ứng trong services array
5. Tính thu nhập = tổng price của các service đã hoàn thành
6. Trả lời chi tiết với số liệu cụ thể

Nếu câu hỏi về booking/appointment/artist cụ thể:
- Tìm trong schedule theo ID, ngày, hoặc thông tin khác
- Trả lời chi tiết về booking đó

Nếu câu hỏi về một item cụ thể khác, hãy tìm và trả lời chi tiết.

Nếu không tìm thấy thông tin cụ thể, hãy trả lời dựa trên dữ liệu có sẵn và giải thích rõ ràng.` 
          },
        ];
      } else {
        // Thử function call trước để xem có cần lấy dữ liệu từ API không
        try {
          const funcRes = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              messages: [{ role: "user", content: userInput }],
              functions: [
                { name: "getAppointment", description: "Lấy thông tin giao dịch", parameters: { type: "object", properties: {} } },
                { name: "getArtistList", description: "Lấy thông tin danh sách các artist", parameters: { type: "object", properties: {} } },
                { name: "getTotalArtist", description: "Thống kê số lượng artist", parameters: { type: "object", properties: {} } },
                { name: "getBestArtist", description: "Lấy top 5 artist được book nhiều nhất", parameters: { type: "object", properties: {} } },
                { name: "getBestService", description: "Top 5 service được đánh giá cao", parameters: { type: "object", properties: {} } },
                { name: "getBookingStatistics", description: "Thống kê số lượng booking theo tháng", parameters: { type: "object", properties: {} } },
                { name: "getRevenue", description: "Thống kê doanh thu theo tháng", parameters: { type: "object", properties: {} } },
                { name: "getReview", description: "Danh sách feedback", parameters: { type: "object", properties: {} } },
                { name: "getCustomerList", description: "Thông tin khách hàng", parameters: { type: "object", properties: {} } },
                { name: "getTotalCustomer", description: "Thống kê số lượng khách hàng", parameters: { type: "object", properties: {} } },
              ],
              function_call: "auto",
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          const fnCall = funcRes.data.choices[0]?.message?.function_call;
          const fnName = fnCall?.name || "";

          if (fnName) {
            // Có function call, cần lấy dữ liệu từ API
            const endpointMap: Record<string, string> = {
              getAppointment: userRole === "admin" ? "http://localhost:3001/totalAppointment" : "",
              getArtistList: ["admin", "guest", "customer", "artist"].includes(userRole) ? "http://localhost:3001/artistList" : "",
              getTotalArtist: userRole === "admin" ? "/api/totalArtist.json" : "",
              getBestArtist: userRole === "admin" ? "/api/bestArtist.json" : "",
              getBestService: userRole === "admin" ? "/api/bestService.json" : "",
              getBookingStatistics: userRole === "admin" ? "/api/totalBooking.json" : "",
              getRevenue: userRole === "admin" ? "/api/totalRevenue.json" : "",
              getReview: ["admin", "artist"].includes(userRole) ? "/api/totalReview.json" : "",
              getCustomerList: userRole === "admin" ? "/api/customerList.json" : "",
              getTotalCustomer: userRole === "admin" ? "/api/totalCustomer.json" : "",
            };

            const endpoint = endpointMap[fnName];

            if (!endpoint) {
              dispatch(addAssistantMessage({
                role: "assistant",
                content: "Bạn không có quyền truy cập chức năng này.",
              }));
              return;
            }

            const apiResponse = await axios.get(endpoint);
            const apiData = apiResponse.data;

            // Debug: Log dữ liệu để kiểm tra
            console.log("Function Call API Response:", apiData);
            console.log("Function Call API Data length:", JSON.stringify(apiData).length);

            // Xử lý dữ liệu để đảm bảo lấy đầy đủ
            let processedData = apiData;
            
            // Nếu là array, giới hạn số lượng item để tránh quá dài
            if (Array.isArray(apiData)) {
              if (apiData.length > 100) { // Tăng lên 100 items
                processedData = {
                  total: apiData.length,
                  data: apiData.slice(0, 100),
                  message: `Hiển thị ${100} kết quả đầu tiên trong tổng số ${apiData.length} kết quả.`
                };
              }
            }

            const finalDataString = JSON.stringify(processedData).slice(0, 15000);
            console.log("Function Call Final data string length:", finalDataString.length);

            finalMessages = [
              systemPrompt,
              {
                role: "function",
                name: fnName,
                content: finalDataString, // Tăng giới hạn lên 15000 ký tự
              },
              { 
                role: "user", 
                content: `Dựa trên dữ liệu trên, hãy trả lời câu hỏi: ${userInput}. 

CẤU TRÚC DỮ LIỆU:
- Mỗi artist có: id, nameArtist, services[], schedule[]
- services[]: chứa các dịch vụ với name, price, status
- schedule[]: chứa các booking với service, date, status (0=chờ, 1=đang làm, 2=hoàn thành)

Nếu câu hỏi về thu nhập của artist:
1. Tìm artist theo nameArtist trong danh sách
2. Xem schedule của artist đó
3. Lọc các booking có status = 2 (hoàn thành)
4. Với mỗi booking hoàn thành, tìm service tương ứng trong services array
5. Tính thu nhập = tổng price của các service đã hoàn thành
6. Trả lời chi tiết với số liệu cụ thể

Nếu câu hỏi về booking/appointment cụ thể:
- Tìm trong schedule theo ID, ngày, hoặc thông tin khác
- Trả lời chi tiết về booking đó

Nếu câu hỏi về một item cụ thể khác, hãy tìm và trả lời chi tiết.

Nếu không tìm thấy thông tin cụ thể, hãy trả lời dựa trên dữ liệu có sẵn và giải thích rõ ràng.` 
              },
            ];
          } else {
            // Không có function call, sử dụng ChatGPT với system prompt cho câu hỏi chung
            finalMessages = [systemPrompt, { role: "user", content: userInput }];
          }
        } catch (error) {
          // Nếu function call lỗi, fallback về ChatGPT với system prompt
          finalMessages = [systemPrompt, { role: "user", content: userInput }];
        }
      }

      const gptRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: finalMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const finalReply = gptRes.data.choices[0]?.message?.content;

      dispatch(addAssistantMessage({
        role: "assistant",
        content: finalReply?.trim() || "Xin lỗi, tôi chưa thể hiểu câu hỏi.",
      }));
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      dispatch(addAssistantMessage({
        role: "assistant",
        content: "Đã xảy ra lỗi trong quá trình xử lý câu hỏi. Vui lòng thử lại sau.",
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };
