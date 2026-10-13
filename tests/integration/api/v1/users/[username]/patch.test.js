import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "GET",
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@curso.dev",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@curso.dev",
          password: "senha123",
        }),
      });
      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@curso.dev",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email@curso.dev",
          password: "senha123",
        }),
      });
      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@curso.dev",
          }),
        },
      );
      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique1",
          email: "unique1@curso.dev",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/unique1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique2",
          }),
        },
      );
      expect(response3.status).toBe(200);

      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "unique2",
        email: "unique1@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });
      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();

      expect(response3Body.updated_at > response3Body.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueemail1",
          email: "uniqueemail1@curso.dev",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemail2@curso.dev",
          }),
        },
      );
      expect(response3.status).toBe(200);

      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "uniqueemail1",
        email: "uniqueemail2@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });
      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();
      console.log(response3Body);
      expect(response3Body.updated_at > response3Body.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "senha1",
          email: "senha1@curso.dev",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/senha1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "senhaNova",
          }),
        },
      );
      expect(response3.status).toBe(200);

      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "senha1",
        email: "senha1@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });
      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();
      console.log(response3Body);
      expect(response3Body.updated_at > response3Body.created_at).toBe(true);
      const correctPasswordMatch = await password.compare(
        "senhaNova",
        response3Body.password,
      );
      expect(correctPasswordMatch).toBe(true);
    });
  });
});
