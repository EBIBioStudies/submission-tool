package uk.ac.ebi.biostudies.submissiontool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

@SpringBootApplication
public class SubmissionToolApplication {

    public static void main(String[] args) {
        SpringApplication.run(SubmissionToolApplication.class, args);
    }

}

