package com.c209.batchservice.domain.seat.service;

import com.c209.batchservice.domain.seat.dto.SeatDto;

import java.util.List;

public interface SeatService {
    List<SeatDto> getSeatList(Long scheduleId);
}