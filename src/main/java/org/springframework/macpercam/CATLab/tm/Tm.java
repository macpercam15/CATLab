package org.springframework.macpercam.CATLab.tm;

import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.model.NamedEntity;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter 
@Setter
@Table(name = "tm")
public class Tm extends NamedEntity {
    
    @ManyToOne 
    @JoinColumn (name = "idiomaA_id", referencedColumnName = "id")
    Idioma idiomaA;
    @ManyToOne 
    @JoinColumn (name = "idiomaB_id", referencedColumnName = "id")
    Idioma idiomaB;

    @JsonIgnore
    @ManyToOne
    @JoinColumn (name = "estudiante_id", referencedColumnName = "id")
    Estudiante estudiante;

}
