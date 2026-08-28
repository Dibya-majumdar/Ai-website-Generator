package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.Repository.messagesRepository;
import com.TrueCoders.aiwebgen.Repository.projectFilesRepository;
import com.TrueCoders.aiwebgen.Repository.projectsRepository;

import com.TrueCoders.aiwebgen.dto.aiFileDto;
import com.TrueCoders.aiwebgen.dto.aiResponseDto;
import com.TrueCoders.aiwebgen.dto.roleType;

import com.TrueCoders.aiwebgen.entity.messages;
import com.TrueCoders.aiwebgen.entity.projectFiles;
import com.TrueCoders.aiwebgen.entity.projects;

import lombok.RequiredArgsConstructor;

import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.ai.document.Document;
//import org.springframework.ai.vectorstore.SearchRequest;
//import org.springframework.ai.vectorstore.VectorStore;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class aiService {

    private final ChatClient chatClient;

    private final messagesRepository messagesRepository;

    private final projectsRepository projectsRepository;

    private final projectFilesRepository projectFilesRepository;
// RAG will be added later
//    private final VectorStore vectorStore;


    // ============================================================
    // ASK AI
    // ============================================================

    public aiResponseDto askAi(
            String prompt,
            String userId,
            String projectId
    ) {

        // ========================================================
        // 1. FIND PROJECT
        // ========================================================

        projects project = projectsRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found")
                );


        // ========================================================
        // 2. CHECK PROJECT BELONGS TO USER
        // ========================================================

        if (!project.getUser()
                .getUserid()
                .equals(userId)) {

            throw new RuntimeException(
                    "You do not have access to this project"
            );
        }


        // ========================================================
        // 3. GET LAST 10 MESSAGES
        // ========================================================

        List<messages> recentMessages =
                messagesRepository
                        .findTop10ByProjects_ProjectIdOrderByCreatedAtDesc(
                                projectId
                        );


        /*
         * Database gives newest -> oldest.
         *
         * Example:
         *
         * newest
         *   ↓
         * message 10
         * message 9
         * message 8
         * ...
         * message 1
         *
         * LLM should receive them in normal conversation order.
         *
         * So reverse them.
         */

        Collections.reverse(recentMessages);


        String shortTermMemory =
                recentMessages.stream()
                        .map(message ->
                                message.getRole()
                                        + ": "
                                        + message.getContext()
                        )
                        .collect(Collectors.joining("\n"));


        // ========================================================
        // 4. LONG-TERM MEMORY FROM PGVECTOR
        // ========================================================

//        List<Document> similarDocuments =
//                vectorStore.similaritySearch(
//                        SearchRequest.builder()
//                                .query(prompt)
//                                .topK(5)
//                                .similarityThreshold(0.70)
//                                .filterExpression(
//                                        "projectId == '" +
//                                                projectId +
//                                                "'"
//                                )
//                                .build()
//                );
//
//
//        String longTermMemory =
//                similarDocuments.stream()
//                        .map(Document::getText)
//                        .collect(Collectors.joining("\n"));
//

        // ========================================================
        // 5. GET CURRENT PROJECT FILES
        // ========================================================

        List<projectFiles> projectFilesList =
                projectFilesRepository
                        .findByProjects_ProjectId(projectId);


        String currentProjectFiles =
                projectFilesList.stream()
                        .map(file ->
                                """
                                FILE PATH:
                                %s
                                
                                LANGUAGE:
                                %s
                                
                                CONTENT:
                                %s
                                
                                --------------------------------
                                """
                                        .formatted(
                                                file.getPath(),
                                                file.getLanguage(),
                                                file.getContent()
                                        )
                        )
                        .collect(Collectors.joining("\n"));


        // ========================================================
        // 6. BUILD CONTEXT FOR AI
        // ========================================================

        // ========================================================
