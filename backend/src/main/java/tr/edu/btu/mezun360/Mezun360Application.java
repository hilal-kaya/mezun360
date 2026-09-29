package tr.edu.btu.mezun360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Mezun360Application {
    public static void main(String[] args) {
        SpringApplication.run(Mezun360Application.class, args);
    }
}
