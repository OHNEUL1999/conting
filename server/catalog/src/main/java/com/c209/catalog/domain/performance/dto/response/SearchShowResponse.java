package com.c209.catalog.domain.performance.dto.response;

import com.c209.catalog.domain.performance.dto.PerformanceSearchDto;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.util.List;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Setter
public class SearchShowResponse {
    private List<PerformanceSearchDto> shows;

    public void setPerformances(List<PerformanceSearchDto> performanceSearchDtos) {
        this.shows = performanceSearchDtos;
    }
}