// 5. BUILD CONTEXT FOR AI
// ========================================================

        String userContext = """

        ================================
        CURRENT PROJECT
        ================================

        Project ID:
        %s

        Project Name:
        %s


        ================================
        SHORT TERM MEMORY
        ================================

        %s


        ================================
        CURRENT PROJECT FILES
        ================================

        %s


        ================================
        CURRENT USER REQUEST
        ================================

        %s

        """.formatted(
                projectId,
                project.getProjectName(),
                shortTermMemory,
                currentProjectFiles,
                prompt
        );

        // ========================================================
        // 7. CALL GROQ LLM
        // ========================================================
        System.out.println("========================================");
        System.out.println("CALLING LLM");
        System.out.println("========================================");

        aiResponseDto aiResponse =
                chatClient
                        .prompt()
                        .user(userContext)
                        .call()
                        .entity(aiResponseDto.class);
        System.out.println();
        System.out.println("========================================");
        System.out.println("AI DTO RESPONSE");
        System.out.println("========================================");

        System.out.println(aiResponse);

        System.out.println("========================================");

        // ========================================================
        // 8. SAVE USER MESSAGE
        // ========================================================

        messages userMessage = new messages();

        userMessage.setMessageId(
                UUID.randomUUID().toString()
        );

        userMessage.setRole(
                roleType.USER
        );

        userMessage.setContext(
                prompt
        );

        userMessage.setProjects(
                project
        );

        messagesRepository.save(
                userMessage
        );


        // ========================================================
        // 9. SAVE ASSISTANT MESSAGE
        // ========================================================

        messages assistantMessage = new messages();

        assistantMessage.setMessageId(
                UUID.randomUUID().toString()
        );

        assistantMessage.setRole(
                roleType.ASSISTANT
        );

        assistantMessage.setContext(
                aiResponse.getMessage()
        );

        assistantMessage.setProjects(
                project
        );

        messagesRepository.save(
                assistantMessage
        );


        // ========================================================
        // 10. STORE USER MESSAGE IN VECTOR DB
        // ========================================================

//        Document userDocument =
//                new Document(
//                        prompt,
//                        Map.of(
//                                "userId", userId,
//                                "projectId", projectId,
//                                "role", "USER"
//                        )
//                );
//
//        vectorStore.add(
//                List.of(userDocument)
//        );


        // ========================================================
        // 11. STORE ASSISTANT MESSAGE IN VECTOR DB
        // ========================================================

//        if (aiResponse.getMessage() != null &&
//                !aiResponse.getMessage().isBlank()) {
//
//            Document assistantDocument =
//                    new Document(
//                            aiResponse.getMessage(),
//                            Map.of(
//                                    "userId", userId,
//                                    "projectId", projectId,
//                                    "role", "ASSISTANT"
//                            )
//                    );
//
//            vectorStore.add(
//                    List.of(assistantDocument)
//            );
//        }


        // ========================================================
        // 12. SAVE / UPDATE GENERATED FILES
        // ========================================================

        if (aiResponse.getFiles() != null) {

            for (aiFileDto fileDto :
                    aiResponse.getFiles()) {


                // ----------------------------------------------
                // Validate file
                // ----------------------------------------------

                if (fileDto.getPath() == null ||
                        fileDto.getPath().isBlank()) {

                    continue;
                }

                if (fileDto.getContent() == null) {

                    continue;
                }


                // ----------------------------------------------
                // Check if file already exists
                // ----------------------------------------------

                projectFiles existingFile =
                        projectFilesRepository
                                .findByProjects_ProjectIdAndPath(
                                        projectId,
                                        fileDto.getPath()
                                )
                                .orElse(null);


                // ==============================================
                // FILE DOES NOT EXIST
                // ==============================================

                if (existingFile == null) {

                    projectFiles newFile =
                            new projectFiles();

                    newFile.setProjectFilesId(
                            UUID.randomUUID().toString()
                    );

                    newFile.setPath(
                            fileDto.getPath()
                    );

                    newFile.setContent(
                            fileDto.getContent()
                    );

                    newFile.setLanguage(
                            fileDto.getLanguage()
                    );

                    newFile.setVersion(
                            "1"
                    );

                    newFile.setProjects(
                            project
                    );

                    projectFilesRepository.save(
                            newFile
                    );
                }


                // ==============================================
                // FILE ALREADY EXISTS
                // ==============================================

                else {

                    existingFile.setContent(
                            fileDto.getContent()
                    );

                    existingFile.setLanguage(
                            fileDto.getLanguage()
                    );


                    // ------------------------------------------
                    // Increase version
                    // ------------------------------------------

                    int currentVersion = 1;

                    try {

                        currentVersion =
                                Integer.parseInt(
                                        existingFile.getVersion()
                                );

                    } catch (Exception ignored) {

                        // Keep version = 1
                    }


                    existingFile.setVersion(
                            String.valueOf(
                                    currentVersion + 1
                            )
                    );


                    projectFilesRepository.save(
                            existingFile
                    );
                }
            }
        }


        // ========================================================
        // 13. RETURN AI RESPONSE
        // ========================================================

        return aiResponse;
    }
}