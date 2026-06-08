package org.springframework.macpercam.CATLab.administrador;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.macpercam.CATLab.user.Authorities;

public interface AdministradorRepository extends CrudRepository<Administrador, Integer> {

    @Query("SELECT DISTINCT administrador FROM Administrador administrador WHERE administrador.firstName LIKE CONCAT(:firstName, '%')")
    public Collection<Administrador> findByFirstName(@Param("firstName") String firstName);

    @Query("SELECT DISTINCT administrador FROM Administrador administrador WHERE administrador.user.id = :userId")
	public Optional<Administrador> findByUser(int userId);

    @Query("SELECT COUNT(p) FROM Administrador p")
	public Integer countAll();

    @Query("SELECT p.user.authority FROM Administrador p WHERE p.id = :administradorId")
    public Authorities findAuthorityByAdministradorId(int administradorId);

    @Query("SELECT DISTINCT administrador FROM Administrador administrador WHERE administrador.email = :email")
    public java.util.Optional<Administrador> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

}
