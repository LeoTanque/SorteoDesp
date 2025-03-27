package com.example.rifa.services;

import com.example.rifa.entity.CodigoVip;
import com.example.rifa.entity.Participante;
import com.example.rifa.entity.Rifa;
import com.example.rifa.entity.Usuario;
import com.example.rifa.exception.ResourceNotFoundException;
import com.example.rifa.repository.CodigoVipRepository;
import com.example.rifa.repository.ParticipanteRepository;
import com.example.rifa.repository.RifaRepository;
import com.example.rifa.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class RifaService {
    private final RifaRepository rifaRepository;
    private final UsuarioRepository usuarioRepository;
    //private final RaffleImageGenerator imageGenerator;
    //private final String imageDirectory = "src/main/resources/static/images/";
    @Autowired
    private CodigoVipRepository codigoVipRepository;
    @Autowired
    public RifaService(RifaRepository rifaRepository, UsuarioRepository usuarioRepository) {
        this.rifaRepository = rifaRepository;
        this.usuarioRepository = usuarioRepository;


    }


    @Autowired
    private ParticipanteRepository participanteRepository;




    public Rifa crearRifa(Rifa rifa, String codigoVip) {
        // Verificar si el usuario existe
        Usuario usuario = usuarioRepository.findById(rifa.getUsuario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + rifa.getUsuario().getId()));

        // Manejo del código VIP (tu lógica actual)
        if (codigoVip != null) {
            if (!usuario.isEsVip()) {
                CodigoVip codigo = codigoVipRepository.findByCodigo(codigoVip)
                        .orElseThrow(() -> new IllegalArgumentException("Código VIP no válido."));
                if (codigo.isUtilizado()) {
                    throw new IllegalArgumentException("El código VIP ya fue utilizado.");
                }
                usuario.setEsVip(true);
                usuario.setCodigoVip(codigoVip);
                usuarioRepository.save(usuario);
                codigo.setUtilizado(true);
                codigoVipRepository.save(codigo);
            } else if (!usuario.getCodigoVip().equals(codigoVip)) {
                throw new IllegalArgumentException("El código VIP no corresponde al usuario.");
            }
        }

        // Genera automáticamente el código de la rifa si no se proporcionó uno
        if (rifa.getCode() == null || rifa.getCode().trim().isEmpty()) {
            rifa.setCode(generateRaffleCode());
        }

        // Verificar límites de rifas, etc. (tu lógica actual)
        int limiteRifas = usuario.isEsVip() ?
                codigoVipRepository.findByCodigo(usuario.getCodigoVip())
                        .map(CodigoVip::getCantidadRifas)
                        .orElse(Integer.MAX_VALUE)
                : 1;
        long rifasCreadas = usuario.isEsVip() ? rifaRepository.countByUsuario(usuario)
                : rifaRepository.countByUsuarioAndFechaSorteoBetween(usuario, LocalDate.now().withDayOfMonth(1), LocalDate.now().plusMonths(1).minusDays(1));
        if (rifasCreadas >= limiteRifas) {
            throw new IllegalArgumentException("Has alcanzado el límite de rifas permitidas.");
        }

        // Asignar el usuario y activar la rifa
        rifa.setUsuario(usuario);
        rifa.setActive(true);
        return rifaRepository.save(rifa);
    }


   /* public Rifa crearRifa(Rifa rifa, String codigoVip) {
        // Verificar si el usuario existe
        Usuario usuario = usuarioRepository.findById(rifa.getUsuario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + rifa.getUsuario().getId()));

        // Manejo del código VIP (tu lógica actual)
        if (codigoVip != null) {
            if (!usuario.isEsVip()) {
                CodigoVip codigo = codigoVipRepository.findByCodigo(codigoVip)
                        .orElseThrow(() -> new IllegalArgumentException("Código VIP no válido."));
                if (codigo.isUtilizado()) {
                    throw new IllegalArgumentException("El código VIP ya fue utilizado.");
                }
                usuario.setEsVip(true);
                usuario.setCodigoVip(codigoVip);
                usuarioRepository.save(usuario);
                codigo.setUtilizado(true);
                codigoVipRepository.save(codigo);
            } else if (!usuario.getCodigoVip().equals(codigoVip)) {
                throw new IllegalArgumentException("El código VIP no corresponde al usuario.");
            }
        }

        // Genera automáticamente el código de la rifa si no se proporcionó uno
        if (rifa.getCode() == null || rifa.getCode().trim().isEmpty()) {
            rifa.setCode(generateRaffleCode());
        }

        // Verificar límites de rifas
        int limiteRifas = usuario.isEsVip() ?
                codigoVipRepository.findByCodigo(usuario.getCodigoVip())
                        .map(CodigoVip::getCantidadRifas)
                        .orElse(Integer.MAX_VALUE)
                : 1;
        long rifasCreadas = usuario.isEsVip() ? rifaRepository.countByUsuario(usuario)
                : rifaRepository.countByUsuarioAndFechaSorteoBetween(usuario,
                LocalDate.now().withDayOfMonth(1),
                LocalDate.now().plusMonths(1).minusDays(1));
        if (rifasCreadas >= limiteRifas) {
            throw new IllegalArgumentException("Has alcanzado el límite de rifas permitidas.");
        }

        // Asignar el usuario y activar la rifa
        rifa.setUsuario(usuario);
        rifa.setActive(true);
        Rifa nuevaRifa = rifaRepository.save(rifa);

        // Generar la imagen de la rifa en el servidor
        try {
            RaffleImageGenerator generator = new RaffleImageGenerator();
            // Define el directorio de salida para las imágenes (ajusta según tu entorno)
            String outputDir = "/app/raffle-images";
            File dir = new File(outputDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            // Llama al generador de imagen pasando los datos necesarios
            // Asegúrate de que rifa.getPrecio() retorne un BigDecimal válido.
            generator.generateRaffleImage(
                    nuevaRifa.getNombre(),
                    nuevaRifa.getProducto().getNombre(),
                    nuevaRifa.getProducto().getDescripcion(),
                    nuevaRifa.getPrecio(),
                    outputDir
            );
        } catch (IOException e) {
            // Manejo de error en la generación de imagen: se registra el error y continúa
            e.printStackTrace();
        }

        return nuevaRifa;
    }*/


    // Método auxiliar para generar un código único para la rifa
    private String generateRaffleCode() {
        // Por ejemplo, "R-" seguido de 4 caracteres del UUID
        return "R-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public Rifa obtenerRifaPorId(Long id) {
        return rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));
    }

    public List<Rifa> obtenerTodasLasRifas() {
        return rifaRepository.findAll();
    }

    public Rifa actualizarRifa(Long id, Rifa rifaActualizada) {
        Rifa rifaExistente = rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));

        rifaExistente.setNombre(rifaActualizada.getNombre());
        rifaExistente.setCantidadParticipantes(rifaActualizada.getCantidadParticipantes());
        rifaExistente.setFechaSorteo(rifaActualizada.getFechaSorteo());
        rifaExistente.setUsuario(rifaActualizada.getUsuario());
        rifaExistente.setProducto(rifaActualizada.getProducto());
        rifaExistente.setActive(rifaActualizada.isActive());
        rifaExistente.setPrecio(rifaActualizada.getPrecio());
        return rifaRepository.save(rifaExistente);
    }

   /* public void eliminarRifa(Long id) {
        Rifa rifa = rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));
        // Verifica si existen participantes asociados a esta rifa

        rifaRepository.delete(rifa);
    }*/ 

    /*public void eliminarRifa(Long id) {
        // Buscar la rifa por ID
        Rifa rifa = rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));

        // Verificar si existen participantes asociados a esta rifa
        List<Participante> participantes = participanteRepository.findByRaffleId(id);
        if (!participantes.isEmpty()) {
            // No se permite eliminar la rifa si tiene participantes reservados
            throw new IllegalArgumentException("No se puede eliminar la rifa porque tiene participantes reservados. Elimine los participantes primero.");
        }

        // Si no hay participantes, eliminar la rifa (esto eliminará también el producto asociado gracias a cascade)
        rifaRepository.delete(rifa);
    }*/

    public void eliminarRifa(Long id) {
        // Buscar la rifa por ID
        Rifa rifa = rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));

        // Eliminar todos los participantes asociados a esta rifa
        List<Participante> participantes = participanteRepository.findByRaffleId(id);
        if (!participantes.isEmpty()) {
            participanteRepository.deleteAll(participantes);
        }

        // Eliminar la rifa (esto también eliminará el producto asociado si está configurado con CascadeType.ALL)
        rifaRepository.delete(rifa);
    }

    // Obtener todas las rifas de un usuario por su ID
    public List<Rifa> obtenerRifasPorUsuarioId(Long usuarioId) {
        // Verificar si el usuario existe (opcional, dependiendo de tu lógica)
        // usuarioRepository.findById(usuarioId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));

        // Obtener las rifas del usuario
        List<Rifa> rifas = rifaRepository.findByUsuarioId(usuarioId);
        if (rifas.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron rifas para el usuario con ID: " + usuarioId);
        }
        return rifas;
    }



}
