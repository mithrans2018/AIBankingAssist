package com.banking.ai.assistance.BankingAssistant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfiguration  {
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
    @Bean
    public RestClient aiRestClient(
            RestClient.Builder builder) {

        return builder
                .baseUrl("http://localhost:8000")
                .build();
    }
}