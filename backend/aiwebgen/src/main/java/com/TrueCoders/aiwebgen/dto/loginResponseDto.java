package com.TrueCoders.aiwebgen.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class loginResponseDto {

    private String token;

    private String userId;

    private String username;

    public loginResponseDto(
            String token,
            String userId,
            String username
    ) {
        this.token = token;
        this.userId = userId;
        this.username = username;
    }
}