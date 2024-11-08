package com.c209.notification.domain.fcm.service;


import com.c209.notification.domain.fcm.service.UserService;
import com.c209.notification.domain.fcm.exception.FcmErrorCode;
import com.c209.notification.domain.fcm.exception.FcmException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseException;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.io.FileInputStream;

import java.io.IOException;

import static com.c209.notification.domain.fcm.exception.FcmErrorCode.CAN_NOT_SEND_NOTIFICATION;


@Service
@RequiredArgsConstructor
@Slf4j
public class  AsyncFcmServiceImpl implements FcmService{

    // 비밀키 경로 환경 변수
    @Value("${fcm.service-account-file}") private String serviceAccountFilePath;
    // 프로젝트 아이디 환경 변수
    @Value("${fcm.project-id}") private String projectId;

    private final UserService userService;

    @PostConstruct
    public void initialize() {
        log.info("{}", serviceAccountFilePath);
        FirebaseOptions options = null;
        try {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new ClassPathResource(serviceAccountFilePath).getInputStream()))
                    .setProjectId(projectId)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("FCM 서버 세팅 중 에러가 발생했습니다: " + e);
        }

        FirebaseApp.initializeApp(options);
    }

    @Override
    public Mono<String> sendMessage(String title, String body, Long userId) {
        return userService.getFcmTokenByUserId(userId)
                .flatMap(token -> {
                    try {
                        // FirebaseMessaging을 사용하여 메시지 전송
                        return Mono.fromCallable(() -> {
                                    try {
                                        return FirebaseMessaging.getInstance().send(Message.builder()
                                                .setNotification(Notification.builder()
                                                        .setTitle(title)
                                                        .setBody(body)
                                                        .build())
                                                .setToken(token)
                                                .build());
                                    } catch (FirebaseMessagingException e) {
                                        throw e;
                                    }
                                })
                                .doOnSuccess(response -> log.info("Notification sent successfully"))
                                .onErrorResume(e -> {
                                    log.error("Error sending notification: {}", e.getMessage());
                                    return Mono.error(new FcmException(CAN_NOT_SEND_NOTIFICATION));
                                });
                    } catch (IllegalArgumentException e) {
                        log.error("IllegalArgumentException: {}", e.getMessage());
                        return Mono.error(e);
                    } catch (Exception e) {
                        log.error("Unexpected error occurred: {}", e.getMessage());
                        return Mono.error(new FcmException(CAN_NOT_SEND_NOTIFICATION));
                    }
                })
                .subscribeOn(Schedulers.boundedElastic());
        };
    // 받은 token을 이용하여 fcm를 보냄




}
