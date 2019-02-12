const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

app.use('/graphql', expressGraphQL({ // app.use is how we wire up middleware to an express application
	schema, 
	graphiql: true //only intended for use in dev environment // need to include a schema in this section as well as options
}));

app.listen(4000, () => {
	console.log('Listening');
})