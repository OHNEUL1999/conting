package com.c209.batchservice.domain.catalog.dto;

import com.c209.batchservice.domain.catalog.entity.Performance;
import lombok.Builder;

@Builder
public record PerformanceDto(
        Long id,
        String title,
        String posterImage,
        String description,
        String videoUrl,
        String startDate,
        String endDate,
        HallDto hall,
        SellerDto seller,
        SingerDto singer
) {
    public static PerformanceDto of(Performance performance) {
        return PerformanceDto.builder()
                .id(performance.getId())
                .title(performance.getTitle())
                .posterImage(performance.getPosterImage())
                .description(performance.getDescription())
                .videoUrl(performance.getVideoUrl())
                .startDate(performance.getStartDate().toString())
                .endDate(performance.getEndDate().toString())
                .hall(HallDto.of(performance.getHall()))
                .seller(SellerDto.of(performance.getSeller()))
                .singer(SingerDto.of(performance.getSinger()))
                .build();
    }
}
