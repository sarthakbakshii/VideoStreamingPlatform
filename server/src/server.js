const dotenv = require("dotenv");
dotenv.config();

const app = require("./app.js");

app.listen(3000, () => {
  console.log("Server running on 3000");
});
