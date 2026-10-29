package com.edtech.crm.controller;

import com.edtech.crm.dto.AdminDto;
import com.edtech.crm.dto.ApiResponse;
import com.edtech.crm.dto.LoginRequest;
import com.edtech.crm.dto.LoginResponse;
import com.edtech.crm.entity.Admin;
import com.edtech.crm.repository.AdminRepository;
import com.edtech.crm.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    public AuthController(AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Admin Login using custom JWT-based authentication
     * Route: POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail().trim().toLowerCase();

        Admin admin = adminRepository.findByEmailIgnoreCase(email)
                .orElse(null);

        if (admin == null || !passwordEncoder.matches(loginRequest.getPassword(), admin.getPasswordHash())) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("success", false);
            errorRes.put("error", "Invalid credentials");
            errorRes.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorRes);
        }

        // Generate custom JWT token
        String token = jwtTokenProvider.generateToken(admin);

        AdminDto adminDto = new AdminDto(admin.getId(), admin.getName(), admin.getEmail(), admin.getRole());
        LoginResponse response = new LoginResponse("Login successful", token, adminDto);

        return ResponseEntity.ok(response);
    }

    /**
     * Get Current Authenticated Admin Profile
     * Route: GET /api/auth/me (Protected)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Unauthenticated session"));
        }

        String email = auth.getName();
        Admin admin = adminRepository.findByEmailIgnoreCase(email).orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Admin not found"));
        }

        AdminDto adminDto = new AdminDto(admin.getId(), admin.getName(), admin.getEmail(), admin.getRole());
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved", adminDto));
    }

    /**
     * System and Database status
     * Route: GET /api/auth/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean isPostgres = datasourceUrl != null && datasourceUrl.contains("postgresql");
        String provider = isPostgres ? "Supabase PostgreSQL" : "Interactive Demo Database (H2 PostgreSQL-Mode)";

        Map<String, Object> dbInfo = new HashMap<>();
        dbInfo.put("provider", provider);
        dbInfo.put("mode", isPostgres ? "supabase-postgres" : "h2-postgres-compatible");
        dbInfo.put("connected", true);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("system", "EdTech CRM & Inquiry System (Java Spring Boot)");
        response.put("database", dbInfo);

        return ResponseEntity.ok(response);
    }
}
