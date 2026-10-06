package org.springframework.macpercam.CATLab.tm;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface TmRepository extends CrudRepository<Tm, Integer> {

    @Query("SELECT t FROM Tm t WHERE t.estudiante.id = :studentId")
    List<Tm> findByStudentId(Integer studentId);

}
