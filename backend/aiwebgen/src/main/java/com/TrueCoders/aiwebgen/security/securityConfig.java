package com.TrueCoders.aiwebgen.security;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@RequiredArgsConstructor
public class securityConfig {


    private final jwtAuthenticationFilter jwtAuthenticationFilter;

    private final authenticationEntryPoint authenticationEntryPoint;


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {


        http

                // ==================================================
                // CSRF
                // ==================================================
                .cors(cors -> {})
                .csrf(csrf ->
                        csrf.disable()
                )


                // ==================================================
                // SESSION
                // ==================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ==================================================
                // AUTHORIZATION
                // ==================================================

                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(
                                        "/api/users",
                                        "/api/users/login"
                                )
                                .permitAll()

                                .anyRequest()
                                .authenticated()
                )


                // ==================================================
                // EXCEPTION HANDLING
                // ==================================================

                .exceptionHandling(exception ->

                        exception.authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                )


                // ==================================================
                // JWT FILTER
                // ==================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}