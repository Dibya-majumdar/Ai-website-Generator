package com.TrueCoders.aiwebgen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


@Component
@RequiredArgsConstructor
public class jwtAuthenticationFilter
        extends OncePerRequestFilter {


    private final jwtService jwtService;

    private final customUserDetailsService customUserDetailsService;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {



        // ========================================================
        // LOGIN DOES NOT NEED JWT
        // ========================================================

        if (request.getServletPath().equals("/api/users/login")) {

            filterChain.doFilter(request, response);

            return;
        }

        // ========================================================
        // 1. GET AUTHORIZATION HEADER
        // ========================================================

        String authorizationHeader =
                request.getHeader("Authorization");


        // ========================================================
        // 2. CHECK HEADER
        // ========================================================

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // ========================================================
        // 3. EXTRACT TOKEN
        // ========================================================

        String token =
                authorizationHeader.substring(7);


        try {

            // ====================================================
            // 4. EXTRACT USER ID FROM JWT
            // ====================================================

            String userId =
                    jwtService.extractUserId(token);


            // ====================================================
            // 5. CHECK USER IS NOT ALREADY AUTHENTICATED
            // ====================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {


                // ================================================
                // 6. LOAD USER FROM DATABASE
                // ================================================

                UserDetails userDetails =
                        customUserDetailsService
                                .loadUserByUsername(userId);


                // ================================================
                // 7. VALIDATE TOKEN
                // ================================================

                if (jwtService.validateToken(
                        token,
                        userDetails
                )) {


                    // ============================================
                    // 8. CREATE AUTHENTICATION OBJECT
                    // ============================================

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    // ============================================
                    // 9. ADD REQUEST DETAILS
                    // ============================================

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );


                    // ============================================
                    // 10. PUT AUTHENTICATION INTO SECURITY CONTEXT
                    // ============================================

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (Exception e) {

            e.printStackTrace();
        }


        // ========================================================
        // 11. CONTINUE REQUEST
        // ========================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}