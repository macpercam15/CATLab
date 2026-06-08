package org.springframework.macpercam.CATLab.auth;

import java.util.ArrayList;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.auth.payload.request.SignupRequest;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.profesor.Profesor;
import org.springframework.macpercam.CATLab.user.Authorities;
import org.springframework.macpercam.CATLab.user.AuthoritiesService;
import org.springframework.macpercam.CATLab.user.User;
import org.springframework.macpercam.CATLab.user.UserService;
import org.springframework.macpercam.CATLab.profesor.ProfesorService;
import org.springframework.macpercam.CATLab.estudiante.EstudianteService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final PasswordEncoder encoder;
	private final AuthoritiesService authoritiesService;
	private final UserService userService;
	private final ProfesorService profesorService;
	private final EstudianteService estudianteService;

	@Autowired
	public AuthService(PasswordEncoder encoder, AuthoritiesService authoritiesService, UserService userService, 
		ProfesorService profesorService, EstudianteService estudianteService) {
		this.encoder = encoder;
		this.authoritiesService = authoritiesService;
		this.userService = userService;
		this.profesorService = profesorService;
		this.estudianteService = estudianteService;
	}

		// case "vet":
		// 	role = authoritiesService.findByAuthority("VET");
		// 	user.setAuthority(role);
		// 	userService.saveUser(user);
		// 	Vet vet = new Vet();
		// 	vet.setFirstName(request.getFirstName());
		// 	vet.setLastName(request.getLastName());
		// 	vet.setCity(request.getCity());
		// 	vet.setSpecialties(new ArrayList<Specialty>());
		// 	vet.setClinic(clinicService.findClinicById(request.getClinic().getId()));
		// 	vet.setUser(user);
		// 	vetService.saveVet(vet);
		// 	break;
		// case "clinic owner":
		// 	role = authoritiesService.findByAuthority("CLINIC_OWNER");
		// 	user.setAuthority(role);
		// 	userService.saveUser(user);
		// 	ClinicOwner clinicOwner = new ClinicOwner();
		// 	clinicOwner.setFirstName(request.getFirstName());
		// 	clinicOwner.setLastName(request.getLastName());
		// 	clinicOwner.setUser(user);
		// 	clinicOwnerService.saveClinicOwner(clinicOwner);
		// 	break;
		// default:
		// 	role = authoritiesService.findByAuthority("OWNER");
		// 	user.setAuthority(role);
		// 	userService.saveUser(user);
		// 	Owner owner = new Owner();
		// 	owner.setFirstName(request.getFirstName());
		// 	owner.setLastName(request.getLastName());
		// 	owner.setAddress(request.getAddress());
		// 	owner.setCity(request.getCity());
		// 	owner.setTelephone(request.getTelephone());
		// 	owner.setClinic(clinicService.findClinicById(request.getClinic().getId()));
		// 	owner.setUser(user);
		// 	ownerService.saveOwner(owner);

		
	

}
