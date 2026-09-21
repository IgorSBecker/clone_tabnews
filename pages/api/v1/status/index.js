import database from "../../../../infra/database.js";

function status(request, response) {
  console.log(database);
  response
    .status(200)
    .json({ chave: "Alunos do curso.dev são pessoas acima da media" });
}
export default status;
