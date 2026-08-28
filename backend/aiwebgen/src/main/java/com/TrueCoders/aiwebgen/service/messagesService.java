package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.Repository.messagesRepository;
import com.TrueCoders.aiwebgen.Repository.projectsRepository;
import com.TrueCoders.aiwebgen.dto.getMessagesDto;
import com.TrueCoders.aiwebgen.dto.messagesDto;
import com.TrueCoders.aiwebgen.entity.messages;
import com.TrueCoders.aiwebgen.entity.projects;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class messagesService {

    private final messagesRepository messagesRepository;
    private final projectsRepository projectsRepository;


    // =========================================================
    // SAVE MESSAGE
    // =========================================================

    public String addMessage(messagesDto messagesDto) {

        // Generate message ID
        String messageId = UUID.randomUUID().toString();

        // Find project
        projects project = projectsRepository.findById(messagesDto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Create entity
        messages message = new messages();

        // DTO -> Entity
        message.setMessageId(messageId);
        message.setRole(messagesDto.getRole());
        message.setContext(messagesDto.getContext());

        // Connect message with project
        message.setProjects(project);

        // Save
        messagesRepository.save(message);

        return "Message added successfully";
    }


    // =========================================================
    // GET ONE MESSAGE
    // =========================================================

    public getMessagesDto getMessage(String messageId) {

        messages message = messagesRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Entity -> DTO
        getMessagesDto result = new getMessagesDto();

        result.setMessageId(message.getMessageId());
        result.setRole(message.getRole());
        result.setContext(message.getContext());
        result.setProjectId(message.getProjects().getProjectId());

        return result;
    }


    // =========================================================
    // GET ALL MESSAGES OF ONE PROJECT
    // =========================================================

    public List<getMessagesDto> getMessagesByProject(String projectId) {

        // Get all messages belonging to this project
        List<messages> messagesList =
                messagesRepository.findByProjects_ProjectId(projectId);

        // DTO list
        List<getMessagesDto> result = new ArrayList<>();

        // Entity -> DTO
        for (messages message : messagesList) {

            getMessagesDto dto = new getMessagesDto();

            dto.setMessageId(message.getMessageId());
            dto.setRole(message.getRole());
            dto.setContext(message.getContext());
            dto.setProjectId(message.getProjects().getProjectId());

            result.add(dto);
        }

        return result;
    }
}