package com.example.bankend_hovan_J2.presentation.admin;

import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.presentation.chat.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/chat")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class AdminChatController {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    // ============================================================
    // 1. Danh sách tất cả cuộc trò chuyện (có phân trang)
    // GET /api/admin/chat/conversations?page=0&size=20
    // ============================================================
    @GetMapping("/conversations")
    public ResponseEntity<PagedResponse<Map<String, Object>>> getAllConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Conversation> conversationPage = conversationRepository.findAll(pageable);

        Page<Map<String, Object>> dtoPage = conversationPage.map(this::mapConversationToDetail);

        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    // ============================================================
    // 2. Xem lịch sử tin nhắn của 1 cuộc trò chuyện
    // GET /api/admin/chat/conversations/{conversationId}/messages?page=0&size=50
    // ============================================================
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<PagedResponse<Map<String, Object>>> getMessagesByConversation(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        // Kiểm tra conversation có tồn tại không
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Cuộc trò chuyện không tồn tại");
            return ResponseEntity.notFound().build();
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<ChatMessage> messagePage = messageRepository.findByConversationId(
                conversationId, PageRequest.of(page, size, sort));

        Page<Map<String, Object>> dtoPage = messagePage.map(this::mapMessageToDetail);

        // Trả về thêm thông tin conversation ở page đầu tiên
        Map<String, Object> result = new HashMap<>();
        result.put("conversation", mapConversationToDetail(convOpt.get()));
        result.put("messages", dtoPage);

        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    // ============================================================
    // 3. Tìm kiếm cuộc trò chuyện theo user (HR hoặc Job Seeker)
    // GET /api/admin/chat/conversations/search?userId=123&page=0&size=20
    // ============================================================
    @GetMapping("/conversations/search")
    public ResponseEntity<PagedResponse<Map<String, Object>>> searchConversations(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Conversation> resultPage;

        if (userId != null) {
            // Tìm theo userId (có thể là HR hoặc Job Seeker)
            Page<Conversation> byHr = conversationRepository.findByHrId(userId, pageable);
            Page<Conversation> byJs = conversationRepository.findByJobSeekerId(userId, pageable);

            // Merge kết quả (loại bỏ trùng lặp nếu user vừa là HR vừa là JobSeeker)
            List<Conversation> merged = byHr.getContent();
            for (Conversation conv : byJs.getContent()) {
                boolean exists = merged.stream().anyMatch(c -> c.getId().equals(conv.getId()));
                if (!exists) {
                    merged.add(conv);
                }
            }

            // Tạo Page giả từ merged list (vì merge không hỗ trợ Pageable trực tiếp)
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), merged.size());
            List<Conversation> pagedList = start < merged.size() ? merged.subList(start, end) : List.of();

            long total = merged.size();
            int totalPages = (int) Math.ceil((double) total / pageable.getPageSize());

            Page<Conversation> mergedPage = new org.springframework.data.domain.PageImpl<>(
                    pagedList, pageable, total);
            Page<Map<String, Object>> dtoPage = mergedPage.map(this::mapConversationToDetail);
            return ResponseEntity.ok(buildPagedResponse(dtoPage));
        }

        // Không có filter -> trả về tất cả
        Page<Conversation> conversationPage = conversationRepository.findAll(pageable);
        Page<Map<String, Object>> dtoPage = conversationPage.map(this::mapConversationToDetail);
        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    // ============================================================
    // Helper: Ánh xạ Conversation -> Map chi tiết cho Admin
    // ============================================================
    private Map<String, Object> mapConversationToDetail(Conversation conv) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", conv.getId());
        result.put("hrId", conv.getHrId());
        result.put("jobSeekerId", conv.getJobSeekerId());
        result.put("jobPostingId", conv.getJobPostingId());
        result.put("createdAt", conv.getCreatedAt());
        result.put("updatedAt", conv.getUpdatedAt());

        // Lấy thông tin HR
        Optional<User> hrOpt = userRepository.findById(conv.getHrId());
        if (hrOpt.isPresent()) {
            User hr = hrOpt.get();
            Map<String, Object> hrInfo = new HashMap<>();
            hrInfo.put("id", hr.getId());
            hrInfo.put("name", hr.getName());
            hrInfo.put("email", hr.getEmail());
            hrInfo.put("avatarUrl", hr.getAvatarUrl());
            hrInfo.put("userType", hr.getUserType());
            hrInfo.put("isActive", hr.getIsActive());
            result.put("hr", hrInfo);
        }

        // Lấy thông tin Job Seeker
        Optional<User> jsOpt = userRepository.findById(conv.getJobSeekerId());
        if (jsOpt.isPresent()) {
            User js = jsOpt.get();
            Map<String, Object> jsInfo = new HashMap<>();
            jsInfo.put("id", js.getId());
            jsInfo.put("name", js.getName());
            jsInfo.put("email", js.getEmail());
            jsInfo.put("avatarUrl", js.getAvatarUrl());
            jsInfo.put("userType", js.getUserType());
            jsInfo.put("isActive", js.getIsActive());
            result.put("jobSeeker", jsInfo);
        }

        // Đếm số tin nhắn chưa đọc trong cuộc trò chuyện này
        // (lấy tất cả tin nhắn rồi đếm, vì countUnread cần userId cụ thể)
        List<ChatMessage> allMessages = messageRepository.findByConversationId(conv.getId());
        long unreadCount = allMessages.stream()
                .filter(m -> m.getIsRead() == null || !m.getIsRead())
                .count();
        result.put("totalMessages", allMessages.size());
        result.put("unreadMessages", unreadCount);

        return result;
    }

    // ============================================================
    // Helper: Ánh xạ ChatMessage -> Map chi tiết cho Admin
    // ============================================================
    private Map<String, Object> mapMessageToDetail(ChatMessage message) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", message.getId());
        result.put("conversationId", message.getConversationId());
        result.put("senderId", message.getSenderId());
        result.put("senderType", message.getSenderType());
        result.put("message", message.getMessage());
        result.put("isRead", message.getIsRead() != null ? message.getIsRead() : false);
        result.put("replyToMessageId", message.getReplyToMessageId());
        result.put("replyToMessage", message.getReplyToMessage());
        result.put("createdAt", message.getCreatedAt());

        // Lấy thông tin người gửi
        Optional<User> senderOpt = userRepository.findById(message.getSenderId());
        if (senderOpt.isPresent()) {
            User sender = senderOpt.get();
            Map<String, Object> senderInfo = new HashMap<>();
            senderInfo.put("id", sender.getId());
            senderInfo.put("name", sender.getName());
            senderInfo.put("avatarUrl", sender.getAvatarUrl());
            senderInfo.put("userType", sender.getUserType());
            result.put("sender", senderInfo);
        }

        return result;
    }

    // ============================================================
    // Helper: Build PagedResponse
    // ============================================================
    private <T> PagedResponse<T> buildPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .page(page.getNumber())
                .size(page.getSize())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
