import colors from "colors";
import server from "./server";

const PORT = process.env.PORT || 4000;

server.listen(() => {
  console.log(colors.cyan.bold(`REST API funcionando en el puerto ${PORT}`));
});
