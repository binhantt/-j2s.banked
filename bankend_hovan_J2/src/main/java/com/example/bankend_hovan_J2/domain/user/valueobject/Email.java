package com.example.bankend_hovan_J2.domain.user.valueobject;

import java.util.regex.Pattern;

public class Email {
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    private final String value;

    public Email(String value) {
        if (value == null || !EMAIL_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Email email = (Email) o;
        return value.equals(email.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
