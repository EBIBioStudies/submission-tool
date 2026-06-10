package uk.ac.ebi.biostudies.submissiontool.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class PageController {
  @RequestMapping(value = {
      "/signin/**",
      "/signup/**",
      "/reset/**",
      "/activation/**",
      "/activate/**",
      "/password_reset/**",
      "/password_reset_request",
      "/drafts/**",
      "/edit/**",
      "/files/**",
      "/help/**",
      "/profile/**",
      "/logout/**"},
      method = RequestMethod.GET)
  public String redirect() {
    return "forward:/";
  }
}
