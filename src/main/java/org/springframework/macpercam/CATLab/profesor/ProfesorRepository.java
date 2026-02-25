package org.springframework.macpercam.CATLab.profesor;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.macpercam.CATLab.user.Authorities;

public interface ProfesorRepository extends CrudRepository<Profesor, Integer> {

    @Query("SELECT DISTINCT profesor FROM Profesor profesor WHERE profesor.firstName LIKE CONCAT(:firstName, '%')")
	public Collection<Profesor> findByFirstName(@Param("firstName") String firstName);

    @Query("SELECT DISTINCT profesor FROM Profesor profesor WHERE profesor.user.id = :userId")
	public Optional<Profesor> findByUser(int userId);

    @Query("SELECT COUNT(p) FROM Profesor p")
	public Integer countAll();

    @Query("SELECT p.user.authority FROM Profesor p WHERE p.id = :profesorId")
    public Authorities findAuthorityByProfesorId(int profesorId);

}
