package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class aiResponseDto {

    private String message;

    private String operation;

    private List<aiFileDto> files = new ArrayList<>();
}