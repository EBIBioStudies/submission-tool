package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.PrintWriter;


@Controller
public class FileList {

    @Autowired
    private Environment environments;
    public static final String SESSION_HEADER = "x-session-token";

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/filelist/{*folder}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<Void> getFileList(@PathVariable String folder,
                                  ServerHttpRequest request,
                                  ServerHttpResponse  response) throws IOException {

        String token = request.getHeaders().getFirst(SESSION_HEADER);
        try {
            //response.getHeaders().set ("Content-Type", "text/tab-separated-values");
            //response.getHeaders().set("Content-Disposition", "attachment; filename=\"" + folder.substring(folder.lastIndexOf("/")+1) +".tsv\"");
            PrintWriter writer = new PrintWriter(response.bufferFactory().allocateBuffer(1024).asOutputStream());
            writer.println("Files");

            //getFiles(folder, token, writer);
            writer.flush();
        } catch (Exception e) {
            //writer.println("Error generating filelist");
            e.printStackTrace();
        }

        return Mono.empty();
    }

    private void getFiles(String path, String token,
                          PrintWriter writer) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/files/%s".formatted(environments.getProperty("backend.url"), path);
        HttpHeaders headers = new HttpHeaders();
        headers.set(SESSION_HEADER, token);
        HttpEntity<HttpHeaders> httpEntity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, httpEntity, String.class);
        JsonNode[] files = new ObjectMapper().readValue(response.getBody(), JsonNode[].class);
        for (JsonNode entry : files) {
            try {
                if (entry.get("type").asText().equalsIgnoreCase("FILE")) {
                    String sanitisedPath = entry.get("path").asText() + "/" + entry.get("name").asText();
                    if (sanitisedPath.startsWith("user/")) sanitisedPath = sanitisedPath.substring(5);
                    writer.println(sanitisedPath);
                } else if (entry.get("type").asText().equalsIgnoreCase("DIR")) {
                    writer.flush();
                    getFiles(entry.get("path").asText() + "/" + entry.get("name").asText(), token, writer);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        writer.flush();
    }


}
