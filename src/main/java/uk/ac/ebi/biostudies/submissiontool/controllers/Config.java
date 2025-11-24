package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import  java.io.IOException;

@Controller
@RequestMapping("/biostudies/submissions") // Add base path
public class Config {

    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getConfig() throws IOException {
        ObjectNode config = (new ObjectMapper()).createObjectNode();
        config.put("instanceKey", environments.getProperty("backend.instance-key"));
        config.put("recaptchaKey", environments.getProperty("backend.recaptcha-key"));
        config.put("frontendUrl", environments.getProperty("frontend.url"));
        return config.toString();
    }
}