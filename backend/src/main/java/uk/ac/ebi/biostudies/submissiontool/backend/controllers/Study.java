package uk.ac.ebi.biostudies.submissiontool.backend.controllers;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.nio.file.Files;

@Controller
public class Study {

    @RequestMapping("/")
    public String index() {
        return "index";
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping(value = "/study/{accession}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getStudy(@PathVariable String accession) throws Exception {
        Resource resource = new ClassPathResource(accession + ".json");
        if (resource.exists()) {
            byte[] fileData = Files.readAllBytes(resource.getFile().toPath());
            String jsonContent = new String(fileData);
            return ResponseEntity.ok(jsonContent);
        }
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.ebi.ac.uk/biostudies/files/%s/%s.json".formatted(accession, accession);
        return ResponseEntity.ok(restTemplate.getForObject(url, String.class));

    }

}
