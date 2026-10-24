
package com.TrueCoders.aiwebgen.dto;

public record voiceAgentResponse(
        String transcript,
        String answer,
        String audioBase64
) {
}

