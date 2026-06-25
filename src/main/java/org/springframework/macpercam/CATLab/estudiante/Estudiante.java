package org.springframework.macpercam.CATLab.estudiante;

import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.macpercam.CATLab.model.Person;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.macpercam.CATLab.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "estudiantes")
public class Estudiante extends Person {

    @OneToOne(cascade = {CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST})
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    User user;

    @ManyToMany(mappedBy = "estudiantes")
    private Set<Proyecto> proyectos;

    /*
    @ManyToMany(mappedBy = "estudiantes")
    List<Clase> clases;
    */

}