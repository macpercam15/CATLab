package org.springframework.samples.petclinic.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Comprehensive access control tests for the security system
 * Tests role-based access control across different endpoints
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@DisplayName("Access Control Security Tests")
public class AccessControlSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();
    }

    // ========== Public Endpoints Tests ==========

    @Test
    @DisplayName("Public endpoints should be accessible without authentication - Swagger UI")
    void testSwaggerUIPublicAccess() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoints should be accessible without authentication - OpenAPI docs")
    void testOpenAPIPublicAccess() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoints should be accessible without authentication - Clinics list")
    void testClinicsListPublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/clinics"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoints should be accessible without authentication - Plan")
    void testPlanPublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/plan"))
            .andExpect(status().isOk());
    }

    // ========== Admin-Only Endpoints Tests ==========

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should access clinic owners list")
    void testAdminCanAccessClinicOwnersList() throws Exception {
        mockMvc.perform(get("/api/v1/clinicOwners/all"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not access clinic owners list")
    void testOwnerCannotAccessClinicOwnersList() throws Exception {
        mockMvc.perform(get("/api/v1/clinicOwners/all"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should access pet statistics")
    void testAdminCanAccessPetStats() throws Exception {
        mockMvc.perform(get("/api/v1/pets/stats"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "vet1", authorities = "VET")
    @DisplayName("VET should not access pet statistics")
    void testVetCannotAccessPetStats() throws Exception {
        mockMvc.perform(get("/api/v1/pets/stats"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should access vet statistics")
    void testAdminCanAccessVetStats() throws Exception {
        mockMvc.perform(get("/api/v1/vets/stats"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "clinicOwner1", authorities = "CLINIC_OWNER")
    @DisplayName("CLINIC_OWNER should not access vet statistics")
    void testClinicOwnerCannotAccessVetStats() throws Exception {
        mockMvc.perform(get("/api/v1/vets/stats"))
            .andExpect(status().isForbidden());
    }

    // ========== Authenticated-Only Endpoints Tests ==========

    @Test
    @DisplayName("Unauthenticated user should not access pets")
    void testUnauthenticatedCannotAccessPets() throws Exception {
        mockMvc.perform(get("/api/v1/pets"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("Authenticated OWNER should access pets")
    void testAuthenticatedOwnerCanAccessPets() throws Exception {
        mockMvc.perform(get("/api/v1/pets"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "vet1", authorities = "VET")
    @DisplayName("Authenticated VET should access pets")
    void testAuthenticatedVetCanAccessPets() throws Exception {
        mockMvc.perform(get("/api/v1/pets"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unauthenticated user should not access visits")
    void testUnauthenticatedCannotAccessVisits() throws Exception {
        mockMvc.perform(get("/api/v1/visits"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("Authenticated user should access visits")
    void testAuthenticatedUserCanAccessVisits() throws Exception {
        mockMvc.perform(get("/api/v1/visits"))
            .andExpect(status().isOk());
    }
}
