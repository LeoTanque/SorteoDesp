package com.example.rifa.services;

import com.example.rifa.entity.CodigoVip;
import com.example.rifa.entity.Rifa;
import com.example.rifa.entity.Usuario;
import com.example.rifa.exception.ResourceNotFoundException;
import com.example.rifa.repository.CodigoVipRepository;
import com.example.rifa.repository.RifaRepository;
import com.example.rifa.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RifaService {
    private final RifaRepository rifaRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    private CodigoVipRepository codigoVipRepository;
    @Autowired
    public RifaService(RifaRepository rifaRepository, UsuarioRepository usuarioRepository) {
        this.rifaRepository = rifaRepository;
        this.usuarioRepository = usuarioRepository;
    }



    public Rifa crearRifa1(Rifa rifa, String codigoVip) {
        // Verificar si el usuario existe
        Usuario usuario = usuarioRepository.findById(rifa.getUsuario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + rifa.getUsuario().getId()));


        // Verificar si se proporcionó un código VIP
        if (codigoVip != null) {
            // Validar si el usuario ya es VIP
            if (!usuario.isEsVip()) {
                // Buscar el código VIP en la base de datos
                CodigoVip codigo = codigoVipRepository.findByCodigo(codigoVip)
                        .orElseThrow(() -> new IllegalArgumentException("Código VIP no válido."));

                // Verificar si el código ya fue utilizado
                if (codigo.isUtilizado()) {
                    throw new IllegalArgumentException("El código VIP ya fue utilizado.");
                }

                // Asignar el código VIP al usuario
                usuario.setEsVip(true);
                usuario.setCodigoVip(codigoVip);
                usuarioRepository.save(usuario);

                // Marcar el código como utilizado
                codigo.setUtilizado(true);
                codigoVipRepository.save(codigo);

            } else if (!usuario.getCodigoVip().equals(codigoVip)) {
                // Si el usuario es VIP pero el código proporcionado no coincide con su código VIP
                throw new IllegalArgumentException("El código VIP no corresponde al usuario.");
            }
        }

        // Verificar si el usuario es VIP
        if (usuario.isEsVip()) {
            // Usuario VIP puede crear múltiples rifas
            rifa.setUsuario(usuario);
            rifa.setActive(true); // La rifa se crea como activa por defecto
            return rifaRepository.save(rifa);
        } else {
            // Usuario normal solo puede crear una rifa por mes
            LocalDate inicioMes = LocalDate.now().withDayOfMonth(1); // Primer día del mes
            LocalDate finMes = inicioMes.plusMonths(1); // Primer día del siguiente mes

            List<Rifa> rifasDelMes = rifaRepository.findByUsuarioAndFechaSorteoBetween(usuario, inicioMes, finMes);
            if (rifasDelMes.size() >= 1) {
                throw new IllegalArgumentException("Si desea crear mas rifas debe obtener un codigo VIP.");
            }

            rifa.setUsuario(usuario);
            rifa.setActive(true);
            return rifaRepository.save(rifa);
        }
    }

    public Rifa crearRifa(Rifa rifa, String codigoVip) {
        // Verificar si el usuario existe
        Usuario usuario = usuarioRepository.findById(rifa.getUsuario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + rifa.getUsuario().getId()));

        // Manejo del código VIP
        if (codigoVip != null) {
            if (!usuario.isEsVip()) {
                CodigoVip codigo = codigoVipRepository.findByCodigo(codigoVip)
                        .orElseThrow(() -> new IllegalArgumentException("Código VIP no válido."));

                if (codigo.isUtilizado()) {
                    throw new IllegalArgumentException("El código VIP ya fue utilizado.");
                }

                // Marcar el usuario como VIP con el código
                usuario.setEsVip(true);
                usuario.setCodigoVip(codigoVip);
                usuarioRepository.save(usuario);

                // Marcar el código como utilizado
                codigo.setUtilizado(true);
                codigoVipRepository.save(codigo);
            } else if (!usuario.getCodigoVip().equals(codigoVip)) {
                throw new IllegalArgumentException("El código VIP no corresponde al usuario.");
            }
        }

        // Verificar si el usuario es VIP y obtener límite de rifas
        int limiteRifas = usuario.isEsVip() ?
                codigoVipRepository.findByCodigo(usuario.getCodigoVip())
                        .map(CodigoVip::getCantidadRifas) // Aquí se usa `getCantidadRifas` en lugar de `getLimiteRifas`
                        .orElse(Integer.MAX_VALUE) // Si no hay límite definido, permite rifas ilimitadas
                : 1; // Si no es VIP, solo puede crear 1 rifa por mes

        // Contar rifas creadas en el período correspondiente
        long rifasCreadas;
        if (usuario.isEsVip()) {
            rifasCreadas = rifaRepository.countByUsuario(usuario);
        } else {
            LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
            LocalDate finMes = inicioMes.plusMonths(1).minusDays(1);
            rifasCreadas = rifaRepository.countByUsuarioAndFechaSorteoBetween(usuario, inicioMes, finMes);
        }

        // Verificar si puede crear más rifas
        if (rifasCreadas >= limiteRifas) {
            throw new IllegalArgumentException("Has alcanzado el límite de rifas permitidas.");
        }

        // Crear la rifa
        rifa.setUsuario(usuario);
        rifa.setActive(true);
        return rifaRepository.save(rifa);
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

        return rifaRepository.save(rifaExistente);
    }

    public void eliminarRifa(Long id) {
        Rifa rifa = rifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rifa no encontrada con ID: " + id));
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
