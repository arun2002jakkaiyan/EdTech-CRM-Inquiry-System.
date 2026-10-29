package com.edtech.crm.config;

import com.edtech.crm.entity.Admin;
import com.edtech.crm.entity.Inquiry;
import com.edtech.crm.repository.AdminRepository;
import com.edtech.crm.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final InquiryRepository inquiryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:admin@edutech.com}")
    private String defaultEmail;

    @Value("${app.admin.default-password:Admin@123}")
    private String defaultPassword;

    @Value("${app.admin.default-name:Lead Administrator}")
    private String defaultName;

    public DataInitializer(AdminRepository adminRepository,
                           InquiryRepository inquiryRepository,
                           PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.inquiryRepository = inquiryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed default Admin if not present
        if (!adminRepository.existsByEmailIgnoreCase(defaultEmail)) {
            Admin admin = new Admin();
            admin.setName(defaultName);
            admin.setEmail(defaultEmail.toLowerCase());
            admin.setPasswordHash(passwordEncoder.encode(defaultPassword));
            admin.setRole("admin");
            adminRepository.save(admin);
            System.out.println("✅ Seeded default admin account: " + defaultEmail);
        }

        // 2. Seed sample inquiries if table is empty
        if (inquiryRepository.count() == 0) {
            List<Inquiry> samples = Arrays.asList(
                new Inquiry("Parent", "Scholarship", "Sarah Jenkins", "sarah.jenkins@example.com", "+1 (555) 234-5678",
                        "Inquiring about merit-based STEM scholarships for Grade 11 students entering the 2026-2027 academic year."),
                new Inquiry("Student", "Admission", "Devon Patel", "devon.patel@studenthub.org", "+1 (555) 876-5432",
                        "Would like to know the deadline for Fall Semester computer science bridge programs and prerequisite courses."),
                new Inquiry("School", "Concert", "Elena Rostova", "elena.r@stmarys-academy.edu", "+1 (555) 345-9876",
                        "Requesting partnership details for hosting the Regional Youth Symphony & Arts Concert at our campus hall."),
                new Inquiry("Parent", "General Query", "Marcus Sterling", "marcus.sterling@gmail.com", "+1 (555) 912-3401",
                        "Can you clarify the bus transportation zones and after-school robotics lab schedule?"),
                new Inquiry("Student", "Scholarship", "Aisha Khan", "aisha.khan@edu.in", "+91 98765 43210",
                        "Seeking application criteria and eligibility for the Women in Tech full-ride scholarship scheme."),
                new Inquiry("School", "Admission", "Principal Arthur Vance", "avance@oakwoodhigh.org", "+1 (555) 678-1234",
                        "Proposal to setup dual-enrollment credits for senior secondary cohorts starting this August.")
            );

            // Set custom statuses for variety
            samples.get(1).setStatus("Contacted");
            samples.get(1).setNotes("Sent admissions brochure via email.");
            samples.get(2).setStatus("In Progress");
            samples.get(3).setStatus("Resolved");
            samples.get(3).setNotes("Clarified bus schedule over phone.");
            samples.get(5).setStatus("In Progress");

            inquiryRepository.saveAll(samples);
            System.out.println("✅ Seeded " + samples.size() + " sample inquiries into database.");
        }

        System.out.println("\n=======================================================");
        System.out.println("🚀 EdTech CRM Backend (Spring Boot + Custom JWT) Ready");
        System.out.println("🔑 Default Admin Email: " + defaultEmail);
        System.out.println("🔑 Default Admin Password: " + defaultPassword);
        System.out.println("=======================================================\n");
    }
}
