package com.HMS.HMS.config;

import com.HMS.HMS.model.User.Role;
import com.HMS.HMS.model.User.User;
import com.HMS.HMS.model.ward.Ward;
import com.HMS.HMS.repository.UserRepository;
import com.HMS.HMS.repository.WardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {


    private final UserRepository userRepo;

    private final PasswordEncoder passwordEncoder;

    private final WardRepository wardRepo;

    public DataInitializer(UserRepository userRepo, PasswordEncoder passwordEncoder, WardRepository wardRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.wardRepo = wardRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepo.existsById("ADMIN001")) {
            User admin = new User();
            admin.setEmpId("ADMIN001");
            admin.setUsername("defaultadmin");
            admin.setPassword(passwordEncoder.encode("ADMIN001"));
            admin.setRole(Role.ADMIN);
            userRepo.save(admin);
            System.out.println("Default admin created: EMPID=ADMIN001, password=admin123");
        }

        if (wardRepo.count() == 0) {
            Ward ward1 = new Ward();
            ward1.setWardName("Ward 1");
            ward1.setWardType("General");

            Ward ward2 = new Ward();
            ward2.setWardName("Ward 2");
            ward2.setWardType("General");

            Ward ward3 = new Ward();
            ward3.setWardName("Ward 3");
            ward3.setWardType("ICU");

            Ward ward4 = new Ward();
            ward4.setWardName("Ward 4");
            ward4.setWardType("Dialysis");

            wardRepo.save(ward1);
            wardRepo.save(ward2);
            wardRepo.save(ward3);
            wardRepo.save(ward4);

            System.out.println("Default wards created: Ward 1-4 with respective types");
        }

    }
}
