const express = require("express");
const {
    ApolloServer,
    gql
} = require('apollo-server-express');
const lo = require('lodash');
const moment = require('moment');

const Trucks = []
const Jobs = []
const JobsQued = []
const typeDefs = gql `

type Job {
    id: String!
    name: String!
    dateOfMove: String!
    startTime: Int!
    estimatedTime: Int!
}

type Truck {
    id: String!
    name: String!
    startTime: Int!
    endTime: Int!
    totalHours:Int!
}

type JobQue {
    id: String!
    date: String!
    jobName: String!
    jobID: String!
    estimatedTime: Int!
    startTime: Int!
    truckID: String!
    truckName: String!
}

  # the schema allows the following query:
type Query {
    JobQue: [JobQue]
    Jobs: [Job]
    Trucks: [Truck]
}

  # this schema allows the following mutation:
type Mutation {
    JobQue (
      dateKey: String
      jobID: String
      truckID: String
    ): JobQue
    Job (
      name: String!
      dateOfMove: String!
      startTime: Int!
      estimatedTime: Int!
    ): Job
    Truck (
      name: String!
      startTime: Int!
      endTime: Int!
    ): Truck
}
  `;

const checkTruck = function(truck, job, date, jobQueID) {
    const currentTruck = Trucks.length ? lo.find(Trucks, {
        id: truck
    }):null
    const currentJob = Jobs.length ? lo.find(Jobs, {
        id: job
    }):null 
    const currentJobQue = JobsQued.length ? lo.find(JobsQued, {
        id: jobQueID,
        date: date
    }):null 

    const currentDayTruckUsage = JobsQued.length ? lo.find(JobsQued, {
        id: jobQueID,
        truck: truck.id
    }):null
    if (!currentTruck) {
        throw new Error(`Couldn't find the current ${truckId}`);
    }
    if (currentDayTruckUsage) {
        let allofTruckCurrenHours = 0
        currentDayTruckUsage.map((value, index) => {
            allofTruckCurrenHours += value.estimatedTime
        })
        if (0 > (allofTruckCurrenHours - currentTruck.totalHours)) {
            throw new Error(`Current truck ${truck.name} is unavailable`);
        }
    }
    const _job = {
        id: jobQueID,
        date: date,
        jobName: currentJob.name,
        jobID: currentJob.id,
        estimatedTime: currentJob.estimatedTime,
        startTime: currentJob.startTime,
        truckID: currentTruck.id,
        truckName: currentTruck.name
    }
    JobsQued.push(_job)
    return _job
}

const getUniqueID = _ => require('crypto').randomBytes(10).toString('hex')


const resolvers = {
    Query: {
        JobQue: () => JobsQued,
        Jobs: () => Jobs,
        Trucks: () => Trucks,
    },
    Mutation: {
        JobQue: (_, {
            dateKey,
            jobID,
            truckID
        }) => {
            const jobQue = JobsQued.length ? lo.find(JobsQued, {
                date: dateKey
            }):null
            if (!jobQue) {
                const currenJob = lo.find(Jobs, {
                    'id': jobID
                })
                return checkTruck(truckID, jobID, moment(currenJob.dateOfMove).format('MM-DD-YYYY'), getUniqueID())
            } else {
                jobQue.map((value, index) => {
                    return checkTruck(truckID, jobID, value.date, value.id)
                })
            }
        },
        Job: (_, {
            name,
            dateOfMove,
            startTime,
            estimatedTime
        }) => {
            const _job = {
                id: getUniqueID(),
                name: name,
                dateOfMove: dateOfMove,
                startTime: startTime,
                estimatedTime: estimatedTime
            }
            Jobs.push(_job)
            return _job
        },

        Truck: (_, {
            name,
            startTime,
            endTime
        }) => {
            // utilize military time for easy conversion on the backend
            const _truck = {
                id: getUniqueID(),
                name: name,
                startTime: startTime,
                endTime: endTime,
                totalHours: (endTime - startTime)
            }
            Trucks.push(_truck)
            return _truck
        }
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
    engine: process.env.ENGINE_API_KEY && {
        apiKey: process.env.ENGINE_API_KEY,
    }
});

const app = express();
server.applyMiddleware({
    app
});
app.get("/", (req, res) => {
    res.redirect("/graphql");
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
const port = 4000;

app.listen({
        port
    }, () =>
    console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    )
)