package com.example.rifa.services;

import com.example.rifa.entity.Participante;
import com.example.rifa.exception.ResourceNotFoundException;
import com.example.rifa.repository.ParticipanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipanteService {
    @Autowired
    private ParticipanteRepository participanteRepository;

    // Obtener todos los participantes
    public List<Participante> getAllParticipantes() {
        return participanteRepository.findAll();
    }

    // Obtener participantes filtrados por el id de la rifa
    public List<Participante> getParticipantesByRaffleId(Long raffleId) {
        return participanteRepository.findByRaffleId(raffleId);
    }

    // Obtener un participante por su ID
    public Participante getParticipanteById(Long id) {
        return participanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participante no encontrado con ID: " + id));
    }





    // Crear un nuevo participante
    public Participante createParticipante(Participante participante) {
        return participanteRepository.save(participante);
    }

    // Actualizar un participante existente
    public Participante updateParticipante(Long id, Participante participanteDetails) {
        Participante participante = getParticipanteById(id);
        participante.setName(participanteDetails.getName());
        participante.setLastName(participanteDetails.getLastName());
        participante.setPhone(participanteDetails.getPhone());
        participante.setDni(participanteDetails.getDni());
        participante.setCode(participanteDetails.getCode());
        participante.setReservedNumber(participanteDetails.getReservedNumber());
        participante.setRaffleId(participanteDetails.getRaffleId());
        return participanteRepository.save(participante);
    }
    // Eliminar un participante
    public void deleteParticipante(Long id) {
        Participante participante = getParticipanteById(id);
        participanteRepository.delete(participante);
    }




}
