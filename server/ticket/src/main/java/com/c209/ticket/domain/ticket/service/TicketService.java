package com.c209.ticket.domain.ticket.service;

import com.c209.ticket.domain.ticket.dto.TicketDto;
import com.c209.ticket.domain.ticket.dto.response.TicketListResponse;
import com.c209.ticket.domain.ticket.dto.response.TicketPaymentsListResponse;
import com.netflix.appinfo.ApplicationInfoManager;
import reactor.core.publisher.Mono;

import java.util.Optional;

public interface TicketService {
    Mono<TicketListResponse> getUserTickerList(Long userId);

    Mono<TicketDto> getTicketDetail(Long userId, Long ticketId, String fingerPrint);

    Mono<Boolean> extendQRExpTime(Long userId, String qrUUID);

    Mono<Boolean> verifyQR(Long userId, String qrUUID, Long ticketId);

    Mono<TicketPaymentsListResponse> getTicketPaymentsList(Long userId);

    boolean refund(Long userId, Long ticketId);
}
