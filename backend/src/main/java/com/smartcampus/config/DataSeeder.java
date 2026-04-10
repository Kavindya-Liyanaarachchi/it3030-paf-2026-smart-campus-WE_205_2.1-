package com.smartcampus.config;

import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void run(String... args) throws IOException {
        // Ensure upload directory exists
        Files.createDirectories(Paths.get(uploadDir));
        Files.createDirectories(Paths.get(uploadDir, "bookings"));
        log.info("Upload directory ready: {}", Paths.get(uploadDir).toAbsolutePath());
    }
}
