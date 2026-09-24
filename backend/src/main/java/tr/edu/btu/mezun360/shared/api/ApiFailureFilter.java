package tr.edu.btu.mezun360.shared.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ApiFailureFilter extends OncePerRequestFilter {
    private final ApiProblems problems;
    public ApiFailureFilter(ApiProblems problems) { this.problems = problems; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        try { chain.doFilter(request, response); }
        catch (Exception ex) {
            if (response.isCommitted()) throw new ServletException("Request processing failed.");
            response.resetBuffer();
            boolean unavailable = ex instanceof DataAccessException || ex.getCause() instanceof DataAccessException;
            problems.write(request, response, unavailable ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR,
                    unavailable ? "SERVICE_UNAVAILABLE" : "INTERNAL_ERROR", "The request could not be processed.");
        }
    }
}
