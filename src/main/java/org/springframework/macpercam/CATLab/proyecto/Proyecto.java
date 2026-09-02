package org.springframework.macpercam.CATLab.proyecto;

import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.glosario.Glosario;
import org.springframework.macpercam.CATLab.model.NamedEntity;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "proyectos")
public class Proyecto extends NamedEntity{

    @Enumerated(EnumType.STRING)
    private EstadoProyecto estado;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "glosario_id", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Glosario glosario;

    @ManyToOne
    @JoinColumn(name = "idioma_origen_id", referencedColumnName = "id")
    private Idioma idiomaOrigen;

    @ManyToOne
    @JoinColumn(name = "idioma_destino_id", referencedColumnName = "id")
    private Idioma idiomaDestino;

    @ManyToMany
    @JoinTable(
        name = "proyecto_estudiante",
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "estudiante_id")
    )
    private Set<Estudiante> estudiantes;

    @OneToOne(mappedBy = "proyecto",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Documento documento;

    /*
    TODO:
    - SEGEMENTO: (Este mejor desde su porpia entidad)
    - TM: ManyToOne (una tm pertenece a muchos proyectos, un proyecto tiene una tm)
    */

}
