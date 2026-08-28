package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.getMessagesDto;
import com.TrueCoders.aiwebgen.dto.messagesDto;
import com.TrueCoders.aiwebgen.service.messagesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class messagesController {

    private final messagesService messagesService;


    @PostMapping
    public ResponseEntity<String> addMessage(
            @RequestBody messagesDto messagesDto
    ) {

        return ResponseEntity.ok(
                messagesService.addMessage(
                        messagesDto
                )
        );
    }


    @GetMapping("/{messageId}")
    public ResponseEntity<getMessagesDto> getMessage(
            @PathVariable String messageId
    ) {

        return ResponseEntity.ok(
                messagesService.getMessage(
                        messageId
                )
        );
    }


    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<getMessagesDto>>
    getMessagesByProject(
            @PathVariable String projectId
    ) {

        return ResponseEntity.ok(
                messagesService.getMessagesByProject(
                        projectId
                )
        );
    }
}
