
package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.voiceAgentResponse;
import com.TrueCoders.aiwebgen.service.voiceAgentService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice")
public class voiceAgentController {

    private final voiceAgentService voiceAgentService;

    public voiceAgentController(
            voiceAgentService voiceAgentService
    ) {
        this.voiceAgentService = voiceAgentService;
    }

    @PostMapping(
            value = "/process",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<voiceAgentResponse> processVoice(
            @RequestParam("audio") MultipartFile audio,

            @RequestParam(
                    value = "projectId",
                    required = false
            )
            String projectId,

            @AuthenticationPrincipal UserDetails userDetails
    ) throws Exception {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        String authenticatedUserId = userDetails.getUsername();

        var result = voiceAgentService.processVoice(
                audio,
                authenticatedUserId,
                projectId
        );

        return ResponseEntity.ok(
                new voiceAgentResponse(
                        result.transcript(),
                        result.answer(),
                        result.audioBase64()
                )
        );
    }
}




//package com.TrueCoders.aiwebgen.controller;
//
//import com.TrueCoders.aiwebgen.dto.voiceAgentResponse;
//import com.TrueCoders.aiwebgen.service.voiceAgentService;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//@RestController
//@RequestMapping("/api/voice")
//public class voiceAgentController {
//
//    private final voiceAgentService voiceAgentService;
//
//    public voiceAgentController(
//            voiceAgentService voiceAgentService
//    ) {
//        this.voiceAgentService = voiceAgentService;
//    }
//
//    @PostMapping(
//            value = "/process",
//            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
//    )
//    public ResponseEntity<voiceAgentResponse> processVoice(
//            @RequestParam("audio") MultipartFile audio,
//            @RequestParam("userId") String userId,
//            @RequestParam("projectId") String projectId
//    ) throws Exception {
//
//        var result = voiceAgentService.processVoice(
//                audio,
//                userId,
//                projectId
//        );
//
//        return ResponseEntity.ok(
//                new voiceAgentResponse(
//                        result.transcript(),
//                        result.answer(),
//                        result.audioBase64()
//                )
//        );
//    }
//}
