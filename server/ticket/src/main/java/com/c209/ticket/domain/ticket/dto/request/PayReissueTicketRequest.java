package com.c209.ticket.domain.ticket.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PayReissueTicketRequest(
        String impUid,
        Integer price
) {
}
