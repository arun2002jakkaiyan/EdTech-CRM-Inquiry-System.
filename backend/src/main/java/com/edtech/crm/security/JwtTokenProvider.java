package com.edtech.crm.security;

import com.edtech.crm.entity.Admin;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:604800000}") long expirationMs) {
        // Ensure secret key is at least 32 bytes (256 bits) for HMAC-SHA256
        String paddedSecret = secret;
        if (paddedSecret.length() < 32) {
            paddedSecret = String.format("%-32s", paddedSecret).replace(' ', 'k');
        }
        this.secretKey = Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Admin admin) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("id", admin.getId().toString());
        claims.put("name", admin.getName());
        claims.put("email", admin.getEmail());
        claims.put("role", admin.getRole());

        return Jwts.builder()
                .claims(claims)
                .subject(admin.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
            return false;
        }
    }
}
