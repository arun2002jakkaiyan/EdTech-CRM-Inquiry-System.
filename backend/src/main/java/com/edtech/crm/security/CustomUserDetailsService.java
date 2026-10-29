package com.edtech.crm.security;

import com.edtech.crm.entity.Admin;
import com.edtech.crm.repository.AdminRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    public CustomUserDetailsService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + email));

        String role = admin.getRole() != null ? admin.getRole().toUpperCase() : "ADMIN";
        return new User(
                admin.getEmail(),
                admin.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}
