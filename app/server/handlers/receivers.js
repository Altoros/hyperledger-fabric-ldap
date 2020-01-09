const fs = require('fs');
const path = require('path');

module.exports = [
  {
    method: 'get',
    path: '/api/receivers',
    handler: async () => {
      // TODO: check for role Executor
      const receivers = fs.readFileSync(path.resolve(__dirname, '../', '../', 'artifacts/', 'api-configs/', './receivers.json'));
      return JSON.parse(receivers);
    }
  }
];
