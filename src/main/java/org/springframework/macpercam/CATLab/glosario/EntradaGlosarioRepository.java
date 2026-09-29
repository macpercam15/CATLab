package org.springframework.macpercam.CATLab.glosario;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface EntradaGlosarioRepository extends CrudRepository<EntradaGlosario, Integer> {

    @Query("SELECT e FROM EntradaGlosario e WHERE e.glosario.id = :glosarioId")
    public List<EntradaGlosario> getAllEntradasByGlosarioId(@Param("glosarioId") int glosarioId);

    @Query("SELECT e FROM EntradaGlosario e WHERE e.glosario.id = :glosarioId AND LOWER(e.origen) = LOWER(:origen)")
    Optional<EntradaGlosario> findByGlosarioIdAndOrigen(@Param("glosarioId") int glosarioId, @Param("origen") String origen);
}
