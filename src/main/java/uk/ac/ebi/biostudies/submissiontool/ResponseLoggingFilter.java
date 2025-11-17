package uk.ac.ebi.biostudies.submissiontool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class ResponseLoggingFilter implements GlobalFilter, Ordered {

  private static final Logger log = LoggerFactory.getLogger(ResponseLoggingFilter.class);

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    return chain.filter(exchange)
        .doOnSuccess(aVoid -> {
          log.info("Response for {} {}: Status={}",
              exchange.getRequest().getMethod(),
              exchange.getRequest().getURI().getPath(),
              exchange.getResponse().getStatusCode());
        })
        .doOnError(error -> {
          log.error("Error during request {} {}: {}",
              exchange.getRequest().getMethod(),
              exchange.getRequest().getURI().getPath(),
              error.getMessage(),
              error);
        });
  }

  @Override
  public int getOrder() {
    return Ordered.LOWEST_PRECEDENCE;
  }
}