package org.springframework.macpercam.CATLab.glosario;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "entradas_glosario")
@Entity
public class EntradaGlosario extends BaseEntity {

    @NotEmpty
    private String origen;

    @NotEmpty
    private String destino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "glosario_id", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE) //si quiero acceder directamnete a las entradas tengo que quitar esto y añadir en glosario el onetomany
    private Glosario glosario;

}
