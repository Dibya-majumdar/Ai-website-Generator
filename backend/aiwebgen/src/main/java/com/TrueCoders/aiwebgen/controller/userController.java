package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.getUserDetailsDto;
import com.TrueCoders.aiwebgen.dto.loginRequestDto;
import com.TrueCoders.aiwebgen.dto.loginResponseDto;
import com.TrueCoders.aiwebgen.dto.userDto;
import com.TrueCoders.aiwebgen.service.userService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class userController {

    private final userService userService;


    // ============================================================
    // SIGN UP
    // ============================================================

    @PostMapping
    public ResponseEntity<String> addUser(
            @RequestBody userDto userDto
    ) {

        return ResponseEntity.ok(
                userService.addUser(userDto)
        );
    }


    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<loginResponseDto> login(
            @RequestBody loginRequestDto request
    ) {
        System.out.println("LOGIN CONTROLLER CALLED");
        loginResponseDto response =
                userService.login(
                        request.getEmailId(),
                        request.getPassword()
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET USER
    // ============================================================

    @GetMapping("/{userId}")
    public ResponseEntity<getUserDetailsDto> getUser(
            @PathVariable String userId
    ) {

        getUserDetailsDto result =
                userService.getUser(userId);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }
}