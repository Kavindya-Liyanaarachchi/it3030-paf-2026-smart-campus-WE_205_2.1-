package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceCreateRequest;
import com.smartcampus.backend.dto.ResourceDto;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.ResourceEntity;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<ResourceDto> searchResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status) {
        return repository.search(type, location, minCapacity, status)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ResourceDto getById(Long id) {
        return repository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id " + id));
    }

    public ResourceDto createResource(ResourceCreateRequest request) {
        ResourceEntity entity = new ResourceEntity();
        mapRequestToEntity(request, entity);
        return toDto(repository.save(entity));
    }

    public ResourceDto updateResource(Long id, ResourceCreateRequest request) {
        ResourceEntity resource = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id " + id));
        mapRequestToEntity(request, resource);
        return toDto(repository.save(resource));
    }

    public void deleteResource(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id " + id);
        }
        repository.deleteById(id);
    }

    private ResourceDto toDto(ResourceEntity entity) {
        ResourceDto dto = new ResourceDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setCapacity(entity.getCapacity());
        dto.setLocation(entity.getLocation());
        dto.setAvailability(entity.getAvailability());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private void mapRequestToEntity(ResourceCreateRequest request, ResourceEntity entity) {
        entity.setName(request.getName());
        entity.setType(request.getType());
        entity.setCapacity(request.getCapacity());
        entity.setLocation(request.getLocation());
        entity.setAvailability(request.getAvailability());
        entity.setStatus(request.getStatus());
        entity.setDescription(request.getDescription());
    }
}
