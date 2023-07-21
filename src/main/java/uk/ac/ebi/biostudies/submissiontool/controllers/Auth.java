package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class Auth {

    private final String SESSION_HEADER = "x-session-token";
    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> postResponse(@PathVariable String path, @RequestBody String body) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path);
        Map<String, Object> jsonObject = new ObjectMapper().readValue(body, Map.class);
        String response;
        try {
            response = restTemplate.postForObject(url, jsonObject, String.class);
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
        }
        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getResponse(@PathVariable String path, @RequestHeader(SESSION_HEADER) String token) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path);
        HttpHeaders headers = new HttpHeaders();
        headers.set(SESSION_HEADER, token);
        HttpEntity httpEntity = new HttpEntity(headers);
        ResponseEntity<String> response;
        try {
            response = restTemplate.exchange(url,  HttpMethod.GET , httpEntity, String.class);
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
        }
        return  ResponseEntity.ok(response.getBody());
    }

}
