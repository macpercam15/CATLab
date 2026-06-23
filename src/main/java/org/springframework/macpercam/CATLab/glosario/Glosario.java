package org.springframework.macpercam.CATLab.glosario;

import java.util.List;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "glosarios")
@Entity
public class Glosario extends BaseEntity{

}
