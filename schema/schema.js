//contains all of the knowledge for telling graphql exacty what the apps data looks like, what properties each object has and how it's related to each other

//user has a firstName, reference to a company and position, and an id

//company has a id, name, description

//position has a id, name and description

const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType, //correct capitalization is important //instructs graphql of the presence of a user (id, firstName)
    GraphQLString, //types of data imported string
    GraphQLInt, // type of data imported integer
    GraphQLSchema, //takes in rootquery and returns a schema
    GraphQLList, //tells GraphQL to expect a list of objects
    GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
        name: 'Company',
        fields: () => ({
            id: { type: GraphQLString },
            name: { type: GraphQLString },
            description: {type: GraphQLString },
            users:{
                type: new GraphQLList(UserType), //expect a list of users associated with a single company
                resolve(parentValue, args){
                    return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(resp => resp.data);
                }
            }
        })
}) //must be defined before the UserType

const UserType = new GraphQLObjectType({ 
        name: 'User', //string describing the type you define. capitalize the name string User
        fields: () => ({ //most important property here, tells graphql all the properties that the user has
            id: { type: GraphQLString }, //type of value required, in this case string
            firstName: { type: GraphQLString }, //type string
        age: { type: GraphQLInt }, // integer type
        company: {
            type: CompanyType,
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                .then(resp => resp.data);
            }
          }
        })
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
                return axios.get(`http://localhost:3000/users/${args.id}`) //axios is a replacement for fetch, when the promise resolves it has the actual response nested on the data object. Bad news: graphql does not know the data is nested....
                .then(resp => resp.data); //says make the request, then before anything happesn with teh promise, take only response and return resp.data. so only see the data that came back from the response. 
                
            } // give me the id of the user you are looking for then return the user you are looking for. args specified what arguments are required for the root query
        },
        company: {
            type: CompanyType, 
            args: {id: {type: GraphQLString }},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(resp => resp.data); //only return the data not the entire response object
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser:{ //name of mutation describes mutation that will take place
            type: UserType, //type of data that you will return from the resolve function, however sometimes when mutation might not be the same as the data  
            args: { // all the same required fields as User 
                firstName: {type: new GraphQLNonNull(GraphQLString)}, //non null requires that someone provide a value for the field
                age: {type: new GraphQLNonNull(GraphQLInt)},
                companyId: {type: GraphQLString }
            }, 
            resolve(parentValue, { firstName, age }){
                return axios.post(`http://localhost:3000/users`, { firstName, age})
                .then(resp => resp.data)
            }
        },
        deleteUser:{
            type: UserType, 
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            }, 
            resolve(parentValue, { id }){
                return axios.delete(`http://localhost:3000/users/${id}`, {id})
                .then(resp => resp.data)
            }
        },
        editUser:{
            type: UserType, 
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: {type: GraphQLString},
                age: {type: GraphQLString},
                companyId: {type: GraphQLString}
            },
                resolve(parentValue, args){
                    return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data)
                }
            }
        }
})
module.exports = new GraphQLSchema({//make this exportable 
    query: RootQuery,
    mutation
});
