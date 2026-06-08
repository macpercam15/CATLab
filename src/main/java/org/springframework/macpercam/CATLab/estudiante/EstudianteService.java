package org.springframework.macpercam.CATLab.estudiante;

import java.util.Collection;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.administrador.Administrador;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstudianteService {

    private EstudianteRepository pr;

    @Autowired
    public EstudianteService(EstudianteRepository pr) {
        this.pr = pr;
    }

    @Transactional(readOnly = true)
    public Iterable<Estudiante> findAll() throws DataAccessException {
        return pr.findAll();
    }

    @Transactional(readOnly = true)
    public Collection<Estudiante> findEstudianteByFirstName(String firstName) throws DataAccessException {
        return pr.findByFirstName(firstName);
    }

    @Transactional(readOnly = true)
    public Estudiante findEstudianteById(int id) throws DataAccessException {
        return pr.findById(id).orElseThrow(() -> new ResourceNotFoundException("Estudiante", "ID", id));
    }

    @Transactional(readOnly = true)
    public Optional<Estudiante> findEstudianteByUserId(int userId) throws DataAccessException {
        return pr.findByUser(userId);
    }

    @Transactional
	public Estudiante saveEstudiante(Estudiante estudiante) throws DataAccessException {
		pr.save(estudiante);
		return estudiante;
	}

	@Transactional
	public void deleteEstudianteByUserId(int userId) throws DataAccessException {
		Optional<Estudiante> toDelete = findEstudianteByUserId(userId);
		if (toDelete.isPresent()) {
			pr.delete(toDelete.get());
		} else {
            throw new ResourceNotFoundException("Estudiante", "User ID", userId);
        }
	}


}
