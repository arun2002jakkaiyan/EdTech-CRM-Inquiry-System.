package com.edtech.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class InquiryRequest {

    @NotBlank(message = "User type is required")
    @Pattern(regexp = "^(Parent|Student|School)$", message = "User type must be Parent, Student, or School")
    private String user_type;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(Scholarship|Concert|Admission|General Query)$", message = "Category must be Scholarship, Concert, Admission, or General Query")
    private String category;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(min = 5, max = 30, message = "Phone number must be at least 5 digits")
    private String phone;

    @NotBlank(message = "Message is required")
    @Size(min = 5, max = 3000, message = "Message must be at least 5 characters long")
    private String message;

    public InquiryRequest() {}

    public String getUser_type() {
        return user_type;
    }

    public void setUser_type(String user_type) {
        this.user_type = user_type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
