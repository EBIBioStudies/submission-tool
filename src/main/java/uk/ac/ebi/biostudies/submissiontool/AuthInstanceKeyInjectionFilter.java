package uk.ac.ebi.biostudies.submissiontool;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@Component
public class AuthInstanceKeyInjectionFilter implements GlobalFilter, Ordered {

  private static final Set<String> AUTH_PATHS = Set.of(
      "/biostudies/submissions/api/auth/register",
      "/biostudies/submissions/api/auth/password/reset",
      "/biostudies/submissions/api/auth/retryact"
  );

  private final ObjectMapper objectMapper;
  private final String instanceKey;

  public AuthInstanceKeyInjectionFilter(
      ObjectMapper objectMapper,
      @Value("${backend.instance-key}") String instanceKey) {
    this.objectMapper = objectMapper;
    this.instanceKey = instanceKey;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();
    String path = request.getURI().getPath();
    MediaType contentType = request.getHeaders().getContentType();

    if (!"POST".equalsIgnoreCase(request.getMethod().name()) ||
        !AUTH_PATHS.contains(path) ||
        contentType == null ||
        !MediaType.APPLICATION_JSON.isCompatibleWith(contentType)) {
      return chain.filter(exchange);
    }

    return DataBufferUtils.join(request.getBody())
        .defaultIfEmpty(exchange.getResponse().bufferFactory().wrap(new byte[0]))
        .flatMap(dataBuffer -> {
          byte[] bytes = new byte[dataBuffer.readableByteCount()];
          dataBuffer.read(bytes);
          DataBufferUtils.release(dataBuffer);

          byte[] updatedBody = injectInstanceKey(bytes);

          ServerHttpRequest decoratedRequest = new ServerHttpRequestDecorator(request) {
            @Override
            public HttpHeaders getHeaders() {
              HttpHeaders headers = new HttpHeaders();
              headers.putAll(super.getHeaders());
              headers.set("X-Instance-Key", instanceKey);
              headers.setContentLength(updatedBody.length);
              return headers;
            }

            @Override
            public Flux<DataBuffer> getBody() {
              DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(updatedBody);
              return Flux.just(buffer);
            }
          };

          return chain.filter(exchange.mutate().request(decoratedRequest).build());
        });
  }

  private byte[] injectInstanceKey(byte[] body) {
    try {
      JsonNode jsonNode = objectMapper.readTree(body);
      if (jsonNode instanceof ObjectNode objectNode && !objectNode.hasNonNull("instanceKey")) {
        objectNode.put("instanceKey", instanceKey);
        return objectMapper.writeValueAsBytes(objectNode);
      }
    } catch (Exception ignored) {
      // Preserve the original payload if the body is not JSON or cannot be parsed.
    }
    return body;
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }
}
