package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.aiRequestDto;
import com.TrueCoders.aiwebgen.dto.aiResponseDto;
import com.TrueCoders.aiwebgen.service.aiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class aiController {

    private final aiService aiService;


    @PostMapping("/ask")
    public ResponseEntity<aiResponseDto> askAi(
            @RequestBody aiRequestDto request
    ) {

        aiResponseDto response =
                aiService.askAi(
                        request.getPrompt(),
                        request.getUserId(),
                        request.getProjectId()
                );

        return ResponseEntity.ok(response);
    }
}
