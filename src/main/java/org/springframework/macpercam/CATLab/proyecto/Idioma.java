package org.springframework.macpercam.CATLab.proyecto;

import org.springframework.macpercam.CATLab.model.NamedEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "idiomas")
public class Idioma extends NamedEntity {

}
