package com.TrueCoders.aiwebgen.service;




import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.TrueCoders.aiwebgen.dto.aiResponseDto;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Service
public class voiceAgentService {

    private final RestClient openAiClient;
    private final aiService aiService;

    public voiceAgentService(
            @Value("${openai.api-key}") String apiKey,
            aiService aiService
    ) {
        this.openAiClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(
                        "Authorization",
                        "Bearer " + apiKey
                )
                .build();

        this.aiService = aiService;
    }

    // STEP 1: Convert recorded audio into text.
    public String speechToText(MultipartFile audio)
            throws IOException {

        if (audio == null || audio.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please record your voice first."
            );
        }

        if (audio.getSize() > 25L * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Audio file is too large. Maximum size is 25 MB."
            );
        }

        ByteArrayResource audioResource =
                new ByteArrayResource(audio.getBytes()) {

                    @Override
                    public String getFilename() {
                        String filename = audio.getOriginalFilename();

                        return filename != null
                                ? filename
                                : "recording.webm";
                    }
                };

        MultiValueMap<String, Object> form =
                new LinkedMultiValueMap<>();

        form.add("file", audioResource);
        form.add("model", "gpt-4o-mini-transcribe");

        TranscriptionResponse response =
                openAiClient.post()
                        .uri("/audio/transcriptions")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(form)
                        .retrieve()
                        .body(TranscriptionResponse.class);

        if (response == null
                || response.text() == null
                || response.text().isBlank()) {

            throw new IllegalStateException(
                    "Could not recognize your speech."
            );
        }

        return response.text().trim();
    }

    // STEP 2: Send the recognized prompt to AiWebGen.
    public aiResponseDto  getAiAnswer(
            String prompt,
            String userId,
            String projectId
    ) {

        /*
         * Reuse the existing website-generation service.
         *
         * This must match the signature and return type of
         * your existing aiService.askAi(...) method.
         */
        return aiService.askAi(
                prompt,
                userId,
                projectId
        );
    }

    // STEP 3: Convert the AI response into spoken audio.
    public byte[] textToSpeech(String text) {

        Map<String, Object> request = Map.of(
                "model", "gpt-4o-mini-tts",
                "voice", "alloy",
                "input", text,
                "response_format", "mp3"
        );

        byte[] audio = openAiClient.post()
                .uri("/audio/speech")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.valueOf("audio/mpeg"))
                .body(request)
                .retrieve()
                .body(byte[].class);

        if (audio == null || audio.length == 0) {
            throw new IllegalStateException(
                    "Could not generate speech."
            );
        }

        return audio;
    }

    // Full voice-agent pipeline.
    public VoiceResult processVoice(
            MultipartFile audio,
            String userId,
            String projectId
    ) throws IOException {

        String transcript = speechToText(audio);

        aiResponseDto aiResponse = getAiAnswer(
                transcript,
                userId,
                projectId
        );

// Extract the actual text from the DTO.
// Replace getMessage() with the actual getter in your DTO.
        String answer = aiResponse.getMessage();

        byte[] spokenAudio = textToSpeech(answer);

        String audioBase64 = Base64.getEncoder()
                .encodeToString(spokenAudio);

        return new VoiceResult(
                transcript,
                answer,
                audioBase64
        );
    }

    public record VoiceResult(
            String transcript,
            String answer,
            String audioBase64
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TranscriptionResponse(String text) {
    }
}

