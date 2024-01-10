package uk.ac.ebi.biostudies.submissiontool.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import  java.io.IOException;

@Controller
public class Config {

    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getConfig() throws IOException {
        return String.format("{\"recaptchaKey\":\"%s\"}",
                environments.getProperty("backend.recaptcha-key"));
    }

}
