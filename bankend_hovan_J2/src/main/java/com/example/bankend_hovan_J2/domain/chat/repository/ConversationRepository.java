package com.example.bankend_hovan_J2.domain.chat.repository;

import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository {
    Conversation save(Conversation conversation);
    Optional<Conversation> findById(Long id);
    Optional<Conversation> findByHrAndJobSeekerAndJobPosting(Long hrId, Long jobSeekerId, Long jobPostingId);
    List<Conversation> findByHrId(Long hrId);
    List<Conversation> findByJobSeekerId(Long jobSeekerId);
    List<Conversation> findAll();
}
