package com.smartcampus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve the absolute path of the uploads directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();

        // Serve files at /api/uploads/** from the local uploads folder
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/");
    }
}
