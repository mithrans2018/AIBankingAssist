package com.banking.ai.assistance.BankingAssistant.controller;

import com.banking.ai.assistance.BankingAssistant.service.BankingAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class BankingAiController {

    private final BankingAiService aiService;

    public BankingAiController(BankingAiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(
            @RequestBody Map<String, String> request) {

        String answer = aiService.askAssistant(
                request.get("message")
        );

        return Map.of("answer", answer);
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, String>> handleAiServiceError(
            RestClientResponseException exception) {
        String detail = exception.getResponseBodyAsString();
        try {
            JsonNode body = new ObjectMapper().readTree(detail);
            if (body.hasNonNull("detail")) {
                detail = body.get("detail").asText();
            }
        } catch (Exception ignored) {
            // Keep the upstream response body if it is not JSON.
        }
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("detail", detail.isBlank() ? "AI service request failed" : detail));
    }
}
