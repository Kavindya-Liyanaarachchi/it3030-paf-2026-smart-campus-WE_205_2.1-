package com.smartcampus.config;

import com.smartcampus.entity.Resource;
import com.smartcampus.enums.*;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void run(String... args) throws IOException {
        // Always ensure upload directory exists
        Files.createDirectories(Paths.get(uploadDir));
        Files.createDirectories(Paths.get(uploadDir, "tickets"));
        log.info("Upload directory ready: {}", Paths.get(uploadDir).toAbsolutePath());

        if (resourceRepository.count() > 0) {
            log.info("Data already seeded, skipping.");
            return;
        }

        log.info("Seeding initial data into MongoDB...");

        resourceRepository.save(Resource.builder()
            .name("Lecture Hall A101").type(ResourceType.LECTURE_HALL)
            .capacity(200).location("Block A, Floor 1").building("Block A").floor("1")
            .description("Main lecture hall with projector and audio system")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(8, 0)).availableTo(LocalTime.of(20, 0)).build());

        resourceRepository.save(Resource.builder()
            .name("Computer Lab B201").type(ResourceType.LAB)
            .capacity(40).location("Block B, Floor 2").building("Block B").floor("2")
            .description("Computer lab with 40 workstations running Windows 11")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(8, 0)).availableTo(LocalTime.of(18, 0)).build());

        resourceRepository.save(Resource.builder()
            .name("Meeting Room C301").type(ResourceType.MEETING_ROOM)
            .capacity(15).location("Block C, Floor 3").building("Block C").floor("3")
            .description("Meeting room with video conferencing equipment")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(9, 0)).availableTo(LocalTime.of(17, 0)).build());

        resourceRepository.save(Resource.builder()
            .name("Physics Lab D101").type(ResourceType.LAB)
            .capacity(25).location("Block D, Floor 1").building("Block D").floor("1")
            .description("Physics laboratory with advanced equipment")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(8, 0)).availableTo(LocalTime.of(18, 0)).build());

        resourceRepository.save(Resource.builder()
            .name("Projector Pro-X1").type(ResourceType.EQUIPMENT)
            .location("Equipment Store, Block A").building("Block A").floor("G")
            .description("4K Laser Projector, portable")
            .serialNumber("PRJ-2024-001").model("Epson LS300W")
            .status(ResourceStatus.ACTIVE).build());

        resourceRepository.save(Resource.builder()
            .name("Canon EOS Camera Kit").type(ResourceType.EQUIPMENT)
            .location("Media Lab, Block E").building("Block E").floor("1")
            .description("Canon EOS R5 with lenses and accessories")
            .serialNumber("CAM-2024-007").model("Canon EOS R5")
            .status(ResourceStatus.ACTIVE).build());

        resourceRepository.save(Resource.builder()
            .name("Auditorium Main Hall").type(ResourceType.LECTURE_HALL)
            .capacity(500).location("Main Building, Ground Floor").building("Main Building").floor("G")
            .description("Main auditorium for large events and graduations")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(8, 0)).availableTo(LocalTime.of(22, 0)).build());

        resourceRepository.save(Resource.builder()
            .name("Innovation Hub").type(ResourceType.MEETING_ROOM)
            .capacity(30).location("Innovation Centre, Floor 2").building("Innovation Centre").floor("2")
            .description("Co-working and brainstorming space with whiteboards")
            .status(ResourceStatus.ACTIVE)
            .availableFrom(LocalTime.of(7, 0)).availableTo(LocalTime.of(21, 0)).build());

        log.info("Seeding complete. {} resources created.", resourceRepository.count());
    }
}
