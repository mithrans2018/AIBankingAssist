package com.banking.ai.assistance.BankingAssistant.service;

import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
    public class BankingAiService {

        private static final ObjectMapper JSON_MAPPER = new ObjectMapper();
        private final RestClient restClient;

        public BankingAiService(RestClient aiRestClient) {
            this.restClient = aiRestClient;
        }

        public String askAssistant(String message) {

            byte[] requestBody;
            try {
                requestBody = JSON_MAPPER.writeValueAsBytes(
                        Map.of("message", message)
                );
            } catch (Exception exception) {
                throw new IllegalStateException("Could not encode the assistant request", exception);
            }

            Map response = restClient.post()
                    .uri("/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .contentLength(requestBody.length)
                    .body(outputStream -> outputStream.write(requestBody))
                    .retrieve()
                    .body(Map.class);

            return (String) response.get("answer");
        }

    }

