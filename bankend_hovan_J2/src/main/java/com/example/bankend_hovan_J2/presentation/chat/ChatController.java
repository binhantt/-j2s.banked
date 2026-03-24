package com.example.bankend_hovan_J2.presentation.chat;

import com.example.bankend_hovan_J2.application.chat.CreateConversationUseCase;
import com.example.bankend_hovan_J2.application.chat.SendMessageUseCase;
import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.presentation.chat.dto.ConversationDTO;
import com.example.bankend_hovan_J2.presentation.chat.dto.ConversationUserSummaryDTO;

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
    public ResponseEntity<List<ConversationDTO>> getHRConversations(@PathVariable Long hrId) {
        List<ConversationDTO> conversations = conversationRepository.findByHrId(hrId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<ConversationDTO>> getJobSeekerConversations(@PathVariable Long jobSeekerId) {
        List<ConversationDTO> conversations = conversationRepository.findByJobSeekerId(jobSeekerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/all")
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
        List<ConversationDTO> conversations = conversationRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long conversationId) {
        List<ChatMessage> messages = messageRepository.findByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> request) {
        ChatMessage.ChatMessageBuilder builder = ChatMessage.builder()
                .conversationId(Long.valueOf(request.get("conversationId").toString()))
                .senderId(Long.valueOf(request.get("senderId").toString()))
                .senderType(request.get("senderType").toString())
                .message(request.get("message").toString());

        // Handle reply
        if (request.containsKey("replyToMessageId") && request.get("replyToMessageId") != null) {
            Long replyToMessageId = Long.valueOf(request.get("replyToMessageId").toString());
            builder.replyToMessageId(replyToMessageId);
            
            // Get the original message content
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
