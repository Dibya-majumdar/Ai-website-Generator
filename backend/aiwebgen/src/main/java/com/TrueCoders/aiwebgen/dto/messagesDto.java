package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class messagesDto {

    private roleType role;

    private String context;

    private String projectId;
}