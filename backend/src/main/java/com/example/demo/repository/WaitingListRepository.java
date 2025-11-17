package com.example.demo.repository;

import com.example.demo.model.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {
    List<WaitingList> findByBarberIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
            Long barberId, LocalDate dataRichiesta, WaitingList.StatoListaAttesa stato);
    
    List<WaitingList> findByCustomerIdAndStato(Long customerId, WaitingList.StatoListaAttesa stato);
    
    Optional<WaitingList> findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
            Long barberId, Long serviceId, LocalDate dataRichiesta, WaitingList.StatoListaAttesa stato);
    
    List<WaitingList> findByCustomerId(Long customerId);
}
