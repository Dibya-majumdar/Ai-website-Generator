package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class getMessagesDto {

    private String messageId;

    private roleType role;

    private String context;

    private String projectId;
}