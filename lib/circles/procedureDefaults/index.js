const fs = require("fs");
const path = require("path");

const readFileSync = (file) => fs.readFileSync(path.join(__dirname, file), "utf8");

module.exports = {
    role: {
        election: readFileSync("role/election.md"),
        evaluation: readFileSync("role/evaluation.md")
    },
    task: readFileSync("task.md"),
    topic: {
        exploration: readFileSync("topic/exploration.md"),
        pictureForming: readFileSync("topic/pictureForming.md"),
        proposalShaping: readFileSync("topic/proposalShaping.md"),
        decisionMaking: readFileSync("topic/decisionMaking.md"),
        agreement: readFileSync("topic/agreement.md")
    },
    agreementEvaluation: readFileSync("agreementEvaluation.md")
}
