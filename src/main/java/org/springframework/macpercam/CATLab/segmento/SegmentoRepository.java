package org.springframework.macpercam.CATLab.segmento;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface SegmentoRepository extends CrudRepository<Segmento, Integer> {

    @Query("SELECT s FROM Segmento s WHERE s.proyecto.id = :proyectoId")
    public List<Segmento> findByProyectoId(Integer proyectoId);
}
