package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class aiRequestDto {

    private String prompt;

    private String userId;

    private String projectId;
}