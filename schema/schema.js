//contains all of the knowledge for telling graphql exacty what the apps data looks like, what properties each object has and how it's related to each other

//user has a firstName, reference to a company and position, and an id

//company has a id, name, description

//position has a id, name and description

const graphql = require('graphql');
const _ = require('lodash');

const {
    GraphQLObjectType, //correct capitalization is important //instructs graphql of the presence of a user (id, firstName)
    GraphQLString, //types of data imported string
    GraphQLInt, // type of data imported integer
    GraphQLSchema //takes in rootquery and returns a schema
} = graphql;

const users = [//adding hard coded data for resolve
    { id: '23', firstName: 'Bill', age: 20 },
    { id: '47', firstName: 'Samantha', age: 21 }
]
const UserType = new GraphQLObjectType({ 
        name: 'User', //string describing the type you define. capitalize the name string User
        fields: { //most important property here, tells graphql all the properties that the user has
            id: { type: GraphQLString }, //type of value required, in this case string
            firstName: { type: GraphQLString }, //type string
        age: { type: GraphQLInt } // integer type
        }
}); //instructs graphql that it has User type. //this object instructs graphql what a user object looks like

// all the schemas we build look similar to each other. 

const RootQuery = new GraphQLObjectType({ // graphql object type just like user and same property of name and fields
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType, 
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                //purpose is to find the data in the datastore and find the actual data you are looking for
                //actually goes in and grabs real data

                // first argument == never really being used 
                // second argument args were passed into the original query 
                return _.find(users, {id: args.id }); // returns a raw javascript object or JSON for resolve functions, walking through all users, find and return the first user that has an id that was given to the resolve function
                
            } // give me the id of the user you are looking for then return the user you are looking for. args specified what arguments are required for the root query
        }
    }
});

module.exports = new GraphQLSchema({//make this exportable 
    query: RootQuery
});
