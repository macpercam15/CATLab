package org.springframework.macpercam.CATLab.estudiante;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.macpercam.CATLab.user.Authorities;

public interface EstudianteRepository extends CrudRepository<Estudiante, Integer> {

    @Query("SELECT DISTINCT estudiante FROM Estudiante estudiante WHERE estudiante.firstName LIKE CONCAT(:firstName, '%')")
	public Collection<Estudiante> findByFirstName(@Param("firstName") String firstName);

    @Query("SELECT DISTINCT estudiante FROM Estudiante estudiante WHERE estudiante.user.id = :userId")
	public Optional<Estudiante> findByUser(int userId);

    @Query("SELECT COUNT(p) FROM Estudiante p")
	public Integer countAll();

    @Query("SELECT p.user.authority FROM Estudiante p WHERE p.id = :estudianteId")
    public Authorities findAuthorityByEstudianteId(int estudianteId);

    @Query("SELECT DISTINCT estudiante FROM Estudiante estudiante WHERE estudiante.email = :email")
    public java.util.Optional<Estudiante> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

}
