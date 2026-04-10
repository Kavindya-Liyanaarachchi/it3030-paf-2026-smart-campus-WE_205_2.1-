package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public Page<ResourceResponse> searchResources(ResourceType type, Integer minCapacity,
                                                   String search, ResourceStatus status,
                                                   int page, int size) {
        List<Resource> all = resourceRepository.findAll();

        final String query = (search != null && !search.isBlank())
            ? search.toLowerCase().trim() : null;

        List<ResourceResponse> filtered = all.stream()
            .filter(r -> type == null || r.getType() == type)
            .filter(r -> status == null || r.getStatus() == status)
            .filter(r -> minCapacity == null ||
                        (r.getCapacity() != null && r.getCapacity() >= minCapacity))
            .filter(r -> {
                if (query == null) return true;
                // Search across name, location, building, floor, description, model
                return matches(r.getName(), query)
                    || matches(r.getLocation(), query)
                    || matches(r.getBuilding(), query)
                    || matches(r.getFloor(), query)
                    || matches(r.getDescription(), query)
                    || matches(r.getModel(), query)
                    || matches(r.getSerialNumber(), query);
            })
            .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
            .map(this::toResponse)
            .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex   = Math.min(fromIndex + size, total);
        return new PageImpl<>(filtered.subList(fromIndex, toIndex), PageRequest.of(page, size), total);
    }

    // Case-insensitive partial match helper
    private boolean matches(String field, String query) {
        return field != null && field.toLowerCase().contains(query);
    }

    public ResourceResponse getById(String id) {
        return toResponse(findById(id));
    }

    public ResourceResponse create(ResourceRequest request) {
        Resource r = new Resource();
        mapRequestToEntity(request, r);
        return toResponse(resourceRepository.save(r));
    }

    public ResourceResponse update(String id, ResourceRequest request) {
        Resource r = findById(id);
        mapRequestToEntity(request, r);
        return toResponse(resourceRepository.save(r));
    }

    public void delete(String id) {
        resourceRepository.delete(findById(id));
    }

    public ResourceResponse updateStatus(String id, ResourceStatus status) {
        Resource r = findById(id);
        r.setStatus(status);
        return toResponse(resourceRepository.save(r));
    }

    public Resource findById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    private void mapRequestToEntity(ResourceRequest req, Resource r) {
        r.setName(req.getName());
        r.setType(req.getType());
        r.setCapacity(req.getCapacity());
        r.setLocation(req.getLocation());
        r.setBuilding(req.getBuilding());
        r.setFloor(req.getFloor());
        r.setDescription(req.getDescription());
        r.setStatus(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE);
        r.setAvailableFrom(req.getAvailableFrom());
        r.setAvailableTo(req.getAvailableTo());
        r.setSerialNumber(req.getSerialNumber());
        r.setModel(req.getModel());
        r.setImageUrl(req.getImageUrl());
    }

    public ResourceResponse toResponse(Resource r) {
        ResourceResponse res = new ResourceResponse();
        res.setId(r.getId());
        res.setName(r.getName());
        res.setType(r.getType());
        res.setCapacity(r.getCapacity());
        res.setLocation(r.getLocation());
        res.setBuilding(r.getBuilding());
        res.setFloor(r.getFloor());
        res.setDescription(r.getDescription());
        res.setStatus(r.getStatus());
        res.setAvailableFrom(r.getAvailableFrom());
        res.setAvailableTo(r.getAvailableTo());
        res.setSerialNumber(r.getSerialNumber());
        res.setModel(r.getModel());
        res.setImageUrl(r.getImageUrl());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }
}
