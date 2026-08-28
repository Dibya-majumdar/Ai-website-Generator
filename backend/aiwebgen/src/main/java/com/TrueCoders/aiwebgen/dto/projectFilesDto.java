package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class projectFilesDto {

    private String path;

    private String content;

    private String language;

    private String version;

    private String projectId;
}