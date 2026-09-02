package org.springframework.macpercam.CATLab.estudiante;

import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.macpercam.CATLab.model.Person;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.macpercam.CATLab.user.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    @JsonIgnore
    @ManyToMany(mappedBy = "estudiantes")
    private Set<Proyecto> proyectos;

    /*
    @ManyToMany(mappedBy = "estudiantes")
    List<Clase> clases;
    */

}