package org.springframework.macpercam.CATLab.user;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "appusers")
public class User extends BaseEntity {

	@Column(unique = true)
	String username;

	String password;

	@NotNull
	@ManyToOne(optional = false)
	@JoinColumn(name = "authority")
	Authorities authority;

	public Boolean hasAuthority(Role role) {
		return authority.getAuthority() == role;
	}

	public Boolean hasAnyAuthority(Role... roles) {
		Boolean cond = false;
		for (Role role : roles) {
			if (role == authority.getAuthority())
				cond = true;
		}
		return cond;
	}

}
