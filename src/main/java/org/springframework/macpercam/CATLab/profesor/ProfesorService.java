package org.springframework.macpercam.CATLab.profesor;

import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfesorService {

    private ProfesorRepository pr;

    @Autowired
    public ProfesorService(ProfesorRepository pr) {
        this.pr = pr;
    }

    @Transactional(readOnly = true)
    public Iterable<Profesor> findAll() throws DataAccessException {
        return pr.findAll();
    }

    @Transactional(readOnly = true)
    public Collection<Profesor> findProfesorByFirstName(String firstName) throws DataAccessException {
        return pr.findByFirstName(firstName);
    }

    @Transactional(readOnly = true)
    public Profesor findProfesorById(int id) throws DataAccessException {
        return pr.findById(id).orElseThrow(() -> new ResourceNotFoundException("Profesor", "ID", id));
    }

    @Transactional(readOnly = true)
    public Optional<Profesor> findProfesorByUserId(int userId) throws DataAccessException {
        return pr.findByUser(userId);
    }

    @Transactional
	public Profesor saveProfesor(Profesor profesor) throws DataAccessException {
		pr.save(profesor);
		return profesor;
	}

	@Transactional
	public Profesor updateProfesor(Profesor profesor, int id) throws DataAccessException {
		Profesor toUpdate = findProfesorById(id);
		BeanUtils.copyProperties(profesor, toUpdate, "id", "user");
		return saveProfesor(toUpdate);
	}

	@Transactional
	public void deleteProfesor(int id) throws DataAccessException {
		Profesor toDelete = findProfesorById(id);
		pr.delete(toDelete);
	}


}
