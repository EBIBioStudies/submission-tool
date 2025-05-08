package uk.ac.ebi.biostudies.submissiontool.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class PageController {
    @RequestMapping(value = {
            "/signin/**",
            "/signup/**",
            "/reset/**",
            "/activation/**",
            "/password_reset/**",
            "/drafts/**",
            "/edit/**",
            "/files/**",
            "/help/**",
            "/profile/**",
            "/logout/**"})
    public String redirect() {
        return "forward:/";
    }
}
