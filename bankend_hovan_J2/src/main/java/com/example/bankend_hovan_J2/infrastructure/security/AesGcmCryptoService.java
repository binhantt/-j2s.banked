package com.example.bankend_hovan_J2.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class AesGcmCryptoService {
    private static final String AES = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;

    private final byte[] keyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public AesGcmCryptoService(@Value("${security.aes.key}") String base64Key) {
        this.keyBytes = Base64.getDecoder().decode(base64Key);
        if (this.keyBytes.length != 32) {
            throw new IllegalArgumentException("security.aes.key must be 32 bytes (Base64 encoded) for AES-256-GCM");
        }
    }

    public String encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, AES);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Encrypt failed", e);
        }
    }

    public String decrypt(String encryptedBase64) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedBase64);
            byte[] iv = new byte[IV_LENGTH];
            byte[] cipherText = new byte[combined.length - IV_LENGTH];

            System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
            System.arraycopy(combined, IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, AES);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

            byte[] plain = cipher.doFinal(cipherText);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decrypt failed", e);
        }
    }
}


