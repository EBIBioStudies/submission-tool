package uk.ac.ebi.biostudies.submissiontool;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class WebFluxStaticResourceConfig implements WebFluxConfigurer {

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Map /biostudies/submissions/assets/** to classpath:/static/assets/
    registry.addResourceHandler("/biostudies/submissions/assets/**")
        .addResourceLocations("classpath:/static/assets/");

    registry.addResourceHandler("/biostudies/submissions/images/**")
        .addResourceLocations("classpath:/static/images/");

    registry.addResourceHandler("/biostudies/submissions/favicon.ico")
        .addResourceLocations("classpath:/static/");
  }
}