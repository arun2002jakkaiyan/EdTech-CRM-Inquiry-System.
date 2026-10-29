package com.edtech.crm.repository;

import com.edtech.crm.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {

    @Query("SELECT i FROM Inquiry i WHERE " +
           "(:category IS NULL OR :category = '' OR :category = 'All' OR LOWER(i.category) = LOWER(:category)) AND " +
           "(:userType IS NULL OR :userType = '' OR :userType = 'All' OR LOWER(i.userType) = LOWER(:userType)) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR LOWER(i.status) = LOWER(:status)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(i.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(i.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.createdAt DESC")
    List<Inquiry> findWithFilters(
            @Param("category") String category,
            @Param("userType") String userType,
            @Param("status") String status,
            @Param("search") String search
    );

    long countByStatus(String status);

    long countByCreatedAtAfter(LocalDateTime time);
}
