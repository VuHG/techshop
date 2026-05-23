package com.techshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TechShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(TechShopApplication.class, args);
    }
}
