package org.springframework.macpercam.CATLab.tm;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface TuRepository extends CrudRepository<Tu, Integer> {

    @Query("SELECT t FROM Tu t WHERE t.tm.id = :tmId")
    public List<Tu> findByTmId(Integer tmId);

}
