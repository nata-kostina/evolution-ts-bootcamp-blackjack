import { AppServer } from './AppServer.js';

(function init () {
  try {
    const server = new AppServer('http://localhost:3001');
    server.listen();
  } catch (error) {
    console.log(error);
  }
})();
