package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryImpl implements ConversationRepository {
    private final ConversationJpaRepository jpaRepository;

    @Override
    public Conversation save(Conversation conversation) {
        ConversationEntityJpa entity = toEntity(conversation);
        ConversationEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Conversation> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Conversation> findByHrAndJobSeekerAndJobPosting(Long hrId, Long jobSeekerId, Long jobPostingId) {
        return jpaRepository.findByHrIdAndJobSeekerIdAndJobPostingId(hrId, jobSeekerId, jobPostingId)
                .map(this::toDomain);
    }

    @Override
    public List<Conversation> findByHrId(Long hrId) {
        return jpaRepository.findByHrId(hrId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Conversation> findByJobSeekerId(Long jobSeekerId) {
        return jpaRepository.findByJobSeekerId(jobSeekerId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Conversation> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private ConversationEntityJpa toEntity(Conversation conversation) {
        return ConversationEntityJpa.builder()
                .id(conversation.getId())
                .hrId(conversation.getHrId())
                .jobSeekerId(conversation.getJobSeekerId())
                .jobPostingId(conversation.getJobPostingId())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    private Conversation toDomain(ConversationEntityJpa entity) {
        return Conversation.builder()
                .id(entity.getId())
                .hrId(entity.getHrId())
                .jobSeekerId(entity.getJobSeekerId())
                .jobPostingId(entity.getJobPostingId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
