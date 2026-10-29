package com.edtech.crm.repository;

import com.edtech.crm.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    Optional<Admin> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
