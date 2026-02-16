package org.springframework.samples.petclinic.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * Authorization tests for user management endpoints
 * Tests role-based access control for user operations
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@DisplayName("User Authorization Security Tests")
public class UserAuthorizationSecurityTest {

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

    // ========== ADMIN Access Tests ==========

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should be able to list all users")
    void testAdminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should be able to filter users by authority")
    void testAdminCanFilterUsersByAuthority() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                .param("auth", "OWNER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should be able to get user by ID")
    void testAdminCanGetUserById() throws Exception {
        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.username").exists());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should be able to list all authorities")
    void testAdminCanListAuthorities() throws Exception {
        mockMvc.perform(get("/api/v1/users/authorities"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].authority").exists());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @Transactional
    @DisplayName("ADMIN should be able to create new user")
    void testAdminCanCreateUser() throws Exception {
        String newUser = "{ \"username\": \"testuser123\", \"password\": \"password123\", " +
            "\"authority\": { \"id\": 3, \"authority\": \"OWNER\" } }";

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUser))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("testuser123"));
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @Transactional
    @DisplayName("ADMIN should be able to update user")
    void testAdminCanUpdateUser() throws Exception {
        String updatedUser = "{ \"username\": \"owner1\", \"password\": \"newpass\", " +
            "\"authority\": { \"id\": 3, \"authority\": \"OWNER\" } }";

        mockMvc.perform(put("/api/v1/users/4")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUser))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @Transactional
    @DisplayName("ADMIN should be able to delete other users")
    void testAdminCanDeleteOtherUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/4"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("User deleted!"));
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should not be able to delete themselves")
    void testAdminCannotDeleteThemselves() throws Exception {
        mockMvc.perform(delete("/api/v1/users/1"))
            .andExpect(status().isForbidden());
    }

    // ========== OWNER Access Tests ==========

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to list users")
    void testOwnerCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to get user by ID")
    void testOwnerCannotGetUserById() throws Exception {
        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to create user")
    void testOwnerCannotCreateUser() throws Exception {
        String newUser = "{ \"username\": \"testuser\", \"password\": \"password\", " +
            "\"authority\": { \"id\": 3, \"authority\": \"OWNER\" } }";

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUser))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to update user")
    void testOwnerCannotUpdateUser() throws Exception {
        String updatedUser = "{ \"username\": \"owner1\", \"password\": \"newpass\" }";

        mockMvc.perform(put("/api/v1/users/4")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUser))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to delete user")
    void testOwnerCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/2"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner1", authorities = "OWNER")
    @DisplayName("OWNER should not be able to list authorities")
    void testOwnerCannotListAuthorities() throws Exception {
        mockMvc.perform(get("/api/v1/users/authorities"))
            .andExpect(status().isForbidden());
    }

    // ========== VET Access Tests ==========

    @Test
    @WithMockUser(username = "vet1", authorities = "VET")
    @DisplayName("VET should not be able to list users")
    void testVetCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "vet1", authorities = "VET")
    @DisplayName("VET should not be able to create user")
    void testVetCannotCreateUser() throws Exception {
        String newUser = "{ \"username\": \"testuser\", \"password\": \"password\" }";

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUser))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "vet1", authorities = "VET")
    @DisplayName("VET should not be able to delete user")
    void testVetCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/4"))
            .andExpect(status().isForbidden());
    }

    // ========== CLINIC_OWNER Access Tests ==========

    @Test
    @WithMockUser(username = "clinicOwner1", authorities = "CLINIC_OWNER")
    @DisplayName("CLINIC_OWNER should not be able to list users")
    void testClinicOwnerCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "clinicOwner1", authorities = "CLINIC_OWNER")
    @DisplayName("CLINIC_OWNER should not be able to create user")
    void testClinicOwnerCannotCreateUser() throws Exception {
        String newUser = "{ \"username\": \"testuser\", \"password\": \"password\" }";

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUser))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "clinicOwner1", authorities = "CLINIC_OWNER")
    @DisplayName("CLINIC_OWNER should not be able to delete user")
    void testClinicOwnerCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/4"))
            .andExpect(status().isForbidden());
    }

    // ========== Unauthenticated Access Tests ==========

    @Test
    @DisplayName("Unauthenticated user should not be able to list users")
    void testUnauthenticatedCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated user should not be able to create user")
    void testUnauthenticatedCannotCreateUser() throws Exception {
        String newUser = "{ \"username\": \"testuser\", \"password\": \"password\" }";

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUser))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated user should not be able to delete user")
    void testUnauthenticatedCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/1"))
            .andExpect(status().isUnauthorized());
    }

    // ========== Edge Case Tests ==========

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @DisplayName("ADMIN should get 404 for non-existent user")
    void testAdminGet404ForNonExistentUser() throws Exception {
        mockMvc.perform(get("/api/v1/users/99999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin1", authorities = "ADMIN")
    @Transactional
    @DisplayName("ADMIN should get 404 when deleting non-existent user")
    void testAdminGet404WhenDeletingNonExistentUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/99999"))
            .andExpect(status().isNotFound());
    }
}
