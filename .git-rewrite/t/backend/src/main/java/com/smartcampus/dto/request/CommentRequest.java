package com.smartcampus.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Content is required")
    @Size(max = 2000)
    private String content;
}
