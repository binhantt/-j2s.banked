package com.example.bankend_hovan_J2.presentation.chat;

import com.example.bankend_hovan_J2.application.chat.CreateConversationUseCase;
import com.example.bankend_hovan_J2.application.chat.SendMessageUseCase;
import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.presentation.chat.dto.ConversationDTO;
import com.example.bankend_hovan_J2.presentation.chat.dto.ConversationUserSummaryDTO;
import com.example.bankend_hovan_J2.presentation.chat.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CreateConversationUseCase createConversationUseCase;
    private final SendMessageUseCase sendMessageUseCase;
    private final UserRepository userRepository;

    private ConversationDTO mapToDTO(Conversation conv) {
        ConversationDTO.ConversationDTOBuilder builder = ConversationDTO.builder()
                .id(conv.getId())
                .hrId(conv.getHrId())
                .jobSeekerId(conv.getJobSeekerId())
                .jobPostingId(conv.getJobPostingId())
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt());

        userRepository.findById(conv.getHrId()).ifPresent(hr ->
            builder.hr(ConversationUserSummaryDTO.builder()
                .id(hr.getId())
                .name(hr.getName())
                .avatarUrl(hr.getAvatarUrl())
                .build())
        );

        userRepository.findById(conv.getJobSeekerId()).ifPresent(js ->
            builder.jobSeeker(ConversationUserSummaryDTO.builder()
                .id(js.getId())
                .name(js.getName())
                .avatarUrl(js.getAvatarUrl())
                .build())
        );

        return builder.build();
    }

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

    @PostMapping("/conversations")
    public ResponseEntity<Conversation> createConversation(@RequestBody Map<String, Object> request) {
        Long hrId = Long.valueOf(request.get("hrId").toString());
        Long jobSeekerId = Long.valueOf(request.get("jobSeekerId").toString());
        Long jobPostingId = request.get("jobPostingId") != null
            ? Long.valueOf(request.get("jobPostingId").toString())
            : null;

        Conversation conversation = Conversation.builder()
                .hrId(hrId)
                .jobSeekerId(jobSeekerId)
                .jobPostingId(jobPostingId)
                .build();

        Conversation saved = createConversationUseCase.execute(conversation);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/conversations/hr/{hrId}")
    public ResponseEntity<PagedResponse<ConversationDTO>> getHRConversations(
            @PathVariable Long hrId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<ConversationDTO> dtoPage = conversationRepository.findByHrId(hrId, pageable).map(this::mapToDTO);
        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    @GetMapping("/conversations/job-seeker/{jobSeekerId}")
    public ResponseEntity<PagedResponse<ConversationDTO>> getJobSeekerConversations(
            @PathVariable Long jobSeekerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<ConversationDTO> dtoPage = conversationRepository.findByJobSeekerId(jobSeekerId, pageable).map(this::mapToDTO);
        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    @GetMapping("/conversations/all")
    public ResponseEntity<PagedResponse<ConversationDTO>> getAllConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<ConversationDTO> dtoPage = conversationRepository.findAll(pageable).map(this::mapToDTO);
        return ResponseEntity.ok(buildPagedResponse(dtoPage));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<PagedResponse<ChatMessage>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<ChatMessage> messagePage = messageRepository.findByConversationId(conversationId,
                PageRequest.of(page, size, sort));
        return ResponseEntity.ok(buildPagedResponse(messagePage));
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> request) {
        ChatMessage.ChatMessageBuilder builder = ChatMessage.builder()
                .conversationId(Long.valueOf(request.get("conversationId").toString()))
                .senderId(Long.valueOf(request.get("senderId").toString()))
                .senderType(request.get("senderType").toString())
                .message(request.get("message").toString());

        if (request.containsKey("replyToMessageId") && request.get("replyToMessageId") != null) {
            Long replyToMessageId = Long.valueOf(request.get("replyToMessageId").toString());
            builder.replyToMessageId(replyToMessageId);

            messageRepository.findByConversationId(Long.valueOf(request.get("conversationId").toString()))
                    .stream()
                    .filter(m -> m.getId().equals(replyToMessageId))
                    .findFirst()
                    .ifPresent(originalMsg -> builder.replyToMessage(originalMsg.getMessage()));
        }

        ChatMessage message = builder.build();
        ChatMessage saved = sendMessageUseCase.execute(message);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/messages/read/{conversationId}/{userId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long conversationId, @PathVariable Long userId) {
        messageRepository.markAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/{conversationId}/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long conversationId, @PathVariable Long userId) {
        Long count = messageRepository.countUnread(conversationId, userId);
        return ResponseEntity.ok(count);
    }
}
