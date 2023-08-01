package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;

import static uk.ac.ebi.biostudies.submissiontool.controllers.Proxy.SESSION_HEADER;

@Controller
public class FileList {

    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping(value = "/filelist/{*path}")
    public void getFileList(@PathVariable String path, HttpServletRequest request,
                            HttpServletResponse response) throws IOException {
        String token = request.getHeader(SESSION_HEADER);
        ServletOutputStream out = response.getOutputStream();
        PrintWriter writer = new PrintWriter(out);
        try {
            response.setHeader("Content-Type", "text/tab-separated-values");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + path.substring(path.lastIndexOf("/")+1) +".tsv\"");
            writer.println("Files");
            getFiles(path, token, writer);
        } catch (Exception e) {
            writer.println("Error generating filelist");
            e.printStackTrace();
        }
        response.setStatus(200);
        response.flushBuffer();
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
