package org.springframework.macpercam.CATLab.proyecto;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "documentos")
public class Documento extends BaseEntity {

    private String nombreOriginal;
    private String nombreAlmacenado;
    private String ruta;
    private String tipoMime;
    private Long tamanyo;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "proyecto_id", referencedColumnName = "id")
    private Proyecto proyecto;

}
