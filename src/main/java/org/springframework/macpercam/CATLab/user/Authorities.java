package org.springframework.macpercam.CATLab.user;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "authorities")
public class Authorities extends BaseEntity{
	
	// @Enumerated(EnumType.STRING)
	@Column(length = 20, unique=true, nullable = false)
	String authority;
	
	
}
