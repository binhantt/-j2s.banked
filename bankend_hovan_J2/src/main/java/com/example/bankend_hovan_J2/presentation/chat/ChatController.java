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

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CreateConversationUseCase createConversationUseCase;
    private final SendMessageUseCase sendMessageUseCase;

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
    public ResponseEntity<List<Conversation>> getHRConversations(@PathVariable Long hrId) {
        List<Conversation> conversations = conversationRepository.findByHrId(hrId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<Conversation>> getJobSeekerConversations(@PathVariable Long jobSeekerId) {
        List<Conversation> conversations = conversationRepository.findByJobSeekerId(jobSeekerId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/all")
    public ResponseEntity<List<Conversation>> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAll();
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long conversationId) {
        List<ChatMessage> messages = messageRepository.findByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> request) {
        ChatMessage message = ChatMessage.builder()
                .conversationId(Long.valueOf(request.get("conversationId").toString()))
                .senderId(Long.valueOf(request.get("senderId").toString()))
                .senderType(request.get("senderType").toString())
                .message(request.get("message").toString())
                .build();

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
