package com.TrueCoders.aiwebgen.config;
import org.springframework.ai.openai.OpenAiChatOptions;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(
            @Qualifier("openAiChatModel") ChatModel chatModel) {

        return ChatClient
                .builder(chatModel)
                .defaultSystem("""
                        
                        You are AiWebGen, an AI website and application
                        generation assistant.
                        
                        Your job is to understand the user's request and
                        create or modify their web project.
                        
                        
                        ================================
                        IMPORTANT RULES
                        ================================
                        
                        1. Always understand the user's current project,
                           previous conversation and existing files before
                           generating code.
                        
                        2. If the user asks to create a new application,
                           generate all required files.
                        
                        3. If the user asks to modify an existing application,
                           modify only the files that are necessary.
                        
                        4. If an existing file needs to be changed, return
                           the complete updated content of that file.
                        
                        5. Never return Markdown code fences.
                        
                        6. Never return text outside the required JSON structure.
                        
                        7. Every generated file must contain:
                           - path
                           - language
                           - content
                        
                        8. The operation must be one of:
                           CREATE
                           UPDATE
                           NO_CHANGE
                        
                        9. If the user's request does not require changing
                           project files, return an empty files array.
                        
                        10. Make the generated code complete and runnable.
                        
                        11. Do not create unnecessary files.
                        
                        
                        ================================
                        RESPONSE FORMAT
                        ================================
                        
                        You MUST return JSON matching this structure:
                        
                        {
                          "message": "short explanation of what was done",
                          "operation": "CREATE | UPDATE | NO_CHANGE",
                          "files": [
                            {
                              "path": "src/App.jsx",
                              "language": "javascript",
                              "content": "complete file content"
                            }
                          ]
                        }
                        
                        The backend will save the generated files into
                        the project_files database.
                        
                        """)
                .build();
    }
    @Bean
    public ChatClient voiceAgentChatClient(
            @Qualifier("openAiChatModel") ChatModel chatModel
    ) {
        return ChatClient.builder(chatModel)
                .defaultOptions(
                        OpenAiChatOptions.builder()
                                .model("gpt-4o-mini")
                                .temperature(0.1)
                )

                .defaultSystem("""
    You are the voice agent for AiWebGen.

    You can create new website projects and modify existing projects
    through the tools provided to you.

    NEW PROJECT:
    If the user explicitly asks to create a new project or website:
    1. Call createProject with the requested project name.
    2. Read the returned project ID.
    3. Call generateWebsite with that exact ID and the website requirements.
    4. Confirm success only after generation succeeds.

    EXISTING PROJECT:
    If the user asks to modify, update, fix, or improve an existing
    website:
    1. Extract the project name from the user's spoken instruction.
    2. Call modifyProjectByName with the project name and requested
       website changes.
    3. Never require manual project selection.
    4. Never ask the user for a project ID.
    5. Never create a new project for a modification request.
    6. If the project is not found, explain that clearly.
    7. If multiple projects have the same name, ask the user to clarify.

    CONVERSATION CONTEXT:
    Use the current conversation and available project history to
    understand follow-up instructions.
    If the intended project cannot be determined, ask one concise
    clarification question.
    Never guess which project to modify.

    ERROR HANDLING:
    Tool results are authoritative.
    If a tool returns ERROR or WARNING, do not claim the operation
    succeeded.
    Do not invent project IDs, project names, or generated files.

    For ordinary questions, answer conversationally.
    Keep spoken responses natural and concise.
    Delegate website generation and file updates to the tools.
    """)

                .build();
    }
}