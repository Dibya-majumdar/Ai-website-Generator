package com.TrueCoders.aiwebgen.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class jwtService {

    @Value("${jwt.secret}")
    private String secretKey;


    // ============================================================
    // CREATE SECRET KEY
    // ============================================================

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(secretKey);

        return Keys.hmacShaKeyFor(keyBytes);
    }


    // ============================================================
    // GENERATE JWT
    // ============================================================

    public String generateToken(String userId) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime() + 1000L * 60 * 60 * 24
                );

        return Jwts.builder()

                .subject(userId)

                .issuedAt(now)

                .expiration(expiration)

                .signWith(getSigningKey())

                .compact();
    }


    // ============================================================
    // EXTRACT USER ID
    // ============================================================

    public String extractUserId(String token) {

        Claims claims =
                Jwts.parser()

                        .verifyWith(getSigningKey())

                        .build()

                        .parseSignedClaims(token)

                        .getPayload();

        return claims.getSubject();
    }


    // ============================================================
    // VALIDATE TOKEN
    // ============================================================

    public boolean validateToken(
            String token,
            UserDetails userDetails
    ) {

        try {

            String userId =
                    extractUserId(token);

            return userId.equals(
                    userDetails.getUsername()
            );

        } catch (JwtException |
                 IllegalArgumentException e) {

            return false;
        }
    }
}