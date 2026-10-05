package org.springframework.macpercam.CATLab.proyecto;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface ProyectoRepository extends CrudRepository<Proyecto, Integer> {

    @Query ("SELECT p FROM Proyecto p WHERE p.tm.id = :tmId")
    List<Proyecto> findByTmId(Integer tmId);

}
