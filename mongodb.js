const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

const CONFIG = {
  remoteDb: 'mongodb://10.133.131.144:27017', // Remote connection URL
  localDb: 'mongodb://localhost:27017', // Local connection URL
  dbName: 'protean', // Database Name
  collectionName: 'project_container', // Collection name
  documentId: '5d5fd8786df95511e05e2339'
};

console.log('\n###################################################################');
console.log('\nPROGRAM: DOWNLOAD A PROJECT DETAILS FROM REMOTE MONGODB SERVER');
console.log('& SAVE INTO LOCAL MONGODB SERVER.');
console.log('\n*******************************************************************\n');
console.log('Configuration details - ');
console.log(CONFIG);

function downloadProject() {

  console.log('Connecting remote mongodb server...');

  MongoClient.connect(CONFIG.remoteDb, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {

    if (err) { return console.dir(err); }

    console.log("Connected successfully to remote mongodb server.");
    console.log("Project downloading...");

    const db = client.db(CONFIG.dbName);
    const collection = db.collection(CONFIG.collectionName);
    const query = { _id: new mongo.ObjectID(CONFIG.documentId) };

    collection.findOne(query, (err, project) => {

      if (err) { 
        console.log(err);
        client.close();
        return;
      }

      if (project) {

        console.log('Project - ' + project.projectName);

        saveProject(project);

        // project.files.forEach(file => {
        //   console.log(file);
        // });

      } else {
        console.log('Project not found!');
      }
      client.close();
    });

  });
}

function saveProject(project) {

  console.log('Connecting local mongodb server...');

  MongoClient.connect(CONFIG.remoteDb, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {

    if (err) {
      client.close();
      return console.dir(err);
    }

    console.log("Connected successfully to mongodb server.");

    const db = client.db(CONFIG.dbName);
    const collection = db.collection(CONFIG.collectionName);

    collection.insertOne(project, (err, data) => {
      if (err) {
        const query = { _id: new mongo.ObjectID(CONFIG.documentId) };
        collection.replaceOne(query, project, (err, data) => {
          if(err) {
            console.log(err);
            client.close();
          } else {
            console.log('Project updated successfully.');
            console.log('\n*******************************************************************\n\n');
            client.close();
          }
        });
      } else {
        console.log('Project created successfully.');
        console.log('\n*******************************************************************\n\n');
        client.close();
      }
    });
  });
}

downloadProject();
