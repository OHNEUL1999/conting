package com.c209.batchservice.batch.nft;

import com.c209.batchservice.batch.nft.dto.*;
import com.c209.batchservice.batch.nft.dto.request.AssetRequest;
import com.c209.batchservice.batch.nft.dto.request.CollectionRequest;
import com.c209.batchservice.domain.seat.dto.SeatDto;
import com.c209.batchservice.global.web3.Web3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class NftMintStepConfig {
    public static final String NFT_MINT_DIR = NftBatchConfig.NFT_DIR + "/mint";
    private final JobRepository jobRepository;
    private final PlatformTransactionManager batchTransactionManager;
    @Qualifier("catalogEntityManagerFactory")
    private final EntityManagerFactory catalogEntityManagerFactory;
    @Qualifier("seatEntityManagerFactory")
    private final EntityManagerFactory seatEntityManagerFactory;
    private final Web3Service web3Service;

    @Bean
    public Step mintCollectionStep() {
        return new StepBuilder("mintCollectionStep", jobRepository)
                .<PerformanceAndMetadataDto, PerformanceIdAndCollectionMintDto>chunk(100, batchTransactionManager)
                .reader(NftBatchConfig.createJsonItemReader(PerformanceAndMetadataDto.class))
                .processor(mintCollectionProcessor())
                .writer(NftBatchConfig.createJsonFileItemWriter(PerformanceIdAndCollectionMintDto.class))
                .build();
    }

    @Bean
    public ItemProcessor<PerformanceAndMetadataDto, PerformanceIdAndCollectionMintDto> mintCollectionProcessor() {
        return dto -> {
            Path path = Path.of(NFT_MINT_DIR, dto.performance().id().toString(), "0.mint");
            String collectionMint;
            if (Files.exists(path)) {
                collectionMint = Files.readString(path);
            } else {
                collectionMint = web3Service.createCollection(CollectionRequest.builder()
                                .name(dto.performance().singer().name() +
                                      " " + dto.performance().startDate())
                                .symbol(dto.jsonMetadata().symbol())
                                .uri(dto.jsonMetadata().externalUrl())
                                .sellerFeeBasisPoints(dto.jsonMetadata().sellerFeeBasisPoints())
                                .agency(dto.performance().seller().wallet())
                                .singer(dto.performance().singer().wallet())
                                .build())
                        .collectionMint();
            }
            Files.createDirectories(path.getParent());
            Files.writeString(path, collectionMint, StandardOpenOption.CREATE);
            return PerformanceIdAndCollectionMintDto.builder()
                    .performanceId(dto.performance().id())
                    .collectionMint(collectionMint)
                    .build();
        };
    }

    @Bean
    public Step mintAssetStep() {
        return new StepBuilder("mintAssetStep", jobRepository)
                .<SeatAndScheduleAndMetadataDto, SeatIdAndMintDto>chunk(100, batchTransactionManager)
                .reader(NftBatchConfig.createJsonItemReader(SeatAndScheduleAndMetadataDto.class))
                .processor(mintAssetMintProcessor())
                .writer(NftBatchConfig.createJsonFileItemWriter(SeatIdAndMintDto.class))
                .build();
    }

    @Bean
    public ItemProcessor<SeatAndScheduleAndMetadataDto, SeatIdAndMintDto> mintAssetMintProcessor() {
        return dto -> {
            Path path = Path.of(NFT_MINT_DIR, dto.schedule().performance().id().toString(), dto.seat().id() + ".mint");
            String collectionMint = Files.readString(path.getParent().resolve("0.mint"));
            String mint;
            if (Files.exists(path)) {
                mint = Files.readString(path);
            } else {
                String name = dto.jsonMetadata().name();
                String suffix = name.substring(name.lastIndexOf(" #"));
                mint = web3Service.createAsset(AssetRequest.builder()
                                .name(dto.schedule().performance().singer().name() +
                                      " " + dto.schedule().performance().startDate() +
                                      suffix)
                                .symbol(dto.jsonMetadata().symbol())
                                .uri(dto.jsonMetadata().externalUrl())
                                .sellerFeeBasisPoints(dto.jsonMetadata().sellerFeeBasisPoints())
                                .agency(dto.schedule().performance().seller().wallet())
                                .singer(dto.schedule().performance().singer().wallet())
                                .collectionMint(collectionMint)
                                .build())
                        .mint();
            }
            return SeatIdAndMintDto.builder()
                    .seatId(dto.seat().id())
                    .performanceId(dto.schedule().performance().id())
                    .collectionMint(collectionMint)
                    .mint(mint)
                    .build();
        };
    }

    @Bean
    public Step verifyAssetAndUpdateSeatStep() {
        return new StepBuilder("verifyAssetAndUpdateSeatStep", jobRepository)
                .<SeatIdAndMintDto, SeatIdAndMintDto>chunk(100, batchTransactionManager)
                .reader(NftBatchConfig.createJsonItemReader(SeatIdAndMintDto.class))
                .processor(verifyAssetMintProcessor())
                .writer(seatNftUrlUpdater())
                .build();
    }

    @Bean
    public ItemProcessor<SeatIdAndMintDto, SeatIdAndMintDto> verifyAssetMintProcessor() {
        return dto -> {
            Path path = Path.of(NFT_MINT_DIR, dto.performanceId().toString(), dto.mint() + ".verified");
            if (!Files.exists(path)) {
                web3Service.verifyAsset(dto.collectionMint(), dto.mint());
                Files.createFile(path);
            }
            return dto;
        };
    }

    @Bean
    public ItemWriter<SeatIdAndMintDto> seatNftUrlUpdater() {
        return chunk -> {
            EntityManager entityManager = seatEntityManagerFactory.createEntityManager();
            EntityTransaction transaction = entityManager.getTransaction();
            try (entityManager) {
                transaction.begin();
                chunk.forEach(dto -> {
                    entityManager.createQuery("UPDATE Seat s SET s.nftUrl = :mint WHERE s.id = :id")
                            .setParameter("mint", dto.mint())
                            .setParameter("id", dto.seatId())
                            .executeUpdate();
                });
                transaction.commit();
            } catch (RuntimeException e) {
                transaction.rollback();
            }
        };
    }

    @Bean
    public Step updatePerformanceStep() {
        return new StepBuilder("updatePerformanceStep", jobRepository)
                .<PerformanceAndSeatsDto, PerformanceAndSeatsDto>chunk(100, batchTransactionManager)
                .reader(NftBatchConfig.createJsonItemReader(PerformanceAndSeatsDto.class))
                .processor(updatePerformanceProcessor())
                .writer(performanceIsMintedUpdater())
                .build();
    }

    @Bean
    public ItemProcessor<PerformanceAndSeatsDto, PerformanceAndSeatsDto> updatePerformanceProcessor() {
        return dto -> {
            try (EntityManager entityManager = seatEntityManagerFactory.createEntityManager()) {
                for (SeatDto seat : dto.seats()) {
                    String nftUrl = entityManager.createQuery("SELECT s.nftUrl FROM Seat s WHERE s.id = :id", String.class)
                            .setParameter("id", seat.id())
                            .getSingleResult();
                    if (nftUrl == null) {
                        throw new RuntimeException();
                    }
                }
            }
            return dto;
        };
    }

    public ItemWriter<PerformanceAndSeatsDto> performanceIsMintedUpdater() {
        return chunk -> {
            EntityManager entityManager = catalogEntityManagerFactory.createEntityManager();
            EntityTransaction transaction = entityManager.getTransaction();
            try (entityManager) {
                transaction.begin();
                chunk.forEach(dto -> {
                    entityManager.createQuery("UPDATE Performance p SET p.isMinted = TRUE WHERE p.id = :id")
                            .setParameter("id", dto.performance().id())
                            .executeUpdate();
                });
                transaction.commit();
            } catch (RuntimeException e) {
                transaction.rollback();
            }
        };
    }
}
